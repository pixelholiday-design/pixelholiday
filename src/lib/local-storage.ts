import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Local file storage for the sale-kiosk PC.
 *
 * Photos uploaded via SD card / WiFi transmitter / phone are stored on the
 * sale-kiosk's SSD at:
 *   <DATA_ROOT>/photos/<galleryId>/<photoId>.jpg
 *
 * Gallery kiosks then fetch them from /api/local/photo/[id]/file which streams
 * the file straight off disk — no internet, no cloud, no Cloudinary.
 *
 * In dev (Windows / containerised) the data root falls back to ./data inside
 * the project so everything still works without writing to /var.
 */

const DATA_ROOT =
  process.env.FOTIQO_DATA_ROOT ||
  (process.platform === "win32"
    ? path.join(process.cwd(), "data")
    : "/var/lib/fotiqo/data");

export function photoPath(galleryId: string, photoId: string) {
  return path.join(DATA_ROOT, "photos", galleryId, `${photoId}.jpg`);
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function writePhotoFile(
  galleryId: string,
  photoId: string,
  data: Buffer
): Promise<string> {
  const filePath = photoPath(galleryId, photoId);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
  return filePath;
}

export async function readPhotoFile(
  galleryId: string,
  photoId: string
): Promise<Buffer | null> {
  try {
    return await fs.readFile(photoPath(galleryId, photoId));
  } catch {
    return null;
  }
}

export async function photoExists(
  galleryId: string,
  photoId: string
): Promise<boolean> {
  try {
    await fs.access(photoPath(galleryId, photoId));
    return true;
  } catch {
    return false;
  }
}

export function getDataRoot() {
  return DATA_ROOT;
}
