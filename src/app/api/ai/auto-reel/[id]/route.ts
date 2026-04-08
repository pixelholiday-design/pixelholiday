import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const reel = await prisma.videoReel.findUnique({
    where: { id: params.id },
    include: {
      gallery: {
        select: {
          id: true,
          magicLinkToken: true,
          location: { select: { name: true } },
          customer: { select: { name: true } },
        },
      },
    },
  });
  if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let photoIds: string[] = [];
  try {
    photoIds = JSON.parse(reel.photoIds);
  } catch {}
  return NextResponse.json({
    id: reel.id,
    galleryId: reel.galleryId,
    gallery: reel.gallery,
    photoIds,
    photoCount: photoIds.length,
    musicTrack: reel.musicTrack,
    duration: reel.duration,
    status: reel.status,
    thumbnailUrl: reel.thumbnailUrl,
    previewHtml: reel.previewHtml,
    createdAt: reel.createdAt,
  });
}
