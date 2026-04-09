// Mock Face Recognition Provider for Fotiqo
// Used when FACEPP_API_KEY is not configured.
// Returns plausible fake data for development and testing.

import { randomUUID } from "crypto";
import type { DetectedFace, SearchHit } from "./types";

let hasWarnedMockMode = false;

function warnMockMode(): void {
  if (!hasWarnedMockMode) {
    console.warn(
      "[Fotiqo] Face recognition running in MOCK mode \u2014 set FACEPP_API_KEY for real matching"
    );
    hasWarnedMockMode = true;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Returns 1-3 fake detected faces with random tokens and bounds.
 */
export async function detectFaces(
  _imageUrl: string
): Promise<DetectedFace[]> {
  warnMockMode();

  const count = randomInt(1, 3);
  const faces: DetectedFace[] = [];

  for (let i = 0; i < count; i++) {
    faces.push({
      faceToken: randomUUID(),
      bounds: {
        top: randomInt(50, 400),
        left: randomInt(50, 600),
        width: randomInt(80, 200),
        height: randomInt(80, 200),
      },
      confidence: randomFloat(85, 99),
    });
  }

  return faces;
}

/**
 * Returns a random confidence between 60-95.
 */
export async function compareFaces(
  _token1: string,
  _token2: string
): Promise<number> {
  warnMockMode();
  return randomFloat(60, 95);
}

/**
 * No-op in mock mode.
 */
export async function createFaceSet(outerKey: string): Promise<void> {
  warnMockMode();
  console.log(`[MOCK] Face recognition: createFaceSet("${outerKey}")`);
}

/**
 * No-op in mock mode.
 */
export async function addToFaceSet(
  outerKey: string,
  faceTokens: string[]
): Promise<void> {
  warnMockMode();
  console.log(
    `[MOCK] Face recognition: addToFaceSet("${outerKey}", ${faceTokens.length} tokens)`
  );
}

/**
 * Returns random photos from the database for the given locationId.
 * Queries real photos via Prisma and returns 3-8 as fake "matches".
 */
export async function searchFace(
  _faceToken: string,
  outerKey: string
): Promise<SearchHit[]> {
  warnMockMode();

  // Import prisma lazily to avoid circular deps at module load
  const { prisma } = await import("@/lib/db");

  // outerKey format: "loc_{locationId}_{date}" — extract locationId
  const parts = outerKey.split("_");
  const locationId = parts.length >= 2 ? parts[1] : undefined;

  try {
    const photos = await prisma.photo.findMany({
      where: locationId
        ? { gallery: { locationId } }
        : undefined,
      take: 20,
      select: {
        id: true,
        galleryId: true,
      },
    });

    if (photos.length === 0) {
      return [];
    }

    // Return a random subset of 3-8 photos as "matches"
    const count = Math.min(randomInt(3, 8), photos.length);
    const shuffled = photos.sort(() => Math.random() - 0.5).slice(0, count);

    return shuffled.map((p) => ({
      face_token: randomUUID(),
      confidence: randomFloat(70, 95),
      // Attach photoId/galleryId as extra data for the mock
      _photoId: p.id,
      _galleryId: p.galleryId,
    })) as (SearchHit & { _photoId: string; _galleryId: string })[];
  } catch (err) {
    console.error("[MOCK] searchFace DB query failed:", err);
    return [];
  }
}

/**
 * No-op in mock mode.
 */
export async function removeFaceSet(outerKey: string): Promise<void> {
  warnMockMode();
  console.log(`[MOCK] Face recognition: removeFaceSet("${outerKey}")`);
}
