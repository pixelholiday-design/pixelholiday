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
 * Server-side watermarked URL.
 * Transformation: l_<watermark>,w_0.5,g_center,o_40 / c_limit,w_<width>,q_60,f_webp
 * Falls back to the raw URL when Cloudinary isn't configured and input is already HTTPS.
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";
  if (!HAS_CLOUDINARY && isHttpsUrl(publicIdOrUrl)) return publicIdOrUrl;
  const transform = `l_${WATERMARK},w_0.5,g_center,o_40/c_limit,w_${width},q_60,f_webp`;
  if (isHttpsUrl(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD || "demo"}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

/** Clean (unwatermarked) URL — only for PAID galleries */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  if (!publicIdOrUrl) return "";
  if (!HAS_CLOUDINARY && isHttpsUrl(publicIdOrUrl)) return publicIdOrUrl;
  // a_auto → auto-rotate based on EXIF orientation. c_limit preserves aspect.
  const transform = `a_auto,c_limit,w_${width},q_85,f_auto`;
  if (isHttpsUrl(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD || "demo"}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}
