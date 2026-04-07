// Pure URL helpers — safe to import from client and server.
// The cloudinary SDK lives in `cloudinary.server.ts` and must only be imported server-side.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "demo";
const WATERMARK = process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID || process.env.CLOUDINARY_WATERMARK_PUBLIC_ID || "pixelholiday_watermark";

/**
 * Server-side watermarked URL.
 * Transformation: l_<watermark>,w_0.5,g_center,o_40 / c_limit,w_<width>,q_60,f_webp
 */
export function watermarkedUrl(publicIdOrUrl: string, width = 1200): string {
  const transform = `l_${WATERMARK},w_0.5,g_center,o_40/c_limit,w_${width},q_60,f_webp`;
  if (/^https?:\/\//.test(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicIdOrUrl}`;
}

/** Clean (unwatermarked) URL — only for PAID galleries */
export function cleanUrl(publicIdOrUrl: string, width = 1600): string {
  const transform = `c_limit,w_${width},q_85,f_auto`;
  if (/^https?:\/\//.test(publicIdOrUrl)) {
    const encoded = encodeURIComponent(publicIdOrUrl);
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encoded}`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicIdOrUrl}`;
}
