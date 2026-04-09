import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/hotel/checkin
 * Called by hotel PMS integration or reception staff.
 * Creates Customer + QRCode for the room + triggers welcome WhatsApp.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guestName, roomNumber, email, phone, checkInDate, checkOutDate, hotelLocationId } = body;

    if (!guestName || !roomNumber || !hotelLocationId) {
      return NextResponse.json({ error: "guestName, roomNumber, and hotelLocationId are required" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({ where: { id: hotelLocationId } });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Create or update customer for this room
    const customer = await prisma.customer.create({
      data: {
        name: guestName,
        email: email || null,
        whatsapp: phone || null,
        roomNumber,
        locationId: hotelLocationId,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
      },
    });

    // Generate a QR code for this room
    const qrCode = crypto.randomUUID().slice(0, 12).toUpperCase();
    const qr = await prisma.qRCode.create({
      data: {
        code: qrCode,
        type: "HOTEL_ROOM",
        locationId: hotelLocationId,
        customerId: customer.id,
        roomNumber,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrCodeUrl = `${appUrl}/book/${qr.id}`;

    // Send welcome WhatsApp
    if (phone) {
      await sendWhatsAppMessage(
        phone,
        `Welcome to ${location.name}! Scan this QR for your complimentary photo session: ${qrCodeUrl}`
      );
    }

    return NextResponse.json({
      customerId: customer.id,
      qrCodeId: qr.id,
      qrCodeUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Check-in failed" }, { status: 500 });
  }
}
