import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPrice } from "@/lib/pricing";
import { photoRef, watermarkedUrl } from "@/lib/cloudinary";
import { signPhotoSource } from "@/lib/cloudinary/signed-url";

const PRESETS = ["auto", "warm", "cool", "vibrant", "portrait"] as const;
type Preset = (typeof PRESETS)[number];

const schema = z.object({
  photoId: z.string().min(1),
  preset: z.enum(PRESETS),
});

/**
 * Cloudinary transformation strings per preset.
 * Applied via the fetch endpoint so any source URL (R2, etc.) gets transformed server-side.
 */
const PRESET_TRANSFORMS: Record<Preset, string> = {
  auto: "e_auto_brightness,e_auto_color,e_improve",
  warm: "e_tint:60:orange:0p:yellow:100p",
  cool: "e_tint:40:blue:0p:cyan:100p",
  vibrant: "e_vibrance:40,e_auto_saturation",
  portrait: "e_improve:indoor,e_auto_brightness",
};

function buildPreviewUrl(publicIdOrUrl: string, preset: Preset, width = 1200): string {
  const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const transform = `${PRESET_TRANSFORMS[preset]}/c_limit,w_${width},q_75,f_auto`;

  const isHttps = /^https?:\/\//.test(publicIdOrUrl);
  if (isHttps) {
    if (!CLOUD || CLOUD === "demo") return publicIdOrUrl;
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encodeURIComponent(publicIdOrUrl)}`;
  }
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

function buildOriginalUrl(publicIdOrUrl: string, width = 1200): string {
  const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const transform = `c_limit,w_${width},q_75,f_auto`;

  const isHttps = /^https?:\/\//.test(publicIdOrUrl);
  if (isHttps) {
    if (!CLOUD || CLOUD === "demo") return publicIdOrUrl;
    return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transform}/${encodeURIComponent(publicIdOrUrl)}`;
  }
  return `https://res.cloudinary.com/${CLOUD || "demo"}/image/upload/${transform}/${publicIdOrUrl}`;
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { photoId, preset } = parsed.data;

    const gallery = await prisma.gallery.findUnique({
      where: { magicLinkToken: params.token },
      select: { id: true, locationId: true, expiresAt: true, status: true },
    });
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }
    if (gallery.expiresAt && new Date(gallery.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Gallery expired" }, { status: 410 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, galleryId: gallery.id },
      select: { id: true, cloudinaryId: true, s3Key_highRes: true },
    });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found in this gallery" }, { status: 404 });
    }

    const ref = photoRef(photo);
    const previewUrl = buildPreviewUrl(ref, preset);
    const isPaid = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
    // Only expose the unwatermarked original for paid galleries;
    // unpaid galleries get a signed watermarked version to prevent bypass.
    const originalUrl = isPaid
      ? signPhotoSource(ref, { width: 1200, watermark: false })
      : signPhotoSource(ref, { width: 1200, watermark: true });
    const price = await getPrice("retouch_credit", gallery.locationId);

    return NextResponse.json({
      previewUrl,
      originalUrl,
      preset,
      price,
      currency: "EUR",
    });
  } catch (err: any) {
    console.error("[retouch] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
