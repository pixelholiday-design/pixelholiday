import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { calculateStripeFee } from "@/lib/commissions";

const PLATFORM_FEE_RATE = 0.15; // 15% for resort packages

function generateConfirmationCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/1/I
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `PXL-${year}-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packageId,
      sessionDate,
      sessionStartTime,
      groupSize = 1,
      addOnIds = [],
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      locationId,
    } = body;

    // Validate required fields
    if (!packageId || !sessionDate || !sessionStartTime || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: packageId, sessionDate, sessionStartTime, customerName, customerEmail" },
        { status: 400 },
      );
    }

    // Fetch package with add-ons
    const pkg = await prisma.photoPackage.findUnique({
      where: { id: packageId, isActive: true },
      include: { addOns: true },
    });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found or inactive" }, { status: 404 });
    }

    // Calculate pricing
    const basePrice = pkg.price;
    const selectedAddOns = pkg.addOns.filter((a) => addOnIds.includes(a.id));
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const totalPrice = Math.round((basePrice + addOnsTotal) * 100) / 100;

    // Calculate fees
    const stripeFee = calculateStripeFee(totalPrice, "STRIPE_ONLINE");
    const platformFee = Math.round(totalPrice * PLATFORM_FEE_RATE * 100) / 100;
    const netAmount = totalPrice - stripeFee;
    const photographerPayout = Math.round((netAmount - platformFee) * 100) / 100;

    // Auto-assign photographer at location
    const effectiveLocationId = locationId || pkg.locationId;
    let photographerId: string | null = null;

    if (effectiveLocationId) {
      // Find available photographers at location
      const photographers = await prisma.user.findMany({
        where: { role: "PHOTOGRAPHER", locationId: effectiveLocationId },
        select: { id: true },
      });

      if (photographers.length > 0) {
        // Simple round-robin: pick the one with fewest appointments on this date
        const dayStart = new Date(sessionDate + "T00:00:00");
        const dayEnd = new Date(sessionDate + "T23:59:59");
        const pids = photographers.map((p) => p.id);

        const counts = await prisma.appointment.groupBy({
          by: ["assignedPhotographerId"],
          where: {
            assignedPhotographerId: { in: pids },
            scheduledTime: { gte: dayStart, lte: dayEnd },
            status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          },
          _count: true,
        });

        const countMap = new Map(counts.map((c) => [c.assignedPhotographerId, c._count]));
        // Sort by fewest appointments, pick first
        pids.sort((a, b) => (countMap.get(a) ?? 0) - (countMap.get(b) ?? 0));
        photographerId = pids[0];
      }
    }

    // Generate confirmation code (retry on collision)
    let confirmationCode = generateConfirmationCode();
    let codeAttempts = 0;
    while (codeAttempts < 5) {
      const exists = await prisma.packageBooking.findUnique({
        where: { confirmationCode },
        select: { id: true },
      });
      if (!exists) break;
      confirmationCode = generateConfirmationCode();
      codeAttempts++;
    }

    // Upsert customer
    let customer = customerEmail
      ? await prisma.customer.findFirst({ where: { email: customerEmail } })
      : null;
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          whatsapp: customerPhone || null,
        },
      });
    }

    // Build scheduled datetime
    const scheduledTime = new Date(`${sessionDate}T${sessionStartTime}:00`);
    if (isNaN(scheduledTime.getTime())) {
      return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
    }

    // Transaction: create booking + appointment
    const [booking, appointment] = await prisma.$transaction(async (tx) => {
      const newAppointment = photographerId
        ? await tx.appointment.create({
            data: {
              scheduledTime,
              status: "CONFIRMED",
              assignedPhotographerId: photographerId,
              source: "PACKAGE_BOOKING",
              customerName,
              customerEmail,
              customerPhone: customerPhone || null,
              partySize: groupSize,
              sessionType: pkg.sessionType,
              estimatedDuration: pkg.duration,
              specialRequests: specialRequests || null,
              locationId: effectiveLocationId || null,
            },
          })
        : null;

      const newBooking = await tx.packageBooking.create({
        data: {
          confirmationCode,
          packageId,
          assignedPhotographerId: photographerId,
          appointmentId: newAppointment?.id || null,
          customerId: customer!.id,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          sessionDate: new Date(sessionDate),
          sessionStartTime,
          groupSize,
          specialRequests: specialRequests || null,
          basePrice,
          addOnsTotal,
          addOnsSelected: selectedAddOns.map((a) => a.name),
          totalPrice,
          currency: pkg.currency,
          platformFeeRate: PLATFORM_FEE_RATE,
          platformFee,
          photographerPayout,
          stripeFee,
          status: "PENDING",
          locationId: effectiveLocationId || null,
        },
      });

      return [newBooking, newAppointment];
    });

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pixelholiday.vercel.app";
    const lineItems = [
      {
        price_data: {
          currency: pkg.currency.toLowerCase(),
          product_data: { name: pkg.name },
          unit_amount: Math.round(basePrice * 100),
        },
        quantity: 1,
      },
      ...selectedAddOns.map((addon) => ({
        price_data: {
          currency: pkg.currency.toLowerCase(),
          product_data: { name: addon.name },
          unit_amount: Math.round(addon.price * 100),
        },
        quantity: 1,
      })),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata: {
        type: "PACKAGE_BOOKING",
        packageBookingId: booking.id,
        packageId: pkg.id,
        confirmationCode,
      },
      customer_email: customerEmail,
      success_url: `${baseUrl}/book/confirmation/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/${pkg.slug}?cancelled=true`,
    });

    // Save stripe session ID
    await prisma.packageBooking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      confirmationCode,
      stripeUrl: session.url,
      appointmentId: appointment?.id || null,
    });
  } catch (error: any) {
    console.error("Package booking error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create booking" },
      { status: 500 },
    );
  }
}
