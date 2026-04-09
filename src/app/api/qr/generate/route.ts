import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";

/**
 * POST /api/qr/generate
 * Generate a QR code. Supports optional customerId + roomNumber for hotel room QR cards.
 * Returns a booking URL guests can scan.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.locationId) {
    return NextResponse.json({ error: "locationId required" }, { status: 400 });
  }
  const code = crypto.randomBytes(8).toString("hex");
  const qr = await prisma.qRCode.create({
    data: {
      code,
      type: body.type || "WRISTBAND",
      locationId: body.locationId,
      assignedToStaffId: body.assignedToStaffId || null,
      customerId: body.customerId || null,
      roomNumber: body.roomNumber || null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.json({
    qr,
    scanUrl: `/qr/${qr.code}`,
    qrCodeUrl: `${appUrl}/book/${qr.id}`,
  });
}
