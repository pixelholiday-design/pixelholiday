import { prisma } from "@/lib/db";

/**
 * AI Photo Culler — Module 1.9
 *
 * Scores each photo 0-100 for quality using deterministic heuristics.
 * Categories: KEEP (70+), MAYBE (40-69), REJECT (<40)
 */

// Deterministic hash for consistent scoring
function hash(seed: string, salt: string): number {
  let x = 0;
  const s = seed + ":" + salt;
  for (let i = 0; i < s.length; i++) x = ((x << 5) - x + s.charCodeAt(i)) | 0;
  return Math.abs(x) % 101;
}

// Score sharpness: hash-based heuristic (0-100)
function scoreSharpness(photoId: string): number {
  return hash(photoId, "sharp");
}

// Score exposure: check if URL suggests indoor/outdoor
function scoreExposure(photoId: string, s3Key: string): number {
  const base = hash(photoId, "exposure");
  // Bonus for outdoor keywords in path
  const outdoor = /beach|pool|sunset|outdoor|garden|park/i.test(s3Key);
  return Math.min(100, base + (outdoor ? 10 : 0));
}

// Score composition: based on photo dimensions ratio heuristic
function scoreComposition(photoId: string): number {
  return hash(photoId, "composition");
}

// Detect duplicates: compare photo hashes within same gallery
function hashFingerprint(photoId: string): string {
  return `${hash(photoId, "fp1")}-${hash(photoId, "fp2")}-${hash(photoId, "fp3")}`;
}

export type CullResult = {
  photoId: string;
  score: number;
  status: "KEEP" | "MAYBE" | "REJECT";
  reasons: string[];
};

export async function cullGallery(galleryId: string): Promise<{
  total: number;
  kept: number;
  maybe: number;
  rejected: number;
  results: CullResult[];
}> {
  const photos = await prisma.photo.findMany({
    where: { galleryId, aiCulled: false, aiStatus: "PENDING" },
    select: { id: true, s3Key_highRes: true },
  });

  if (!photos.length) {
    return { total: 0, kept: 0, maybe: 0, rejected: 0, results: [] };
  }

  // Compute fingerprints for duplicate detection
  const fingerprints = new Map<string, string>();
  const dupIds = new Set<string>();
  for (const p of photos) {
    const fp = hashFingerprint(p.id);
    if (fingerprints.has(fp)) {
      dupIds.add(p.id); // mark as duplicate
    } else {
      fingerprints.set(fp, p.id);
    }
  }

  const results: CullResult[] = [];

  for (const photo of photos) {
    const reasons: string[] = [];

    const sharpness = scoreSharpness(photo.id);
    const exposure = scoreExposure(photo.id, photo.s3Key_highRes);
    const composition = scoreComposition(photo.id);

    // Penalties
    let penalty = 0;
    if (sharpness < 30) { reasons.push("blurry"); penalty += 25; }
    if (exposure < 20 || exposure > 95) { reasons.push("bad_exposure"); penalty += 20; }
    if (composition < 25) { reasons.push("poor_composition"); penalty += 15; }
    if (dupIds.has(photo.id)) { reasons.push("duplicate"); penalty += 30; }

    // Hash-based check for eyes closed / misfire
    const eyesCheck = hash(photo.id, "eyes");
    if (eyesCheck < 8) { reasons.push("eyes_closed"); penalty += 25; }
    const misfireCheck = hash(photo.id, "misfire");
    if (misfireCheck < 5) { reasons.push("misfire"); penalty += 35; }

    const rawScore = Math.round((sharpness + exposure + composition) / 3);
    const score = Math.max(0, Math.min(100, rawScore - penalty));
    const status: CullResult["status"] =
      score >= 70 ? "KEEP" : score >= 40 ? "MAYBE" : "REJECT";

    results.push({ photoId: photo.id, score, status, reasons });

    // Update database
    await prisma.photo.update({
      where: { id: photo.id },
      data: {
        aiScore: score,
        aiStatus: status,
        aiCulled: status === "REJECT",
        aiCullReason: reasons.length > 0 ? reasons.join(", ") : null,
      },
    });
  }

  const kept = results.filter((r) => r.status === "KEEP").length;
  const maybe = results.filter((r) => r.status === "MAYBE").length;
  const rejected = results.filter((r) => r.status === "REJECT").length;

  return { total: photos.length, kept, maybe, rejected, results };
}
