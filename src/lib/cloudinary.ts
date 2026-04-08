// Pure URL helpers — safe to import from client and server.
// The cloudinary SDK lives in `cloudinary.server.ts` and must only be imported server-side.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "demo";
const WATERMARK = process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID || process.env.CLOUDINARY_WATERMARK_PUBLIC_ID || "pixelholiday_watermark";

/**
 * Resolve a Photo (with cloudinaryId + s3Key_highRes) to the best image source.
 * Prefers a stored full URL when present; falls back to cloudinary publicId.
 * `a_exif` in downstream transforms auto-rotates via EXIF orientation.
 */
export function photoRef(p: { cloudinaryId?: string | null; s3Key_highRes?: string | null }): string {
  const url = p.s3Key_highRes || "";
  if (/^https?:\/\//.test(url)) return url;
  if (p.cloudinaryId && p.cloudinaryId.length > 0) return p.cloudinaryId;
  return url || "";
}

/**
 * Server-side watermarked URL.
 * Transformation: l_<watermark>,w_0.5,g_center,o_40 / c_limit,w_<width>,q_60,f_webp,a_exif
 * a_exif = auto-rotate based on EXIF orientation tag.
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  if (!publicIdOrUrl) return "";
  const transform = `l_${WATERMARK},w_0.5,g_center,o_40/c_limit,w_${width},q_60,f_webp,a_exif`;
  if (/^https?:\/\//.test(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicIdOrUrl}`;
}

/** Clean (unwatermarked) URL — only for PAID galleries */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  if (!publicIdOrUrl) return "";
  const transform = `c_limit,w_${width},q_85,f_auto,a_exif`;
  if (/^https?:\/\//.test(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicIdOrUrl}`;
}
