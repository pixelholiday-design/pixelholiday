// Background Face Indexer for Fotiqo
// Indexes all photos in a gallery for face recognition matching.
//
// Typical usage:
//   After a photographer uploads a gallery, call indexGalleryFaces(galleryId).
//   This detects faces in every photo and adds them to a location-day FaceSet.

import { prisma } from "@/lib/db";
import { createFaceSet, indexPhoto } from "./index";

/**
 * Index all un-indexed photos in a gallery for face recognition.
 *
 * FaceSet naming convention: loc_{locationId}_{YYYY-MM-DD}
 * This groups all faces from a single location on a single day,
 * so a customer selfie searches only that day's photos.
 *
 * @returns Count of photos indexed and total faces detected.
 */
export async function indexGalleryFaces(
  galleryId: string
): Promise<{ indexed: number; faces: number }> {
  // 1. Fetch gallery with photos and location
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: {
      photos: {
        include: { analysis: true },
      },
      location: true,
    },
  });

  if (!gallery) {
    console.error(`[Fotiqo Indexer] Gallery not found: ${galleryId}`);
    return { indexed: 0, faces: 0 };
  }

  // 2. Build faceSet key: loc_{locationId}_{YYYY-MM-DD}
  const dateStr = gallery.createdAt.toISOString().split("T")[0];
  const faceSetKey = `loc_${gallery.locationId}_${dateStr}`;

  // 3. Create the FaceSet (idempotent — Face++ ignores if already exists)
  try {
    await createFaceSet(faceSetKey);
  } catch {
    // Already exists, that's fine
  }

  // 4. Index each photo that hasn't been indexed yet
  let indexed = 0;
  let totalFaces = 0;

  for (const photo of gallery.photos) {
    // Skip photos already analyzed with faces detected
    if (photo.analysis && photo.analysis.facesDetected > 0) {
      continue;
    }

    // Skip AI-culled photos (blurry, eyes closed, etc.)
    if (photo.aiCulled) {
      continue;
    }

    // The s3Key_highRes is the image URL (already an HTTPS URL in demo data)
    const imageUrl = photo.s3Key_highRes;
    if (!imageUrl) {
      continue;
    }

    try {
      const result = await indexPhoto(photo.id, imageUrl, faceSetKey);

      if (result.facesFound > 0) {
        // Update the PhotoAnalysis record with face count
        if (photo.analysis) {
          await prisma.photoAnalysis.update({
            where: { id: photo.analysis.id },
            data: {
              facesDetected: result.facesFound,
            },
          });
        } else {
          // Create a minimal PhotoAnalysis if none exists
          await prisma.photoAnalysis.create({
            data: {
              photoId: photo.id,
              photographerId: gallery.photographerId,
              facesDetected: result.facesFound,
            },
          });
        }

        totalFaces += result.facesFound;
      }

      indexed++;
    } catch (err) {
      console.error(
        `[Fotiqo Indexer] Failed to index photo ${photo.id}:`,
        err
      );
      // Continue with next photo — don't let one failure block the batch
    }
  }

  console.log(
    `[Fotiqo Indexer] Gallery ${galleryId}: indexed ${indexed} photos, found ${totalFaces} faces (faceSet: ${faceSetKey})`
  );

  return { indexed, faces: totalFaces };
}

/**
 * Build the FaceSet key for a location on a given date.
 * Useful for consumers that need to search or clean up FaceSets.
 */
export function buildFaceSetKey(locationId: string, date: Date): string {
  const dateStr = date.toISOString().split("T")[0];
  return `loc_${locationId}_${dateStr}`;
}
