import { prisma } from "@/lib/db";
import { photoRef, cleanUrl } from "@/lib/cloudinary";
import { detectBurstsInGallery, type Burst } from "./burst-detector";

/**
 * Auto-Reel generator (Module 9.2).
 *
 * Picks the best 5–8 photos out of a burst, builds a CSS-animated HTML
 * slideshow with ken-burns + crossfade, and persists it as a VideoReel
 * row. We deliberately do NOT render an MP4 here — that needs ffmpeg and
 * a worker queue. The HTML preview is good enough for the gallery "watch
 * your reel" overlay and the admin preview, and it's drop-in replaceable
 * later when an MP4 pipeline lands.
 */

export type GenerateReelInput = {
  galleryId: string;
  burst?: Burst;
  musicTrack?: string;
};

export type GenerateReelResult = {
  reelId: string;
  photoIds: string[];
  duration: number;
};

const TARGET_PHOTO_COUNT_MIN = 5;
const TARGET_PHOTO_COUNT_MAX = 8;
const SECONDS_PER_PHOTO = 3;

const MUSIC_TRACKS = ["upbeat", "romantic", "adventure"] as const;
type MusicTrack = (typeof MUSIC_TRACKS)[number];

function pickMusic(galleryLocationName?: string): MusicTrack {
  const name = (galleryLocationName || "").toLowerCase();
  if (name.includes("park") || name.includes("splash")) return "upbeat";
  if (name.includes("hilton") || name.includes("luxury") || name.includes("resort")) return "romantic";
  return "adventure";
}

/**
 * Score photos and pick the best 5–8. We prefer photos that:
 *   1. have a non-null aiScore (highest first)
 *   2. are favorited by the customer (proxy for "good shot")
 *   3. are flagged as the hook image
 *   4. otherwise, fall back to chronological order
 */
function selectBest(
  photos: {
    id: string;
    isFavorited: boolean;
    isHookImage: boolean;
    analysis: { overallScore: number } | null;
  }[],
): string[] {
  const scored = photos
    .map((p) => ({
      id: p.id,
      score:
        (p.analysis?.overallScore ?? 50) +
        (p.isHookImage ? 25 : 0) +
        (p.isFavorited ? 15 : 0) +
        Math.random() * 5, // tiny tiebreaker so re-runs aren't deterministic-stale
    }))
    .sort((a, b) => b.score - a.score);

  const target = Math.min(
    Math.max(TARGET_PHOTO_COUNT_MIN, Math.floor(photos.length / 2)),
    TARGET_PHOTO_COUNT_MAX,
  );
  return scored.slice(0, target).map((s) => s.id);
}

/**
 * Build a self-contained HTML slideshow. Uses CSS animation only — no JS —
 * so it can be sandboxed in an <iframe srcdoc> in the customer overlay and
 * the admin preview.
 */
function buildSlideshowHtml(photoUrls: string[], track: MusicTrack): string {
  const n = photoUrls.length;
  const totalDuration = n * SECONDS_PER_PHOTO;
  const slidePct = 100 / n;
  // Each slide: fade in, hold (with ken-burns zoom), fade out.
  const slides = photoUrls
    .map((url, i) => {
      const delay = i * SECONDS_PER_PHOTO;
      return `
    <div class="slide slide-${i}" style="background-image:url('${url}');animation-delay:${delay}s"></div>`;
    })
    .join("");

  // Keyframes — single shared "kenburns-fade" cycle, scoped to each slide via animation-delay.
  // Each slide is visible for SECONDS_PER_PHOTO seconds out of totalDuration.
  return `<!doctype html><html><head><meta charset="utf-8"><title>PixelHoliday Reel</title>
<style>
:root { color-scheme: dark; }
html, body { margin:0; padding:0; height:100%; background:#0C1829; font-family:system-ui,sans-serif; overflow:hidden; }
.stage { position:fixed; inset:0; }
.slide {
  position:absolute; inset:0;
  background-size:cover; background-position:center;
  opacity:0; transform:scale(1);
  animation: kenburns ${totalDuration}s linear infinite;
}
@keyframes kenburns {
  0%   { opacity:0; transform:scale(1.05); }
  ${(SECONDS_PER_PHOTO * 0.15 / totalDuration * 100).toFixed(2)}%  { opacity:1; transform:scale(1.08); }
  ${(SECONDS_PER_PHOTO * 0.85 / totalDuration * 100).toFixed(2)}%  { opacity:1; transform:scale(1.18); }
  ${(SECONDS_PER_PHOTO / totalDuration * 100).toFixed(2)}%        { opacity:0; transform:scale(1.20); }
  100% { opacity:0; transform:scale(1); }
}
.label {
  position:fixed; left:24px; bottom:20px; z-index:5;
  color:white; font-family:Georgia,serif; font-size:14px; letter-spacing:1px;
  text-shadow:0 2px 8px rgba(0,0,0,.6);
  opacity:.85;
}
.brand {
  position:fixed; right:24px; top:20px; z-index:5;
  color:#29ABE2; font-family:Georgia,serif; font-size:18px; font-weight:600;
  text-shadow:0 2px 8px rgba(0,0,0,.6);
}
</style></head><body>
<div class="stage">${slides}</div>
<div class="brand">PixelHoliday</div>
<div class="label">Auto-Reel · ${track} · ${n} moments</div>
</body></html>`;
}

