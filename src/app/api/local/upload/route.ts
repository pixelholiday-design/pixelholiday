import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writePhotoFile } from "@/lib/local-storage";
import { processOffline } from "@/lib/offline-edit";
import { enqueueSync } from "@/lib/sync-queue";

export const dynamic = "force-dynamic";

/**
 * Local upload — used by the SD-card kiosk and WiFi transmitters.
 *
 * Accepts a JSON payload with base64 photo bytes (small batches) OR a
 * multipart form (large batches). Writes each photo to local SSD via
 * lib/local-storage, runs the offline auto-edit chain, persists Photo rows,
 * and queues each one for cloud sync.
 */

const photoSchema = z.object({
  filename: z.string().optional(),
  base64: z.string().optional(),
  isHookImage: z.boolean().optional(),
});

const schema = z.object({
  galleryId: z.string().optional(),
  customerId: z.string().optional(),
  wristbandCode: z.string().optional(),
  locationId: z.string().min(1),
  photographerId: z.string().min(1),
  photos: z.array(photoSchema).min(1).max(500),
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

  // Resolve / create today's gallery
  let gallery = data.galleryId
    ? await prisma.gallery.findUnique({ where: { id: data.galleryId } })
    : null;
  if (!gallery) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    gallery = await prisma.gallery.findFirst({
      where: { customerId: customer.id, locationId: data.locationId, createdAt: { gte: dayStart } },
      orderBy: { createdAt: "desc" },
    });
  }
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
    await enqueueSync({ type: "gallery", action: "create", localId: gallery.id, payload: gallery });
  }

  // Walk each photo: write to disk → offline edit → persist row → queue sync
  const existingCount = await prisma.photo.count({ where: { galleryId: gallery.id } });
  let hasHook = await prisma.photo.findFirst({ where: { galleryId: gallery.id, isHookImage: true } });
  let written = 0;
  const createdPhotoIds: string[] = [];

  for (let i = 0; i < data.photos.length; i++) {
    const p = data.photos[i];
    const isHook = !hasHook && (p.isHookImage || i === 0);
    if (isHook) hasHook = { id: "_" } as any;

    const photo = await prisma.photo.create({
      data: {
        galleryId: gallery.id,
        s3Key_highRes: `local/${gallery.id}/${p.filename || `${Date.now()}-${i}.jpg`}`,
        isHookImage: isHook,
        sortOrder: existingCount + i,
      },
    });
    createdPhotoIds.push(photo.id);

    if (p.base64) {
      try {
        const raw = Buffer.from(p.base64, "base64");
        const edited = await processOffline(raw, { brighten: true, sharpen: true });
        await writePhotoFile(gallery.id, photo.id, edited);
        await prisma.photo.update({
          where: { id: photo.id },
          data: { isAutoEdited: true, editApplied: ["normalize", "sharpen"] },
        });
        written++;
      } catch (e) {
        // best-effort: row stays, file might be missing, fallback redirect kicks in
      }
    }

    await enqueueSync({
      type: "photo",
      action: "create",
      localId: photo.id,
      payload: { galleryId: gallery.id, isHookImage: isHook },
      priority: 5,
    });
  }

  await prisma.gallery.update({
    where: { id: gallery.id },
    data: { totalCount: existingCount + data.photos.length },
  });

  // Wristband AI detection + auto-link (non-fatal)
  try {
    const { analyzePhotoForWristband, autoLinkBurstToWristband } = await import(
      "@/lib/ai/wristband-detector"
    );
    for (const id of createdPhotoIds) {
      await analyzePhotoForWristband(id);
    }
    await autoLinkBurstToWristband(createdPhotoIds, data.photographerId);
  } catch (e) {
    console.error("Wristband detection failed (non-fatal):", e);
  }

  // AI photography coaching (non-fatal)
  try {
    const { analyzeGalleryPhotos } = await import("@/lib/ai/photo-analyzer");
    await analyzeGalleryPhotos(gallery.id);
    const { calculateSkillProfile } = await import("@/lib/ai/skill-profile");
    const { autoAssignTraining } = await import("@/lib/ai/auto-training");
    await calculateSkillProfile(gallery.photographerId);
    await autoAssignTraining(gallery.photographerId);
  } catch (e) {
    console.error("AI coaching failed (non-fatal):", e);
  }

  return NextResponse.json({
    ok: true,
    galleryId: gallery.id,
    magicLinkToken: gallery.magicLinkToken,
    customerId: customer.id,
    addedPhotos: data.photos.length,
    filesOnDisk: written,
  });
}
