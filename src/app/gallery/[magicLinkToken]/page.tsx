import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import GalleryView from "./GalleryView";
import { photoRef } from "@/lib/cloudinary";
import {
  signedPreview,
  signedClean,
  signPhotoSource,
  hasSigningCapability,
} from "@/lib/cloudinary/signed-url";
import { detectLocale, loadMessages, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n-client";

export const dynamic = "force-dynamic";

/**
 * Resolve the Cloudinary-signable source for a photo.
 * Returns a cloudinaryId (for native uploads) or an HTTPS URL (for R2/external).
 */
function resolveSource(p: {
  cloudinaryId?: string | null;
  s3Key_highRes?: string | null;
}): string {
  // Prefer cloudinaryId for native Cloudinary uploads (signing works best)
  const cid = p.cloudinaryId || "";
  if (cid && !cid.startsWith("uploads/") && !cid.startsWith("sample") && cid.includes("/")) {
    return cid;
  }
  // Fall back to resolved photoRef (R2 URL, proxy, etc.)
  return photoRef(p);
}

/**
 * Sanitize photo data before sending to client.
 * - Pre-computes **signed** Cloudinary URLs (_signedWm / _signedClean) so
 *   the client never builds unsigned URLs that could be tampered with.
 * - For unpaid photos, replaces raw R2 keys/URLs with safe proxy references
 *   so the original high-res URL is never exposed in the page HTML/JSON.
 */
function sanitizePhotos(
  photos: Array<{
    id: string;
    s3Key_highRes: string | null;
    cloudinaryId: string | null;
    isHookImage: boolean;
    isFavorited: boolean;
    isPurchased: boolean;
    isMagicShot: boolean | null;
    parentPhotoId: string | null;
    sortOrder: number;
  }>,
  isPaidGallery: boolean,
) {
  const canSign = hasSigningCapability();

  return photos.map((p) => {
    const source = resolveSource(p);
    const isClean = isPaidGallery || p.isPurchased;

    // Pre-compute signed URLs (when Cloudinary signing is configured)
    let _signedWm: string | undefined;
    let _signedClean: string | undefined;

    if (canSign && source && !source.startsWith("/api/photo/")) {
      // Watermarked preview — always generated (used for unpaid display)
      _signedWm = /^https?:\/\//.test(source)
        ? signPhotoSource(source, { width: 1200, watermark: true })
        : signedPreview(source);

      // Clean (unwatermarked) — only for paid galleries / purchased photos
      if (isClean) {
        _signedClean = /^https?:\/\//.test(source)
          ? signPhotoSource(source, { width: 1600, watermark: false })
          : signedClean(source);
      }
    }

    // For unpaid photos: replace raw keys with safe proxy reference
    const safeRef = isClean ? p.s3Key_highRes : photoRef(p);

    return {
      ...p,
      s3Key_highRes: safeRef,
      _signedWm,
      _signedClean,
    };
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { magicLinkToken: string };
  searchParams: { lang?: string };
}) {
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

  // Detect locale from URL param > cookie > Accept-Language
  const cookieStore = cookies();
  const headersList = headers();
  const locale = detectLocale({
    searchParams,
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headersList.get("accept-language") || undefined,
  });
  const messages = await loadMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <GalleryView gallery={safeGallery as any} reel={reel} />
    </I18nProvider>
  );
}
