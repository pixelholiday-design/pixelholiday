import { prisma } from "@/lib/db";

/**
 * Burst detection (Module 9.1).
 *
 * A "burst" is a group of photos taken by the same photographer within a
 * short time window — typically when they fire off 5–10 shots of the same
 * subject in quick succession. Bursts are the source material for Auto-Reels:
 * they have natural motion + rhythm and the AI can string them into a clip.
 *
 * The detector works on photos already stored in the DB. Since the Photo
 * model doesn't carry a photographerId directly, we walk through Gallery
 * (photographerId, locationId, createdAt).
 */

export type Burst = {
  /** Ordered photo IDs, earliest first. */
  photoIds: string[];
  /** Start/end timestamps of the burst (earliest / latest createdAt). */
  startAt: Date;
  endAt: Date;
  galleryId: string;
  photographerId: string;
  locationId: string;
};

export type BurstDetectionOptions = {
  /** Max gap between consecutive photos in the same burst, in seconds. */
  maxGapSeconds?: number;
  /** Minimum photos required before we call a group a burst. */
  minBurstSize?: number;
};

const DEFAULT_MAX_GAP = 60; // seconds — spec says "within 60 seconds"
const DEFAULT_MIN_SIZE = 3;

/** Detect bursts within a single gallery's photos. */
export async function detectBurstsInGallery(
  galleryId: string,
  opts: BurstDetectionOptions = {},
): Promise<Burst[]> {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { id: true, photographerId: true, locationId: true },
  });
  if (!gallery) return [];

  const photos = await prisma.photo.findMany({
    where: { galleryId },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return groupIntoBursts(photos, {
    galleryId,
    photographerId: gallery.photographerId,
    locationId: gallery.locationId,
    maxGap: (opts.maxGapSeconds ?? DEFAULT_MAX_GAP) * 1000,
    minSize: opts.minBurstSize ?? DEFAULT_MIN_SIZE,
  });
}

/**
 * Detect bursts across every photo a photographer has taken at a location in
 * a time window. Useful for the admin "scan for bursts" flow and for
 * generating reels retroactively.
 */
export async function detectBurstsForPhotographer(
  photographerId: string,
  locationId: string,
  since: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  opts: BurstDetectionOptions = {},
): Promise<Burst[]> {
  const galleries = await prisma.gallery.findMany({
    where: { photographerId, locationId, createdAt: { gte: since } },
    select: { id: true },
  });
  if (galleries.length === 0) return [];

  const allBursts: Burst[] = [];
  for (const g of galleries) {
    const bursts = await detectBurstsInGallery(g.id, opts);
    allBursts.push(...bursts);
  }
  return allBursts;
}

/** Pure-function grouping helper — exposed for testability. */
export function groupIntoBursts(
  photos: { id: string; createdAt: Date }[],
  ctx: {
    galleryId: string;
    photographerId: string;
    locationId: string;
    maxGap: number; // ms
    minSize: number;
  },
): Burst[] {
  if (photos.length === 0) return [];

  const bursts: Burst[] = [];
  let current: { id: string; createdAt: Date }[] = [];

  const flush = () => {
    if (current.length >= ctx.minSize) {
      bursts.push({
        photoIds: current.map((p) => p.id),
        startAt: current[0].createdAt,
        endAt: current[current.length - 1].createdAt,
        galleryId: ctx.galleryId,
        photographerId: ctx.photographerId,
        locationId: ctx.locationId,
      });
    }
    current = [];
  };

  for (const p of photos) {
    if (current.length === 0) {
      current.push(p);
      continue;
    }
    const prev = current[current.length - 1];
    const gap = p.createdAt.getTime() - prev.createdAt.getTime();
    if (gap <= ctx.maxGap) {
      current.push(p);
    } else {
      flush();
      current.push(p);
    }
  }
  flush();

  return bursts;
}
