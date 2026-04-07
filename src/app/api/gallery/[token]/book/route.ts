import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyPhotographerNewBooking } from "@/lib/whatsapp";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { scheduledTime } = await req.json();
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    include: { photographer: true },
  });
  if (!gallery) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Upsert appointment
  const appt = await prisma.appointment.upsert({
    where: { galleryId: gallery.id },
    update: { scheduledTime: new Date(scheduledTime), status: "CONFIRMED" },
    create: {
      galleryId: gallery.id,
      scheduledTime: new Date(scheduledTime),
      status: "CONFIRMED",
      assignedPhotographerId: gallery.photographerId,
      source: "HOOK_GALLERY",
    },
  });

  await notifyPhotographerNewBooking(gallery.photographer.name, appt.scheduledTime);
  return NextResponse.json({ ok: true, appointmentId: appt.id });
}
