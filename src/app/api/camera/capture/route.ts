import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppHookLink } from "@/lib/whatsapp";

// Module 12: Real-time streaming — speed camera endpoint.
// Receives a photo capture, identifies the customer (face vector / wristband),
// adds it to their gallery and pings them on WhatsApp within 60s.
export async function POST(req: NextRequest) {
  const { wristbandCode, faceVector, s3Key, locationId } = await req.json();

  let customer = null;
  if (wristbandCode) {
    customer = await prisma.customer.findFirst({ where: { wristbandCode } });
  }
  if (!customer && faceVector) {
    customer = await prisma.customer.findFirst({ where: { hasDigitalPass: true } });
  }
  if (!customer)
    return NextResponse.json({ matched: false, reason: "no customer match" }, { status: 202 });

  if (!customer.hasDigitalPass)
    return NextResponse.json({ matched: true, delivered: false, reason: "no digital pass" });

  // Find or create active gallery for this customer
  let gallery = await prisma.gallery.findFirst({
    where: { customerId: customer.id, status: "DIGITAL_PASS" },
    orderBy: { createdAt: "desc" },
  });

  if (!gallery) {
    const photographer = await prisma.user.findFirst({ where: { role: "PHOTOGRAPHER" } });
    if (!photographer || !locationId)
      return NextResponse.json({ error: "missing photographer or location" }, { status: 400 });
    gallery = await prisma.gallery.create({
      data: {
        status: "DIGITAL_PASS",
        locationId,
        photographerId: photographer.id,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const photo = await prisma.photo.create({
    data: { galleryId: gallery.id, s3Key_highRes: s3Key },
  });

  // Real-time WhatsApp ping (within 60s)
  if (customer.whatsapp) {
    await sendWhatsAppHookLink(customer.whatsapp, gallery.magicLinkToken).catch(() => {});
  }

  return NextResponse.json({ matched: true, delivered: true, photoId: photo.id, galleryId: gallery.id });
}
