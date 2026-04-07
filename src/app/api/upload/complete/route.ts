import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { GalleryStatus } from "@prisma/client";
import { sendWhatsAppHookLink } from "@/lib/whatsapp";

const photoSchema = z.object({
  key: z.string(),
  publicUrl: z.string(),
  isHookImage: z.boolean().optional().default(false),
});

const schema = z.object({
  locationId: z.string(),
  photographerId: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerWhatsapp: z.string().optional(),
  roomNumber: z.string().optional(),
  status: z.enum(["HOOK_ONLY", "PREVIEW_ECOM", "DIGITAL_PASS"]),
  photos: z.array(photoSchema).min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const customer = await prisma.customer.create({
    data: {
      name: data.customerName || "Guest",
      email: data.customerEmail,
      whatsapp: data.customerWhatsapp,
      roomNumber: data.roomNumber,
    },
  });

  const gallery = await prisma.gallery.create({
    data: {
      status: data.status as GalleryStatus,
      locationId: data.locationId,
      photographerId: data.photographerId,
      customerId: customer.id,
      roomNumber: data.roomNumber,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalCount: data.photos.length,
    },
  });

  // Enforce exactly one hook image
  let hookSet = false;
  for (let i = 0; i < data.photos.length; i++) {
    const p = data.photos[i];
    const isHook = p.isHookImage && !hookSet;
    if (isHook) hookSet = true;
    await prisma.photo.create({
      data: {
        galleryId: gallery.id,
        s3Key_highRes: p.publicUrl,
        cloudinaryId: p.publicUrl,
        isHookImage: isHook,
        sortOrder: i,
      },
    });
  }

  // Trigger O2O ping for HOOK_ONLY galleries
  if (data.status === "HOOK_ONLY" && customer.whatsapp) {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/${gallery.magicLinkToken}`;
    await sendWhatsAppHookLink(customer.whatsapp, link);
  }

  return NextResponse.json({ galleryId: gallery.id, magicLinkToken: gallery.magicLinkToken });
}
