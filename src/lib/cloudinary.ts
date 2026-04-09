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
 * Resolve a Photo (with cloudinaryId + s3Key_highRes) to the best image source.
 * Prefers a stored full URL when present; falls back to cloudinary publicId.
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
  // Cloudinary publicId — only trust if it does NOT look like an R2 path.
  const cid = p.cloudinaryId || "";
  if (cid && !cid.startsWith("uploads/")) return cid;
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
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";
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
 * TODO: implement signing using cloudinary.url() with sign_url:true from cloudinary.server.ts
 */
export function signedWatermarkUrl(publicIdOrUrl: string, width = 1200): string {
  // TODO: call cloudinary.url(publicIdOrUrl, { sign_url: true, transformation: [...] }) server-side
  return watermarkedUrl(publicIdOrUrl, width);
}

/** Clean (unwatermarked) URL — only for PAID galleries */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  if (!publicIdOrUrl) return "";
  // HTTPS URLs and proxy URLs pass through unchanged.
  if (isHttpsUrl(publicIdOrUrl) || isProxyUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `c_limit,w_${width},q_85,f_auto,a_exif`;
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}
