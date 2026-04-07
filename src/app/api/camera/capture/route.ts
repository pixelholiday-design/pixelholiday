import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendWhatsAppHookLink } from "@/lib/whatsapp";

/**
 * Speed-camera capture endpoint.
 * Receives one frame from a registered camera, identifies the customer
 * (wristband / digital pass face vector), attaches the photo to their gallery
 * (creating one if needed), and falls back to an unclaimed gallery the
 * customer can claim later via selfie or QR.
 */
const schema = z.object({
  externalId: z.string().min(1).optional(),
  cameraId: z.string().optional(),
  locationId: z.string().min(1),
  s3Key: z.string().min(1).optional(),
  imageBase64: z.string().optional(),
  imageUrl: z.string().optional(),
  wristbandCode: z.string().optional(),
  faceVectorHex: z.string().optional(),
  timestamp: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Resolve camera (by externalId or internal id) and bump counters.
  const camera = await prisma.camera.findFirst({
    where: data.externalId ? { externalId: data.externalId } : data.cameraId ? { id: data.cameraId } : { id: "__none__" },
  });
  if (!camera) {
    return NextResponse.json({ success: false, error: "Camera not registered" }, { status: 404 });
  }
  if (camera.locationId !== data.locationId) {
    return NextResponse.json({ success: false, error: "Camera/location mismatch" }, { status: 400 });
  }

  // Identify customer
  let customer = null as Awaited<ReturnType<typeof prisma.customer.findFirst>>;
  if (data.wristbandCode) {
    customer = await prisma.customer.findFirst({ where: { wristbandCode: data.wristbandCode } });
  }
  if (!customer && data.faceVectorHex) {
    // Placeholder face match: pick the first digital-pass holder at the location.
    customer = await prisma.customer.findFirst({
      where: { hasDigitalPass: true, locationId: data.locationId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Locate or create the active gallery
  const photographer = await prisma.user.findFirst({
    where: { role: "PHOTOGRAPHER", locationId: data.locationId },
  });
  if (!photographer) {
    return NextResponse.json({ success: false, error: "No photographer assigned to location" }, { status: 409 });
  }

  let isUnclaimed = false;
  if (!customer) {
    isUnclaimed = true;
    customer = await prisma.customer.create({
      data: {
        name: `Unclaimed @ ${camera.name}`,
        locationId: data.locationId,
      },
    });
  }

  let gallery = await prisma.gallery.findFirst({
    where: {
      customerId: customer.id,
      locationId: data.locationId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!gallery) {
    gallery = await prisma.gallery.create({
      data: {
        status: customer.hasDigitalPass ? "DIGITAL_PASS" : "HOOK_ONLY",
        locationId: data.locationId,
        photographerId: photographer.id,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Persist photo. In production this `s3Key` would come from a presigned upload.
  const s3Key = data.s3Key || `cam/${camera.externalId}/${Date.now()}.jpg`;
  const photo = await prisma.photo.create({
    data: {
      galleryId: gallery.id,
      s3Key_highRes: s3Key,
      sortOrder: 0,
    },
  });

  // Update gallery total + camera capture count
  await prisma.$transaction([
    prisma.gallery.update({ where: { id: gallery.id }, data: { totalCount: { increment: 1 } } }),
    prisma.camera.update({
      where: { id: camera.id },
      data: { captureCount: { increment: 1 }, lastPingAt: new Date() },
    }),
  ]);

  // Real-time WhatsApp ping for digital-pass holders
  if (customer.hasDigitalPass && customer.whatsapp) {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/${gallery.magicLinkToken}`;
    await sendWhatsAppHookLink(customer.whatsapp, link).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    photoId: photo.id,
    galleryId: gallery.id,
    matched: !isUnclaimed,
    customerId: customer.id,
    isUnclaimed,
  });
}
