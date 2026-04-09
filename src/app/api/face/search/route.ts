import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchFace, getProvider } from "@/lib/face-recognition";
import { uploadToCloudinary } from "@/lib/cloudinary.server";
function createId() { return `fs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
import type { FaceMatch } from "@/lib/face-recognition/types";

/**
 * In-memory session cache for search results.
 * Keys are sessionIds, values are { matches, expiresAt }.
 * TTL: 10 minutes.
 */
const sessionCache = new Map<
  string,
  { matches: EnrichedMatch[]; expiresAt: number }
>();

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Periodically evict expired entries (max once per minute). */
let lastCleanup = 0;
function cleanupCache() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  sessionCache.forEach((val, key) => {
    if (val.expiresAt < now) sessionCache.delete(key);
  });
}

interface EnrichedMatch {
  photoId: string;
  galleryId: string;
  confidence: number;
  thumbnailUrl: string;
  faceToken?: string;
  bounds?: { top: number; left: number; width: number; height: number };
}

/**
 * POST /api/face/search
 *
 * "Find My Photos" endpoint. Customer uploads a selfie, system returns
 * matching photos from the location's daily face set.
 *
 * Request body:
 *   selfieBase64 - base64-encoded JPEG (required)
 *   locationId   - location to search within (required)
 *   date?        - YYYY-MM-DD (defaults to today)
 *   galleryId?   - if provided, search only within this gallery
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selfieBase64, locationId, date, galleryId } = body as {
      selfieBase64?: string;
      locationId?: string;
      date?: string;
      galleryId?: string;
    };

    if (!selfieBase64) {
      return NextResponse.json(
        { error: "selfieBase64 is required" },
        { status: 400 },
      );
    }

    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 },
      );
    }

    // Convert base64 to a URL (upload to Cloudinary or use data URL)
    const dataUrl = selfieBase64.startsWith("data:")
      ? selfieBase64
      : `data:image/jpeg;base64,${selfieBase64}`;

    let selfieUrl = dataUrl;
    let tempCloudinaryId: string | null = null;

    const uploaded = await uploadToCloudinary(dataUrl, "face-search-temp");
    if (uploaded) {
      selfieUrl = uploaded.secure_url;
      tempCloudinaryId = uploaded.public_id;
    }

    // Build face set key
    const dateKey = date || new Date().toISOString().slice(0, 10);
    let faceSetKey: string;

    if (galleryId) {
      // Search within a specific gallery
      faceSetKey = `gallery_${galleryId}`;
    } else {
      // Search the location's daily face set
      faceSetKey = `loc_${locationId}_${dateKey}`;
    }

    // Perform face search
    const result = await searchFace(selfieUrl, faceSetKey);
    const provider = getProvider();

    // GDPR: Clean up temporary selfie
    if (tempCloudinaryId) {
      try {
        const { cloudinary } = await import("@/lib/cloudinary.server");
        await cloudinary.uploader.destroy(tempCloudinaryId);
      } catch {
        // Non-critical cleanup
      }
    }

    // Enrich matches with photo details and thumbnail URLs
    const enrichedMatches = await enrichSearchMatches(result.matches);

    // Sort by confidence descending
    enrichedMatches.sort((a, b) => b.confidence - a.confidence);

    // Cache results with a session ID
    cleanupCache();
    let sessionId: string;
    try {
      sessionId = createId();
    } catch {
      // Fallback if cuid2 is not available
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    sessionCache.set(sessionId, {
      matches: enrichedMatches,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return NextResponse.json({
      sessionId,
      totalFound: result.totalFound,
      matches: enrichedMatches,
      provider,
      searchTimeMs: result.searchTimeMs,
    });
  } catch (error) {
    console.error("[face/search] Error:", error);
    return NextResponse.json(
      { error: "Face search failed", detail: String(error) },
      { status: 500 },
    );
  }
}

/**
 * Enrich face matches with thumbnail URLs and gallery info.
 */
async function enrichSearchMatches(
  matches: FaceMatch[],
): Promise<EnrichedMatch[]> {
  if (matches.length === 0) return [];

  const photoIds = matches.map((m) => m.photoId).filter(Boolean);
  if (photoIds.length === 0) {
    return matches.map((m) => ({
      photoId: m.photoId,
      galleryId: m.galleryId,
      confidence: m.confidence,
      thumbnailUrl: "",
      faceToken: m.faceToken,
      bounds: m.bounds,
    }));
  }

  const photos = await prisma.photo.findMany({
    where: { id: { in: photoIds } },
    select: {
      id: true,
      galleryId: true,
      s3Key_highRes: true,
      cloudinaryId: true,
    },
  });

  const photoMap = new Map(photos.map((p) => [p.id, p]));

  return matches.map((match) => {
    const photo = photoMap.get(match.photoId);

    // Build thumbnail URL: prefer Cloudinary watermarked, fall back to R2
    let thumbnailUrl = "";
    if (photo?.cloudinaryId) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
      const watermarkId = process.env.CLOUDINARY_WATERMARK_PUBLIC_ID;
      const watermarkOverlay = watermarkId
        ? `l_${watermarkId.replace(/\//g, ":")},w_0.5,o_40,g_center/`
        : "";
      thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${watermarkOverlay}w_400,q_60,f_webp/${photo.cloudinaryId}`;
    } else if (photo?.s3Key_highRes) {
      const r2Url = process.env.R2_PUBLIC_URL || "";
      thumbnailUrl = `${r2Url}/${photo.s3Key_highRes}`;
    }

    return {
      photoId: match.photoId,
      galleryId: match.galleryId || photo?.galleryId || "",
      confidence: match.confidence,
      thumbnailUrl,
      faceToken: match.faceToken,
      bounds: match.bounds,
    };
  });
}
