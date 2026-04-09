import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { liveStream } from "@/lib/live-stream";
import { photoRef } from "@/lib/cloudinary";

const photoSchema = z.object({
  s3Key: z.string().optional(),
  publicUrl: z.string().optional(),
  isHookImage: z.boolean().optional().default(false),
});

const schema = z.object({
  wristbandCode: z.string().optional(),
  customerId: z.string().optional(),
  locationId: z.string().min(1),
  photographerId: z.string().min(1),
  photos: z.array(photoSchema).min(1).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Resolve customer
  let customer = null as Awaited<ReturnType<typeof prisma.customer.findFirst>>;
  if (data.customerId) {
    customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  } else if (data.wristbandCode) {
    customer = await prisma.customer.findFirst({ where: { wristbandCode: data.wristbandCode } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: `Wristband ${data.wristbandCode}`,
          wristbandCode: data.wristbandCode,
          locationId: data.locationId,
        },
      });
    }
  }
  if (!customer) {
    return NextResponse.json({ ok: false, error: "wristbandCode or customerId required" }, { status: 400 });
  }

  // Reuse today's gallery if it exists, otherwise create a new HOOK_ONLY one.
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  let gallery = await prisma.gallery.findFirst({
    where: { customerId: customer.id, locationId: data.locationId, createdAt: { gte: dayStart } },
    orderBy: { createdAt: "desc" },
  });
  if (!gallery) {
    gallery = await prisma.gallery.create({
      data: {
        status: "HOOK_ONLY",
        locationId: data.locationId,
        photographerId: data.photographerId,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Append photos
  const existingCount = await prisma.photo.count({ where: { galleryId: gallery.id } });
  let hasHook = await prisma.photo.findFirst({ where: { galleryId: gallery.id, isHookImage: true } });
  let i = 0;
  for (const p of data.photos) {
    const isHook = !hasHook && p.isHookImage;
    if (isHook) hasHook = { id: "_" } as any;
    await prisma.photo.create({
      data: {
        galleryId: gallery.id,
        s3Key_highRes: p.s3Key || p.publicUrl || `mobile/${gallery.id}/${Date.now()}-${i}.jpg`,
        isHookImage: isHook,
        sortOrder: existingCount + i,
      },
    });
    i++;
  }
  await prisma.gallery.update({
    where: { id: gallery.id },
    data: { totalCount: existingCount + data.photos.length },
  });

  // Push real-time notification to any connected SSE viewers
  try {
    const newPhotos = await prisma.photo.findMany({
      where: { galleryId: gallery.id },
      orderBy: { sortOrder: "desc" },
      take: data.photos.length,
      select: { id: true, s3Key_highRes: true, cloudinaryId: true, isHookImage: true, createdAt: true },
    });
    if (newPhotos.length > 0) {
      const totalCount = await prisma.photo.count({ where: { galleryId: gallery.id } });
      liveStream.broadcast(gallery.magicLinkToken, data.locationId, {
        type: "new_photos",
        galleryId: gallery.id,
        locationId: data.locationId,
        photos: newPhotos.map((p) => ({
          id: p.id,
          thumbnailUrl: photoRef(p),
          fullUrl: photoRef(p),
          isHookImage: p.isHookImage,
          createdAt: p.createdAt.toISOString(),
        })),
        totalCount,
      });
    }
  } catch (e) {
    console.warn("[LiveStream] Notification failed (non-fatal):", e);
  }

  return NextResponse.json({
    ok: true,
    galleryId: gallery.id,
    magicLinkToken: gallery.magicLinkToken,
    customerId: customer.id,
    addedPhotos: data.photos.length,
  });
}
