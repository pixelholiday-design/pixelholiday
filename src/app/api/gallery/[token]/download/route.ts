import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveUrl } from "@/lib/cloudinary.server";
import { signedClean } from "@/lib/cloudinary/signed-url";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    include: { photos: true },
  });
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (gallery.expiresAt && gallery.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Gallery expired" }, { status: 410 });
  }
  if (gallery.status !== "PAID" && gallery.status !== "DIGITAL_PASS") {
    return NextResponse.json({ error: "Gallery not paid" }, { status: 402 });
  }

  // Download PIN check
  if (gallery.downloadPin) {
    const url = new URL(_req.url);
    const pin = url.searchParams.get("pin");
    if (pin !== gallery.downloadPin) {
      return NextResponse.json({ error: "Download PIN required", requiresPin: true }, { status: 403 });
    }
  }

  // Download limit enforcement
  if (gallery.maxDownloads) {
    const downloadCount = await prisma.downloadLog.count({
      where: { galleryId: gallery.id },
    });
    if (downloadCount >= gallery.maxDownloads) {
      return NextResponse.json({
        error: "Download limit reached",
        remaining: 0,
        max: gallery.maxDownloads,
      }, { status: 403 });
    }
  }

  // Log this download
  try {
    const forwarded = _req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    await prisma.downloadLog.create({
      data: {
        galleryId: gallery.id,
        type: "FULL_GALLERY",
        ipAddress: ip,
      },
    });
  } catch {
    // Non-blocking — don't fail download if logging fails
  }

  // Primary path: Cloudinary archive (best quality, single ZIP redirect)
  const cloudinaryIds = gallery.photos
    .map((p) => p.cloudinaryId)
    .filter((v): v is string => !!v);

  const cloudinaryConfigured =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryIds.length > 0 && cloudinaryConfigured) {
    try {
      const url = archiveUrl(cloudinaryIds);
      if (url && url !== "#") {
        return NextResponse.redirect(url, 302);
      }
    } catch (e: any) {
      console.warn("Cloudinary archive failed, falling back to individual URLs:", e?.message);
    }
  }

  // Fallback path: return individual download URLs for R2-backed photos.
  // The client (DownloadAllButton) checks for { urls } in the response and
  // triggers individual downloads instead of following a single redirect.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const urls = gallery.photos
    .filter((p) => p.s3Key_highRes)
    .map((p) => {
      // If cloudinaryId is available, use a signed Cloudinary URL (prevents URL tampering).
      if (p.cloudinaryId && cloudinaryConfigured) {
        return signedClean(p.cloudinaryId);
      }
      // Otherwise route through the R2 photo proxy.
      const key = encodeURIComponent(p.s3Key_highRes);
      return `${appUrl}/api/photo/${key}`;
    });

  if (urls.length === 0) {
    return NextResponse.json({ error: "No photos available for download" }, { status: 409 });
  }

  return NextResponse.json({ urls });
}
