import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveUrl } from "@/lib/cloudinary.server";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    include: { photos: true },
  });
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (gallery.status !== "PAID" && gallery.status !== "DIGITAL_PASS") {
    return NextResponse.json({ error: "Gallery not paid" }, { status: 402 });
  }
  const ids = gallery.photos.map((p) => p.cloudinaryId || p.s3Key_highRes);
  const url = archiveUrl(ids);
  return NextResponse.redirect(url, 302);
}
