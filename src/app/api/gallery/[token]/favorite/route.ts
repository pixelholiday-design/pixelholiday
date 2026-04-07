import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { photoId } = await req.json();
  const gallery = await prisma.gallery.findUnique({ where: { magicLinkToken: params.token } });
  if (!gallery) return NextResponse.json({ ok: false }, { status: 404 });
  const photo = await prisma.photo.findFirst({ where: { id: photoId, galleryId: gallery.id } });
  if (!photo) return NextResponse.json({ ok: false }, { status: 404 });
  const updated = await prisma.photo.update({ where: { id: photo.id }, data: { isFavorited: !photo.isFavorited } });
  return NextResponse.json({ ok: true, isFavorited: updated.isFavorited });
}
