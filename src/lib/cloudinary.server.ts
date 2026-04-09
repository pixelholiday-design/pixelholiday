import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Serverless ZIP archive URL via Cloudinary generate_archive (server-only) */
export function archiveUrl(publicIds: string[]): string {
  try {
    return cloudinary.utils.download_zip_url({
      public_ids: publicIds,
      target_public_id: "Fotiqo_Memories",
      resource_type: "image",
    });
  } catch {
    return "#";
  }
}

/**
 * Upload a remote URL to Cloudinary under a folder.
 * Returns { public_id, secure_url } on success, or null if not configured.
 */
export async function uploadToCloudinary(url: string, folder: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return null;
  }
  try {
    const res = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: "auto",
      // Auto-rotate based on EXIF orientation and bake the result, so downstream
      // renders don't need to honor EXIF. Equivalent to `sharp(buf).rotate()`.
      angle: "exif",
      image_metadata: false,
    });
    return { public_id: res.public_id, secure_url: res.secure_url };
  } catch (e) {
    console.warn("uploadToCloudinary failed", e);
    return null;
  }
}

export { cloudinary };
