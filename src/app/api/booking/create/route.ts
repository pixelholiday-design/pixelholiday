import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppBookingConfirmation, notifyPhotographerNewBooking } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { galleryId, scheduledTime, source, photographerId?, qrCodeId? }
  const photographerId = body.photographerId || (await pickPhotographer(body.locationId));
  const appointment = await prisma.appointment.upsert({
    where: { galleryId: body.galleryId },
    update: {
      scheduledTime: new Date(body.scheduledTime),
      assignedPhotographerId: photographerId,
      source: body.source || "WALK_IN",
      qrCodeId: body.qrCodeId,
      status: "CONFIRMED",
    },
    create: {
      galleryId: body.galleryId,
      scheduledTime: new Date(body.scheduledTime),
      assignedPhotographerId: photographerId,
      source: body.source || "WALK_IN",
      qrCodeId: body.qrCodeId,
      status: "CONFIRMED",
    },
    include: { assignedPhotographer: true, gallery: { include: { customer: true } } },
  });
  if (appointment.gallery?.customer?.whatsapp) {
    await sendWhatsAppBookingConfirmation(appointment.gallery.customer.whatsapp, appointment.scheduledTime);
  }
  if (appointment.assignedPhotographer) {
    await notifyPhotographerNewBooking(appointment.assignedPhotographer.name, appointment.scheduledTime);
  }
  return NextResponse.json({ appointment });
}

async function pickPhotographer(locationId?: string) {
  const candidates = await prisma.user.findMany({
    where: { role: "PHOTOGRAPHER", ...(locationId ? { locationId } : {}) },
    orderBy: { rating: "desc" },
    take: 1,
  });
  return candidates[0]?.id;
}
