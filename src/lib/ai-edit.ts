import { prisma } from "@/lib/db";
import type { EditQuality } from "@prisma/client";

/**
 * AI auto-edit pipeline.
 *
 * Stage 1 — CULL: heuristic + (optional) AI scoring removes blurry / eyes-closed
 *   misfires. In dev we use a permissive heuristic; the real model would run via
 *   AI_CULLING_MODEL_URL or Cloudinary's quality_analysis add-on.
 * Stage 2 — EDIT: build a Cloudinary transformation chain that bakes in colour,
 *   exposure, sharpening, smart crop, and (PREMIUM only) face beauty retouch.
 * Stage 3 — STORE: persist the edited URL alongside the original. The
 *   `cloudinaryId_edited` field is what the gallery shows; `cloudinaryId` is
 *   preserved as the "see original" toggle source.
 *
 * Designed to run as a fire-and-forget background job from upload/capture
 * routes — never blocks the upload response.
 */

const TRANSFORMS: Record<EditQuality, string[]> = {
  NONE: [],
  LIGHT: ["e_auto_color", "e_auto_brightness"],
  STANDARD: ["e_auto_color", "e_auto_brightness", "e_auto_contrast", "e_improve", "e_sharpen:80"],
  PREMIUM: [
    "e_auto_color",
    "e_auto_brightness",
    "e_auto_contrast",
    "e_improve",
    "e_sharpen:80",
    "c_auto,g_auto",
    "e_beauty_retouch",
  ],
};

function buildEditedPublicId(cloudinaryId: string) {
  return `${cloudinaryId}__edited`;
}

/**
 * Build a Cloudinary delivery URL with the edit chain baked in.
 * Falls through to the original ID when quality=NONE.
 */
export function editedUrlFor(cloudinaryId: string, quality: EditQuality, width = 2000) {
  const transforms = TRANSFORMS[quality];
  if (!transforms.length) return cloudinaryId;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const chain = [...transforms, `c_limit,w_${width},q_auto,f_auto`].join("/");
  return `https://res.cloudinary.com/${cloud}/image/upload/${chain}/${cloudinaryId}`;
}

/**
 * AI culling: returns true to KEEP, false to DROP.
 * Real implementation would call an external model via AI_CULLING_MODEL_URL.
 *
 * In dev we KEEP everything — without a CV model we can't make a real
 * judgement. Camera frames arrive with no cloudinaryId (R2-only) so we
 * must NOT penalise that.
 */
export async function shouldKeep(_cloudinaryId: string | null): Promise<{ keep: boolean; reason?: string }> {
  return { keep: true };
}

export async function autoEditPhoto(photoId: string, quality: EditQuality = "STANDARD") {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return null;

  const cull = await shouldKeep(photo.cloudinaryId);
  if (!cull.keep) {
    await prisma.photo.update({
      where: { id: photoId },
      data: { aiCulled: true, aiCullReason: cull.reason || "ai_cull" },
    });
    return { culled: true };
  }

  if (quality === "NONE" || !photo.cloudinaryId) {
    await prisma.photo.update({
      where: { id: photoId },
      data: { isAutoEdited: true, editApplied: [] },
    });
    return { edited: false };
  }

  const editedId = buildEditedPublicId(photo.cloudinaryId);
  await prisma.photo.update({
    where: { id: photoId },
    data: {
      cloudinaryId_edited: editedId,
      isAutoEdited: true,
      editApplied: TRANSFORMS[quality],
    },
  });

  return { edited: true, editedId, transforms: TRANSFORMS[quality] };
}

/**
 * Edit every photo in a gallery in the background.
 * Designed to be called *after* the upload response has already been sent
 * (e.g. via fetch().catch(()=>{}) inside the upload route).
 */
export async function autoEditGallery(galleryId: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: { photos: true },
  });
  if (!gallery) return { processed: 0 };
  let processed = 0;
  let culled = 0;
  for (const p of gallery.photos) {
    if (p.isAutoEdited) continue;
    const r = await autoEditPhoto(p.id, gallery.editQuality);
    if (r?.culled) culled++;
    else if (r) processed++;
  }
  return { processed, culled };
}
