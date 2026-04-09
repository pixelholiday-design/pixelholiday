import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profileId,
      photographerId,
      serviceId,
      sessionType,
      sessionDate,
      sessionStartTime,
      sessionDuration,
      sessionLocation,
      occasion,
      groupSize,
      specialRequests,
      customerName,
      customerEmail,
      customerPhone,
      totalPrice,
      depositAmount,
    } = body;

    // Validate required fields
    if (!profileId || !photographerId || !sessionType || !sessionDate || !sessionStartTime || !customerName || !customerEmail || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields: profileId, photographerId, sessionType, sessionDate, sessionStartTime, customerName, customerEmail, totalPrice" },
        { status: 400 }
      );
    }

    // Validate that profileId belongs to photographerId
    const profile = await prisma.photographerProfile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });
    if (!profile || profile.userId !== photographerId) {
      return NextResponse.json(
        { error: "Profile does not belong to the specified photographer" },
        { status: 400 }
      );
    }

    // Check photographer availability for the date
    const bookingDate = new Date(sessionDate);
    bookingDate.setHours(0, 0, 0, 0);
    const availability = await prisma.photographerAvailability.findUnique({
      where: { userId_date: { userId: photographerId, date: bookingDate } },
    });
    if (availability && !availability.isAvailable) {
      return NextResponse.json(
        { error: "Photographer is not available on this date" },
        { status: 409 }
      );
    }

    // Combine date and time into a single DateTime
    const scheduledTime = new Date(`${sessionDate}T${sessionStartTime}:00`);
    if (isNaN(scheduledTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid sessionDate or sessionStartTime format" },
        { status: 400 }
      );
    }

    const [booking, appointment] = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.marketplaceBooking.create({
        data: {
          profileId,
          photographerId,
          serviceId: serviceId || null,
          sessionType,
          sessionDate: new Date(sessionDate),
          sessionStartTime,
          sessionDuration: sessionDuration || 60,
          sessionLocation: sessionLocation || null,
          occasion: occasion || null,
          groupSize: groupSize || 1,
          specialRequests: specialRequests || null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          totalPrice,
          depositAmount: depositAmount || null,
          status: "PENDING",
        },
      });

      const newAppointment = await tx.appointment.create({
        data: {
          scheduledTime,
          status: "PENDING",
          assignedPhotographerId: photographerId,
          source: "WEBSITE",
          customerName,
          customerPhone: customerPhone || null,
          customerEmail,
          partySize: groupSize || 1,
          sessionType,
          estimatedDuration: sessionDuration || 60,
          specialRequests: specialRequests || null,
        },
      });

      return [newBooking, newAppointment];
    });

    return NextResponse.json({ success: true, booking, appointment });
  } catch (error) {
    console.error("Marketplace booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
