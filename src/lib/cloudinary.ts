// Pure URL helpers — safe to import from client and server.
// The cloudinary SDK lives in `cloudinary.server.ts` and must only be imported server-side.

const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
const WATERMARK =
  process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID ||
  process.env.CLOUDINARY_WATERMARK_PUBLIC_ID ||
  "pixelholiday_watermark";

// If Cloudinary isn't configured (empty env) OR the value is the placeholder "demo",
// we fall back to passing URLs through unchanged instead of building a Cloudinary URL
// that would 404. This keeps seed data (picsum / unsplash URLs) visible in the gallery.
const HAS_CLOUDINARY = CLOUD && CLOUD !== "demo";

function isHttpsUrl(s: string): boolean {
  return /^https?:\/\//.test(s);
}

/**
 * Resolve a Photo (with cloudinaryId + s3Key_highRes) to the best image source.
 * Prefers a stored full URL when present; falls back to cloudinary publicId.
 */
export function photoRef(p: { cloudinaryId?: string | null; s3Key_highRes?: string | null }): string {
  const raw = p.s3Key_highRes || "";
  // Best case: s3Key_highRes already holds a full URL.
  if (isHttpsUrl(raw)) return raw;
  // Bare R2 object key (e.g. "uploads/1775..." from older uploads): expand to public R2 URL.
  if (raw && raw.includes("/")) {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";
    if (base) return `${base.replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
  }
  // Cloudinary publicId — only trust if it does NOT look like an R2 path. Old broken records
  // stored the R2 key in cloudinaryId, which Cloudinary resolves to a 404.
  const cid = p.cloudinaryId || "";
  if (cid && !cid.startsWith("uploads/")) return cid;
  return raw || "";
}

/**
 * Server-side watermarked URL.
 * Transformation: l_<watermark>,w_0.5,g_center,o_40 / c_limit,w_<width>,q_60,f_webp,a_exif
 * a_exif = auto-rotate based on EXIF orientation tag.
 * Falls back to the raw URL when Cloudinary isn't configured and input is already HTTPS.
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";
  // HTTPS URLs (seed picsum, R2 public URLs, etc.) pass through unchanged.
  // Cloudinary's image/fetch is unreliable cross-host and was breaking production
  // galleries. Real uploads go through the cloudinary publicId branch below.
  if (isHttpsUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `l_${WATERMARK},w_0.5,g_center,o_40/c_limit,w_${width},q_60,f_webp,a_exif`;
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

/** Clean (unwatermarked) URL — only for PAID galleries */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  if (!publicIdOrUrl) return "";
  // HTTPS URLs pass through unchanged — see watermarkedUrl note.
  if (isHttpsUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `c_limit,w_${width},q_85,f_auto,a_exif`;
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}
