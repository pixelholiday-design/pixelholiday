// Face++ API Client for Fotiqo
// Docs: https://console.faceplusplus.com/documents/5679127
// US endpoint: https://api-us.faceplusplus.com/facepp/v3

import type { DetectedFace, SearchHit } from "./types";

const FACEPP_BASE = "https://api-us.faceplusplus.com/facepp/v3";

let requestCount = 0;
let lastRequestTime = 0;
const RATE_LIMIT_WARN_THRESHOLD = 10; // warn if >10 requests within 1 second

function getCredentials(): { api_key: string; api_secret: string } {
  const api_key = process.env.FACEPP_API_KEY;
  const api_secret = process.env.FACEPP_API_SECRET;
  if (!api_key || !api_secret) {
    throw new Error(
      "[Fotiqo] FACEPP_API_KEY and FACEPP_API_SECRET must be set"
    );
  }
  return { api_key, api_secret };
}

function checkRateLimit(): void {
  const now = Date.now();
  if (now - lastRequestTime < 1000) {
    requestCount++;
    if (requestCount >= RATE_LIMIT_WARN_THRESHOLD) {
      console.warn(
        `[Fotiqo] Face++ rate limit warning: ${requestCount} requests in <1s. Consider throttling.`
      );
    }
  } else {
    requestCount = 1;
  }
  lastRequestTime = now;
}

async function faceppPost(
  endpoint: string,
  params: Record<string, string>
): Promise<Record<string, unknown> | null> {
  checkRateLimit();

  const { api_key, api_secret } = getCredentials();
  const body = new URLSearchParams({ api_key, api_secret, ...params });

  try {
    const res = await fetch(`${FACEPP_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[Fotiqo] Face++ ${endpoint} failed (${res.status}): ${text}`
      );
      return null;
    }

    return (await res.json()) as Record<string, unknown>;
  } catch (err) {
    console.error(`[Fotiqo] Face++ ${endpoint} network error:`, err);
    return null;
  }
}

/**
 * Detect faces in an image.
 * POST /detect with image_url.
 * Returns bounding boxes and face tokens.
 */
export async function detectFaces(imageUrl: string): Promise<DetectedFace[]> {
  const data = await faceppPost("/detect", {
    image_url: imageUrl,
    return_attributes: "none",
  });

  if (!data || !Array.isArray(data.faces)) {
    return [];
  }

  const faces = data.faces as Array<{
    face_token: string;
    face_rectangle: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }>;

  return faces.map((f) => ({
    faceToken: f.face_token,
    bounds: {
      top: f.face_rectangle.top,
      left: f.face_rectangle.left,
      width: f.face_rectangle.width,
      height: f.face_rectangle.height,
    },
  }));
}

/**
 * Compare two face tokens.
 * POST /compare with face_token1, face_token2.
 * Returns confidence 0-100.
 */
export async function compareFaces(
  token1: string,
  token2: string
): Promise<number> {
  const data = await faceppPost("/compare", {
    face_token1: token1,
    face_token2: token2,
  });

  if (!data || typeof data.confidence !== "number") {
    return 0;
  }

  return data.confidence as number;
}

/**
 * Create a FaceSet for grouping faces by location/day.
 * POST /faceset/create with outer_id.
 */
export async function createFaceSet(outerKey: string): Promise<void> {
  const data = await faceppPost("/faceset/create", {
    outer_id: outerKey,
    display_name: outerKey,
  });

  if (!data) {
    // May fail if already exists — that's fine
    console.warn(
      `[Fotiqo] Face++ createFaceSet "${outerKey}" returned no data (may already exist)`
    );
  }
}

/**
 * Add face tokens to a FaceSet.
 * POST /faceset/addface with outer_id and face_tokens (comma-separated).
 * Face++ allows max 5 tokens per call, so we batch automatically.
 */
export async function addToFaceSet(
  outerKey: string,
  faceTokens: string[]
): Promise<void> {
  // Face++ limit: max 5 face_tokens per addface call
  const BATCH_SIZE = 5;

  for (let i = 0; i < faceTokens.length; i += BATCH_SIZE) {
    const batch = faceTokens.slice(i, i + BATCH_SIZE);
    const data = await faceppPost("/faceset/addface", {
      outer_id: outerKey,
      face_tokens: batch.join(","),
    });

    if (!data) {
      console.error(
        `[Fotiqo] Face++ addToFaceSet failed for batch starting at index ${i}`
      );
    }
  }
}

/**
 * Search for a face within a FaceSet.
 * POST /search with face_token and outer_id.
 * Returns array of { face_token, confidence }.
 */
export async function searchFace(
  faceToken: string,
  outerKey: string
): Promise<SearchHit[]> {
  const data = await faceppPost("/search", {
    face_token: faceToken,
    outer_id: outerKey,
  });

  if (!data || !data.results) {
    return [];
  }

  const results = data.results as Array<{
    face_token: string;
    confidence: number;
  }>;

  return results.map((r) => ({
    face_token: r.face_token,
    confidence: r.confidence,
  }));
}

/**
 * Delete a FaceSet.
 * POST /faceset/delete with outer_id and check_empty=0 (force delete).
 */
export async function removeFaceSet(outerKey: string): Promise<void> {
  const data = await faceppPost("/faceset/delete", {
    outer_id: outerKey,
    check_empty: "0",
  });

  if (!data) {
    console.warn(
      `[Fotiqo] Face++ removeFaceSet "${outerKey}" returned no data`
    );
  }
}
