import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppBookingConfirmation } from "@/lib/whatsapp";

/**
 * POST /api/hotel/book
 * Book a photo session for a hotel guest by room number.
 */
export async function POST(req: Request) {
  try {
    const { roomNumber, locationId, time, sessionType } = await req.json();

    if (!roomNumber || !locationId || !time) {
      return NextResponse.json({ error: "roomNumber, locationId, and time required" }, { status: 400 });
    }

    // Find customer by room
    const customer = await prisma.customer.findFirst({
      where: { roomNumber, locationId },
      orderBy: { createdAt: "desc" },
    });

    if (!customer) {
      return NextResponse.json({ error: "No customer found for this room. Please check in first." }, { status: 404 });
    }

    // Find the highest-rated available photographer at this location
    const photographer = await prisma.user.findFirst({
      where: {
        locationId,
        role: "PHOTOGRAPHER",
      },
      orderBy: { rating: "desc" },
    });

    if (!photographer) {
      return NextResponse.json({ error: "No photographers available at this location" }, { status: 404 });
    }

    const scheduledTime = new Date(time);
    const confirmationCode = `PH-${Date.now().toString(36).toUpperCase()}`;

    const appointment = await prisma.appointment.create({
      data: {
        scheduledTime,
        status: "CONFIRMED",
        assignedPhotographerId: photographer.id,
        source: "PRE_ARRIVAL",
        sourceDetail: `Room ${roomNumber}`,
        customerName: customer.name,
        customerPhone: customer.whatsapp,
        customerEmail: customer.email,
        sessionType: sessionType || "STANDARD",
        locationId,
        externalRef: confirmationCode,
      },
    });

    // Notify customer via WhatsApp
    if (customer.whatsapp) {
      await sendWhatsAppBookingConfirmation(customer.whatsapp, scheduledTime);
    }

    return NextResponse.json({
      appointmentId: appointment.id,
      confirmationCode,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Booking failed" }, { status: 500 });
  }
}
