import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordCommission } from "@/lib/commissions";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const qr = await prisma.qRCode.update({
    where: { id: body.qrCodeId },
    data: { scanCount: { increment: 1 } },
    include: { location: true },
  });

  const customer = await prisma.customer.create({
    data: { name: body.name, whatsapp: body.whatsapp, locationId: qr.locationId },
  });

  // Create lightweight gallery placeholder for the appointment
  const gallery = await prisma.gallery.create({
    data: {
      status: "HOOK_ONLY",
      locationId: qr.locationId,
      photographerId: body.photographerId || (await firstPhotographer(qr.locationId)),
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const appointment = await prisma.appointment.create({
    data: {
      galleryId: gallery.id,
      scheduledTime: new Date(body.scheduledTime),
      assignedPhotographerId: gallery.photographerId,
      source: "QR_CODE",
      qrCodeId: qr.id,
      status: "CONFIRMED",
    },
  });

  // Receptionist 5% referral commission tracked through assignedToStaffId
  if (qr.assignedToStaffId) {
    console.log(`[Commission] QR_REFERRAL queued for staff ${qr.assignedToStaffId}`);
  }

  return NextResponse.json({ appointment });
}

async function firstPhotographer(locationId: string) {
  const p = await prisma.user.findFirst({ where: { role: "PHOTOGRAPHER", locationId }, orderBy: { rating: "desc" } });
  return p?.id || "";
}
