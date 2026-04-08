import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const reels = await prisma.videoReel.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      gallery: {
        select: {
          id: true,
          magicLinkToken: true,
          status: true,
          location: { select: { name: true } },
          photographer: { select: { name: true } },
          customer: { select: { name: true } },
        },
      },
    },
  });
  const summary = reels.map((r) => {
    let photoCount = 0;
    try {
      photoCount = JSON.parse(r.photoIds).length;
    } catch {}
    return {
      id: r.id,
      galleryId: r.galleryId,
      gallery: r.gallery,
      photoCount,
      duration: r.duration,
      musicTrack: r.musicTrack,
      status: r.status,
      thumbnailUrl: r.thumbnailUrl,
      createdAt: r.createdAt,
    };
  });
  return NextResponse.json({
    count: reels.length,
    ready: reels.filter((r) => r.status === "READY").length,
    reels: summary,
  });
}
