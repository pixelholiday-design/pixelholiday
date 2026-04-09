// Pure URL helpers — safe to import from client and server.
// The cloudinary SDK lives in `cloudinary.server.ts` and must only be imported server-side.

const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
const WATERMARK =
  process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID ||
  process.env.CLOUDINARY_WATERMARK_PUBLIC_ID ||
  "fotiqo_watermark";

// If Cloudinary isn't configured (empty env) OR the value is the placeholder "demo",
// we fall back to passing URLs through unchanged instead of building a Cloudinary URL
// that would 404. This keeps seed data (picsum / unsplash URLs) visible in the gallery.
const HAS_CLOUDINARY = CLOUD && CLOUD !== "demo";

function isHttpsUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

function isProxyUrl(s: string): boolean {
  return s.startsWith("/api/photo/");
}

/**
 * Detect whether a URL is already a **signed** Cloudinary URL.
 * Signed URLs contain a `s--<hash>--` component in the transformation path.
 */
export function isSignedCloudinaryUrl(url: string): boolean {
  return /res\.cloudinary\.com\/.+\/s--[A-Za-z0-9_-]+--\//.test(url);
}

/**
 * Resolve a Photo (with cloudinaryId + s3Key_highRes) to the best image source.
 * Prefers a stored full URL when present; falls back to cloudinary publicId.
 *
 * If `_signedWm` or `_signedClean` are present (pre-computed by the server
 * component), those signed URLs are available via `getPhotoSrc()`.
 */
export function photoRef(p: { cloudinaryId?: string | null; s3Key_highRes?: string | null }): string {
  const raw = p.s3Key_highRes || "";
  // Already a proxy URL — pass through unchanged (avoid double-encoding)
  if (isProxyUrl(raw)) return raw;
  // If s3Key_highRes holds a full URL:
  if (isHttpsUrl(raw)) {
    // Fix broken example.r2.dev URLs — redirect to photo proxy
    if (raw.includes("example.r2.dev/")) {
      const key = raw.split("example.r2.dev/")[1];
      if (key) return `/api/photo/${encodeURIComponent(key)}`;
    }
    return raw;
  }
  // Bare R2 object key (e.g. "uploads/1775..." from older uploads): use photo proxy
  if (raw && raw.includes("/")) {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";
    if (base && base !== "https://example.r2.dev") return `${base.replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
    return `/api/photo/${encodeURIComponent(raw)}`;
  }
  // Cloudinary publicId — only trust if it looks like a real upload, not a placeholder.
  const cid = p.cloudinaryId || "";
  if (cid && !cid.startsWith("uploads/") && !cid.startsWith("sample") && cid.includes("/")) return cid;
  if (raw) return `/api/photo/${encodeURIComponent(raw)}`;
  return "";
}

/**
 * Server-side watermarked URL.
 * Transformation: l_<watermark>,w_0.5,g_center,o_40 / c_limit,w_<width>,q_60,f_webp,a_exif
 * a_exif = auto-rotate based on EXIF orientation tag.
 *
 * When given an HTTPS URL (R2, picsum, etc.) and Cloudinary is configured, uses
 * Cloudinary's image/fetch endpoint so the watermark is applied server-side.
 * Falls back to passing the URL through when Cloudinary is not configured (dev/seed mode).
 *
 * NOTE: If the URL is already a signed Cloudinary URL, it is returned as-is
 * to avoid double-transforming and breaking the signature.
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";
  // Already a signed Cloudinary URL — pass through (transformation is baked in)
  if (isSignedCloudinaryUrl(publicIdOrUrl)) return publicIdOrUrl;
  // Proxy URLs can't be watermarked server-side — pass through
  if (isProxyUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `l_${WATERMARK},w_0.5,g_center,o_40/c_limit,w_${width},q_60,f_webp,a_exif`;
  if (isHttpsUrl(publicIdOrUrl)) {
    // Use Cloudinary fetch to apply watermark to any external/R2 URL.
    // If Cloudinary is not configured, pass through unchanged (dev/seed mode only).
    if (!HAS_CLOUDINARY) return publicIdOrUrl;
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encodeURIComponent(publicIdOrUrl)}`;
  }
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

/**
 * Signed watermarked URL for extra security — prevents URL tampering.
 * Requires CLOUDINARY_API_SECRET to be available server-side for signing.
 *
 * In production this is handled by pre-signing in the server component
 * (see gallery/[magicLinkToken]/page.tsx). This client-safe version falls
 * back to the unsigned watermarkedUrl.
 */
export function signedWatermarkUrl(publicIdOrUrl: string, width = 1200): string {
  return watermarkedUrl(publicIdOrUrl, width);
}

/**
 * Clean (unwatermarked) URL — only for PAID galleries.
 *
 * NOTE: If the URL is already a signed Cloudinary URL, it is returned as-is.
 */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  if (!publicIdOrUrl) return "";
  // Already a signed Cloudinary URL — pass through (transformation is baked in)
  if (isSignedCloudinaryUrl(publicIdOrUrl)) return publicIdOrUrl;
  // HTTPS URLs and proxy URLs pass through unchanged.
  if (isHttpsUrl(publicIdOrUrl) || isProxyUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `c_limit,w_${width},q_85,f_auto,a_exif`;
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

// ─── Unified photo source resolver ──────────────────────────────────────────

/**
 * Photo type with optional pre-signed URLs from the server component.
 * When `_signedWm` and `_signedClean` are set (by the gallery page server
 * component), they take priority over computed URLs — preventing URL tampering.
 */
export type PhotoWithSignedUrls = {
  id?: string;
  cloudinaryId?: string | null;
  s3Key_highRes?: string | null;
  isPurchased?: boolean;
  /** Pre-signed watermarked URL (set by server component) */
  _signedWm?: string;
  /** Pre-signed clean URL (set by server component) */
  _signedClean?: string;
};

/**
 * Get the display URL for a photo, respecting pre-signed URLs when available.
 *
 * @param photo  - Photo object (may include `_signedWm` / `_signedClean` from server)
 * @param clean  - `true` for unwatermarked (PAID), `false` for watermarked
 * @param width  - Target width (only used when falling back to unsigned URLs)
 * @returns The best available URL for displaying this photo
 */
export function getPhotoSrc(
  photo: PhotoWithSignedUrls,
  clean: boolean,
  width?: number,
): string {
  // Prefer pre-signed URLs from the server component
  if (clean && photo._signedClean) return photo._signedClean;
  if (!clean && photo._signedWm) return photo._signedWm;

  // Fallback: compute URL client-side (unsigned — for dev/seed/admin)
  const ref = photoRef(photo);
  return clean ? cleanUrl(ref, width) : watermarkedUrl(ref, width);
}