export async function generateReelForGallery(
  input: GenerateReelInput,
): Promise<GenerateReelResult | null> {
  const { galleryId, musicTrack } = input;
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: {
      id: true,
      location: { select: { name: true } },
    },
  });
  if (!gallery) return null;

  // Find a burst — either passed in or detect the largest one.
  let burst = input.burst;
  if (!burst) {
    const bursts = await detectBurstsInGallery(galleryId);
    if (bursts.length === 0) {
      // Fall back: treat the whole gallery as one virtual burst if it has 5+ photos.
      const photos = await prisma.photo.findMany({
        where: { galleryId },
        orderBy: { createdAt: "asc" },
        select: { id: true, createdAt: true },
      });
      if (photos.length < TARGET_PHOTO_COUNT_MIN) return null;
      burst = {
        photoIds: photos.map((p) => p.id),
        startAt: photos[0].createdAt,
        endAt: photos[photos.length - 1].createdAt,
        galleryId,
        photographerId: "",
        locationId: "",
      };
    } else {
      burst = bursts.sort((a, b) => b.photoIds.length - a.photoIds.length)[0];
    }
  }

  // Pull full photo records to score and build URLs
  const burstPhotos = await prisma.photo.findMany({
    where: { id: { in: burst.photoIds } },
    select: {
      id: true,
      s3Key_highRes: true,
      cloudinaryId: true,
      isFavorited: true,
      isHookImage: true,
      analysis: { select: { overallScore: true } },
    },
  });

  if (burstPhotos.length < TARGET_PHOTO_COUNT_MIN) return null;

  const selectedIds = selectBest(burstPhotos);
  // Preserve chronological ordering of the selection
  const chronoIds = burst.photoIds.filter((id) => selectedIds.includes(id));
  const ordered = burstPhotos
    .filter((p) => chronoIds.includes(p.id))
    .sort((a, b) => chronoIds.indexOf(a.id) - chronoIds.indexOf(b.id));

  const urls = ordered.map((p) => cleanUrl(photoRef(p), 1600));
  const track = (musicTrack as MusicTrack) || pickMusic(gallery.location?.name);
  const html = buildSlideshowHtml(urls, track);
  const duration = ordered.length * SECONDS_PER_PHOTO;
  const thumbnailUrl = urls[0] || null;

  const reel = await prisma.videoReel.create({
    data: {
      galleryId,
      photoIds: JSON.stringify(ordered.map((p) => p.id)),
      musicTrack: track,
      duration,
      status: "READY",
      previewHtml: html,
      thumbnailUrl,
    },
  });

  return { reelId: reel.id, photoIds: ordered.map((p) => p.id), duration };
}

/**
 * Convenience wrapper used by /api/upload/complete: only generate a reel if
 * the gallery has enough source photos to actually be interesting.
 */
export async function maybeAutoGenerateReel(
  galleryId: string,
  photoCount: number,
): Promise<GenerateReelResult | null> {
  if (photoCount < TARGET_PHOTO_COUNT_MIN) return null;
  // Skip if we already have one for this gallery
  const existing = await prisma.videoReel.findFirst({ where: { galleryId } });
  if (existing) return null;
  return generateReelForGallery({ galleryId });
}
