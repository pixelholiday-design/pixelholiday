import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Ensure cloudinary is configured (config happens in cloudinary.server.ts,
// but we re-apply here to be safe when imported independently).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const WATERMARK_ID = "fotiqo_watermark";

const HAS_SIGNING =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// ─── Core signing function ──────────────────────────────────────────────────

type SignedUrlOptions = {
  width?: number;
  height?: number;
  watermark?: boolean;
  quality?: string;
  format?: string;
  crop?: string;
};

/**
 * Generate a **signed** Cloudinary URL. The signature (`s--xxxx--`) is derived
 * from `CLOUDINARY_API_SECRET` and covers the full transformation chain — any
 * client-side tampering (e.g. removing the watermark overlay) invalidates the
 * signature and Cloudinary returns 401.
 *
 * When Cloudinary credentials are not configured (dev / seed mode), falls back
 * to an unsigned URL so the app still renders.
 */
export function signedPhotoUrl(
  publicId: string,
  options: SignedUrlOptions = {},
): string {
  if (!publicId) return "";

  // Build transformation chain
  const transformations: Record<string, unknown>[] = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "limit",
      gravity: "auto",
    });
  }

  if (options.watermark) {
    transformations.push({
      overlay: WATERMARK_ID,
      gravity: "center",
      opacity: 40,
      width: "0.5",
      flags: "relative",
    });
  }

  transformations.push({
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
    angle: "exif",
  });

  if (!HAS_SIGNING) {
    // Fallback: unsigned URL (dev / seed mode)
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  return cloudinary.url(publicId, {
    sign_url: true,
    transformation: transformations,
    secure: true,
  });
}

// ─── Convenience wrappers ───────────────────────────────────────────────────

/** Signed watermarked thumbnail (gallery grid) */
export function signedThumbnail(publicId: string): string {
  return signedPhotoUrl(publicId, {
    width: 600,
    watermark: true,
    quality: "auto:low",
  });
}

/** Signed watermarked preview (lightbox / larger view) */
export function signedPreview(publicId: string, width = 1200): string {
  return signedPhotoUrl(publicId, { width, watermark: true, quality: "auto" });
}

/** Signed clean (no watermark) — only for PAID galleries */
export function signedClean(publicId: string, width = 1600): string {
  return signedPhotoUrl(publicId, { width, watermark: false, quality: "auto" });
}

/** Signed full-res download URL — forces browser download with filename */
export function signedDownloadUrl(
  publicId: string,
  filename: string,
): string {
  if (!publicId) return "";
  if (!HAS_SIGNING) {
    return cloudinary.url(publicId, {
      transformation: [{ quality: "auto:best", angle: "exif" }],
      flags: `attachment:${filename}`,
      secure: true,
    });
  }
  return cloudinary.url(publicId, {
    sign_url: true,
    transformation: [{ quality: "auto:best", angle: "exif" }],
    flags: `attachment:${filename}`,
    secure: true,
  });
}

// ─── Fetch-mode signing (for external URLs like R2) ─────────────────────────

/**
 * Signed URL via Cloudinary's `/image/fetch/` endpoint. This lets us apply
 * signed transformations (including watermarks) to images hosted externally
 * (e.g. on Cloudflare R2).
 */
export function signedFetchUrl(
  externalUrl: string,
  options: SignedUrlOptions = {},
): string {
  if (!externalUrl || !HAS_SIGNING) return externalUrl;

  const transformations: Record<string, unknown>[] = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "limit",
      gravity: "auto",
    });
  }

  if (options.watermark) {
    transformations.push({
      overlay: WATERMARK_ID,
      gravity: "center",
      opacity: 40,
      width: "0.5",
      flags: "relative",
    });
  }

  transformations.push({
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
    angle: "exif",
  });

  return cloudinary.url(externalUrl, {
    type: "fetch",
    sign_url: true,
    transformation: transformations,
    secure: true,
  });
}

// ─── Resolve any photo source to a signed URL ───────────────────────────────

/**
 * Takes a photo's raw source (cloudinaryId or URL) and returns a signed URL.
 * Handles both Cloudinary-native uploads and external URLs (R2, picsum, etc.).
 */
export function signPhotoSource(
  source: string,
  options: SignedUrlOptions = {},
): string {
  if (!source) return "";
  const isExternal = /^https?:\/\//.test(source);
  if (isExternal) {
    return signedFetchUrl(source, options);
  }
  return signedPhotoUrl(source, options);
}

/** Check whether Cloudinary signing is available */
export function hasSigningCapability(): boolean {
  return HAS_SIGNING;
}
