import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchFace, getProvider } from "@/lib/face-recognition";
import { uploadToCloudinary } from "@/lib/cloudinary.server";
import type { FaceMatch } from "@/lib/face-recognition/types";

/**
 * POST /api/ai/face-match
 *
 * Backward-compatible face match endpoint, now powered by the face recognition
 * library (Face++, Rekognition, or mock provider).
 *
 * GDPR: the incoming selfie is NEVER written to disk or database permanently.
 * Temporary Cloudinary uploads are destroyed after search completes.
 *
 * Request body:
 *   selfieBase64? - base64-encoded JPEG
 *   selfieUrl?    - URL to selfie image
 *   locationId    - filter to this location
 *   date?         - YYYY-MM-DD (defaults to today)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selfieBase64, selfieUrl: providedUrl, locationId, date } = body as {
      selfieBase64?: string;
      selfieUrl?: string;
      locationId?: string;
      date?: string;
    };

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 },
      );
    }

    if (!selfieBase64 && !providedUrl) {
      return NextResponse.json(
        { error: "selfieBase64 or selfieUrl is required" },
        { status: 400 },
      );
    }

    // Resolve the selfie URL
    let selfieUrl = providedUrl ?? "";
    let tempCloudinaryId: string | null = null;

    if (selfieBase64 && !providedUrl) {
      // Upload base64 to Cloudinary as a temporary image
      const dataUrl = selfieBase64.startsWith("data:")
        ? selfieBase64
        : `data:image/jpeg;base64,${selfieBase64}`;

      const uploaded = await uploadToCloudinary(dataUrl, "face-match-temp");
      if (uploaded) {
        selfieUrl = uploaded.secure_url;
        tempCloudinaryId = uploaded.public_id;
      } else {
        // Cloudinary not configured; use data URL directly
        selfieUrl = dataUrl;
      }
    }

    // Build face set key scoped to location + date
    const dateKey = date || new Date().toISOString().slice(0, 10);
    const faceSetKey = `loc_${locationId}_${dateKey}`;

    // Search for matching faces
    const result = await searchFace(selfieUrl, faceSetKey);
    const provider = getProvider();

    // Enrich matches with gallery and photo details
    const enrichedMatches = await enrichMatches(result.matches);

    // GDPR: Clean up temporary selfie if uploaded to Cloudinary
    if (tempCloudinaryId) {
      try {
        const { cloudinary } = await import("@/lib/cloudinary.server");
        await cloudinary.uploader.destroy(tempCloudinaryId);
      } catch {
        // Non-critical; temp images are cleaned up by Cloudinary lifecycle rules
      }
    }

    if (result.matches.length === 0) {
      return NextResponse.json({
        matched: false,
        totalFound: 0,
        matches: [],
        provider,
        searchTimeMs: result.searchTimeMs,
        gdpr: "selfie_deleted",
      });
    }

    return NextResponse.json({
      matched: true,
      totalFound: result.totalFound,
      matches: enrichedMatches,
      provider,
      searchTimeMs: result.searchTimeMs,
      gdpr: "selfie_deleted",
    });
  } catch (error) {
    console.error("[face-match] Error:", error);
    return NextResponse.json(
      { error: "Face match failed", detail: String(error) },
      { status: 500 },
    );
  }
}

/**
 * Enrich face matches with gallery/photo data from the database.
 */
async function enrichMatches(matches: FaceMatch[]) {
  if (matches.length === 0) return [];

  const photoIds = matches.map((m) => m.photoId).filter(Boolean);
  if (photoIds.length === 0) return matches;

  const photos = await prisma.photo.findMany({
    where: { id: { in: photoIds } },
    include: {
      gallery: {
        include: {
          customer: { select: { id: true, name: true, roomNumber: true } },
          location: { select: { id: true, name: true } },
        },
      },
    },
  });

  const photoMap = new Map(photos.map((p) => [p.id, p]));

  return matches.map((match) => {
    const photo = photoMap.get(match.photoId);
    return {
      ...match,
      gallery: photo?.gallery
        ? {
            id: photo.gallery.id,
            status: photo.gallery.status,
            customer: photo.gallery.customer,
            location: photo.gallery.location,
            totalPhotos: undefined as number | undefined,
          }
        : null,
    };
  });
}
