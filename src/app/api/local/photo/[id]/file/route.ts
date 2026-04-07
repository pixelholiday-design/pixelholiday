import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readPhotoFile } from "@/lib/local-storage";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

/**
 * Streams the actual photo bytes from the sale-kiosk SSD. Falls back to a
 * 302 redirect into Cloudinary or R2 if the file isn't on disk yet
 * (e.g. when running in mixed cloud+local mode and the night sync hasn't
 * pulled the photo down yet).
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const photo = await prisma.photo.findUnique({ where: { id: params.id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });

  const buf = await readPhotoFile(photo.galleryId, photo.id);
  if (buf) {
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        ...CORS,
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Fallback: redirect to the cloud copy if we have one.
  const cloud = photo.cloudinaryId_edited || photo.cloudinaryId;
  if (cloud) {
    const cn = process.env.CLOUDINARY_CLOUD_NAME || "demo";
    const url = cloud.startsWith("http")
      ? cloud
      : `https://res.cloudinary.com/${cn}/image/upload/c_limit,w_1600,q_auto,f_auto/${cloud}`;
    return NextResponse.redirect(url, { status: 302, headers: CORS });
  }
  if (photo.s3Key_highRes?.startsWith("http")) {
    return NextResponse.redirect(photo.s3Key_highRes, { status: 302, headers: CORS });
  }
  return NextResponse.json({ error: "Photo file unavailable" }, { status: 410, headers: CORS });
}
