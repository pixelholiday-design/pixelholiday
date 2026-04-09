import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import GalleryView from "./GalleryView";
import { photoRef } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Sanitize photo data before sending to client.
 * For unpaid galleries, replace raw R2 keys/URLs with safe proxy references
 * so the original high-res URL is never exposed in the page HTML/JSON.
 */
function sanitizePhotos(
  photos: Array<{ id: string; s3Key_highRes: string | null; cloudinaryId: string | null; isHookImage: boolean; isFavorited: boolean; isPurchased: boolean; isMagicShot: boolean | null; parentPhotoId: string | null; sortOrder: number }>,
  isPaidGallery: boolean,
) {
  return photos.map((p) => {
    // For paid galleries or individually purchased photos, pass through as-is.
    if (isPaidGallery || p.isPurchased) return p;
    // For unpaid photos: resolve to a safe display reference (proxy URL or cloudinaryId)
    // instead of sending the raw R2 key/URL to the client.
    const safeRef = photoRef(p);
    return { ...p, s3Key_highRes: safeRef };
  });
}

export default async function Page({ params }: { params: { magicLinkToken: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.magicLinkToken },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, s3Key_highRes: true, cloudinaryId: true, isHookImage: true,
          isFavorited: true, isPurchased: true, isMagicShot: true, parentPhotoId: true,
          sortOrder: true,
        },
      },
      customer: true, photographer: true, location: true,
    },
  });
  if (!gallery) return notFound();

  const isPaid = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
  const safeGallery = {
    ...gallery,
    photos: sanitizePhotos(gallery.photos, isPaid),
  };

  const reel = await prisma.videoReel.findFirst({
    where: { galleryId: gallery.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    select: { id: true, duration: true, thumbnailUrl: true },
  });
  return <GalleryView gallery={safeGallery as any} reel={reel} />;
}
