import { prisma } from "@/lib/db";
import { photoRef } from "@/lib/cloudinary";

/**
 * Magic Shots / AR overlays (Module 10).
 *
 * applyMagicShot composes a Photo + a MagicElement into a new Photo record.
 * - If the source photo lives on Cloudinary, we build a Cloudinary overlay
 *   transformation URL and store it in the new photo's s3Key_highRes so the
 *   gallery renders the composite.
 * - If Cloudinary isn't available (most seed data), we still create a Photo
 *   row that references the source URL — the gallery layer adds a CSS
 *   overlay using the magic element metadata for live preview.
 */

const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
const HAS_CLOUDINARY = CLOUD && CLOUD !== "demo";

type Position = "TOP" | "CENTER" | "FACE" | "BORDER" | "SCATTER";

const POSITION_TO_CLOUDINARY_GRAVITY: Record<Position, string> = {
  TOP: "north",
  CENTER: "center",
  FACE: "face",
  BORDER: "center",
  SCATTER: "center",
};

function buildCloudinaryComposite(
  publicIdOrUrl: string,
  overlayUrl: string,
  position: Position,
): string {
  // For simple inline previews we wrap the overlay reference in l_fetch:<encoded_url>
  // and apply position gravity. For BORDER we use a full-width overlay; for FACE we
  // pin to detected face center; SCATTER tiles centered.
  const gravity = POSITION_TO_CLOUDINARY_GRAVITY[position];
  const encodedOverlay = Buffer.from(overlayUrl).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const overlay = `l_fetch:${encodedOverlay}`;
  const sizing = position === "BORDER" ? "w_1.0,fl_relative" : "w_0.5,fl_relative";
  const transform = `${overlay},g_${gravity},${sizing}/c_limit,w_1600,q_85,f_auto`;
  // If publicIdOrUrl is already an https URL we wrap with image/fetch
  if (/^https?:\/\//.test(publicIdOrUrl)) {
    const enc = Buffer.from(publicIdOrUrl).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/b64:${enc}`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${publicIdOrUrl}`;
}

export type ApplyMagicShotResult = {
  photoId: string;
  parentPhotoId: string;
  elementId: string;
  composedUrl: string;
  /** True when we built a real composite via Cloudinary. False = client must overlay. */
  composedByCloudinary: boolean;
};

export async function applyMagicShot(
  photoId: string,
  elementId: string,
): Promise<ApplyMagicShotResult> {
  const [photo, element] = await Promise.all([
    prisma.photo.findUnique({ where: { id: photoId } }),
    prisma.magicElement.findUnique({ where: { id: elementId } }),
  ]);
  if (!photo) throw new Error("Photo not found");
  if (!element) throw new Error("Magic element not found");
  if (!element.isActive) throw new Error("Magic element is disabled");

  const sourceRef = photoRef(photo);
  const position = (element.position as Position) || "CENTER";

  let composedUrl = sourceRef;
  let composedByCloudinary = false;
  if (HAS_CLOUDINARY) {
    try {
      composedUrl = buildCloudinaryComposite(sourceRef, element.assetUrl, position);
      composedByCloudinary = true;
    } catch (e) {
      console.warn("Cloudinary composite failed, falling back:", e);
    }
  }

  // Always derive from the original (avoid chains of magic shots)
  const rootParentId = photo.parentPhotoId || photo.id;

  const newPhoto = await prisma.photo.create({
    data: {
      galleryId: photo.galleryId,
      s3Key_highRes: composedUrl,
      cloudinaryId: null,
      isHookImage: false,
      isMagicShot: true,
      parentPhotoId: rootParentId,
      hasMagicElement: true,
      magicElementId: element.id,
      sortOrder: photo.sortOrder + 1,
    },
  });

  // Bump usage on the element
  await prisma.magicElement.update({
    where: { id: element.id },
    data: { usageCount: { increment: 1 } },
  });

  return {
    photoId: newPhoto.id,
    parentPhotoId: rootParentId,
    elementId: element.id,
    composedUrl,
    composedByCloudinary,
  };
}

/**
 * Lightweight preview helper used by the client modal: returns the same URL
 * applyMagicShot would compose, without writing anything to the DB.
 */
export function previewMagicShotUrl(
  source: { cloudinaryId?: string | null; s3Key_highRes?: string | null },
  element: { assetUrl: string; position?: string | null },
): string {
  const sourceRef = photoRef(source);
  if (!HAS_CLOUDINARY) return sourceRef;
  try {
    return buildCloudinaryComposite(
      sourceRef,
      element.assetUrl,
      (element.position as Position) || "CENTER",
    );
  } catch {
    return sourceRef;
  }
}
