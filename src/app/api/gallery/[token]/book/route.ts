import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyPhotographerNewBooking, sendWhatsAppMessage } from "@/lib/whatsapp";

const schema = z.object({
  scheduledTime: z.string().datetime().or(z.string().min(1)),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const when = new Date(parsed.data.scheduledTime);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid date" }, { status: 400 });
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ ok: false, error: "Scheduled time must be in the future" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    include: { photographer: true, location: true },
  });
  if (!gallery) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (gallery.expiresAt && gallery.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Gallery expired" }, { status: 410 });
  }

  const appt = await prisma.appointment.upsert({
    where: { galleryId: gallery.id },
    update: { scheduledTime: when, status: "CONFIRMED" },
    create: {
      galleryId: gallery.id,
      scheduledTime: when,
      status: "CONFIRMED",
      assignedPhotographerId: gallery.photographerId,
      source: "HOOK_GALLERY",
    },
  });

  // Real photographer notification (WhatsApp if phone available, else log)
  await notifyPhotographerNewBooking(gallery.photographer.name, appt.scheduledTime);
  if (gallery.photographer.phone) {
    await sendWhatsAppMessage(
      gallery.photographer.phone,
      `📸 New booking at ${gallery.location.name} — ${when.toLocaleString()} (gallery ${gallery.id.slice(0, 8)})`
    );
  }

  return NextResponse.json({ ok: true, appointmentId: appt.id });
}
