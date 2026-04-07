import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveUrl } from "@/lib/cloudinary.server";

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
  const ids = gallery.photos.map((p) => p.cloudinaryId).filter((v): v is string => !!v);
  if (ids.length === 0) {
    return NextResponse.json({ error: "No Cloudinary-backed photos to archive" }, { status: 409 });
  }
  const url = archiveUrl(ids);
  return NextResponse.redirect(url, 302);
}
