import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import GalleryView from "./GalleryView";
import PasswordGate from "@/components/gallery/PasswordGate";
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

    // Only sign Cloudinary-native uploads (not external URLs like picsum or R2)
    // External URLs go through watermarkedUrl()/cleanUrl() on the client side
    const isCloudinaryNative = canSign && source && !source.startsWith("/api/photo/") && !/^https?:\/\//.test(source);
    if (isCloudinaryNative) {
      _signedWm = signedPreview(source);
      if (isClean) _signedClean = signedClean(source);
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

// OG metadata for social sharing
export async function generateMetadata({
  params,
}: {
  params: { magicLinkToken: string };
}): Promise<Metadata> {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.magicLinkToken },
    include: {
      photos: { where: { isHookImage: true }, take: 1, select: { cloudinaryId: true, s3Key_highRes: true } },
      photographer: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!gallery) return { title: "Gallery Not Found" };

  const photographerName = gallery.photographer?.name || "Fotiqo";
  const locationName = gallery.location?.name || "";
  const title = `${photographerName}'s Gallery${locationName ? ` — ${locationName}` : ""}`;
  const description = `View ${gallery.totalCount || 0} photos from ${photographerName}. Powered by Fotiqo.`;

  // Use hook image for OG preview (watermarked)
  const hookPhoto = gallery.photos[0];
  const ogImage = hookPhoto?.cloudinaryId
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "fotiqo"}/image/upload/w_1200,h_630,c_fill,q_80/${hookPhoto.cloudinaryId}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
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

  // Password protection gate
  const cookieStore = cookies();
  if (gallery.accessPassword) {
    const accessCookie = cookieStore.get(`gallery_access_${params.magicLinkToken}`);
    if (!accessCookie || accessCookie.value !== "granted") {
      return <PasswordGate token={params.magicLinkToken} />;
    }
  }

  const isPaid = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";

  // Download limits info
  const downloadCount = gallery.maxDownloads
    ? await prisma.downloadLog.count({ where: { galleryId: gallery.id } })
    : 0;

  const safeGallery = {
    ...gallery,
    photos: sanitizePhotos(gallery.photos, isPaid),
    _downloadCount: downloadCount,
  };

  const reel = await prisma.videoReel.findFirst({
    where: { galleryId: gallery.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    select: { id: true, duration: true, thumbnailUrl: true },
  });

  // Detect locale: URL param > cookie > customer auto-detect > Accept-Language
  const headersList = headers();
  const customerLang = gallery.customer?.detectedLanguage || gallery.customer?.preferredLocale;
  const locale = detectLocale({
    searchParams,
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: customerLang || headersList.get("accept-language") || undefined,
  });
  const messages = await loadMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <GalleryView gallery={safeGallery as any} reel={reel} galleryTheme={(gallery as any).galleryTheme || "classic"} />
    </I18nProvider>
  );
}
