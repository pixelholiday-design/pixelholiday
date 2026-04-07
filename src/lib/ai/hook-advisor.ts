import { prisma } from "@/lib/db";

/**
 * Hook photo advisor — heuristic-based scoring that decides which photo in a
 * gallery should be marked as the cover/hook image.
 *
 * In production this plugs into a vision model (CLIP / face-detection / quality
 * scoring). The dev fallback uses lightweight signals already in our DB:
 *   - has cloudinaryId? (was successfully uploaded to Cloudinary)
 *   - has been auto-edited? (passed AI cull)
 *   - is the first photo (early in the burst, usually the wide shot)
 *   - early sortOrder = the photographer probably picked it as their first shot
 * Cloud-side this ranks every Photo and returns the top N with reasons.
 */

type ScoredPhoto = {
  id: string;
  score: number;
  reasons: string[];
};

export async function suggestHookPhoto(galleryId: string): Promise<ScoredPhoto[]> {
  const photos = await prisma.photo.findMany({
    where: { galleryId, aiCulled: false },
    orderBy: { sortOrder: "asc" },
  });

  const scored: ScoredPhoto[] = photos.map((p, i) => {
    const reasons: string[] = [];
    let score = 50;
    if (p.cloudinaryId_edited) {
      score += 25;
      reasons.push("Auto-edited (color + sharpness boost)");
    }
    if (p.cloudinaryId) {
      score += 15;
      reasons.push("High-resolution available");
    }
    // First 5 photos in the burst are usually the photographer's "hero" shots
    if (i < 5) {
      score += 20 - i * 4;
      reasons.push(i === 0 ? "First frame of the session" : "Early in the burst");
    }
    if (p.isFavorited) {
      score += 30;
      reasons.push("Marked as favourite");
    }
    if (p.hasMagicElement) {
      score += 15;
      reasons.push("Includes a Magic Shot element");
    }
    return { id: p.id, score, reasons };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

export async function applyAutoHook(galleryId: string): Promise<string | null> {
  const top = await suggestHookPhoto(galleryId);
  if (!top.length) return null;
  const pick = top[0];
  // Don't override an existing manual choice
  const existing = await prisma.photo.findFirst({ where: { galleryId, isHookImage: true } });
  if (existing) return existing.id;
  await prisma.$transaction([
    prisma.photo.updateMany({ where: { galleryId }, data: { isHookImage: false } }),
    prisma.photo.update({ where: { id: pick.id }, data: { isHookImage: true } }),
    prisma.gallery.update({ where: { id: galleryId }, data: { hookImageId: pick.id } }),
  ]);
  return pick.id;
}
