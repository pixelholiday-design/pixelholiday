import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Module 9: AI Auto-Reel Engine
// Detects burst photos (5+ within 10 seconds) and stitches into a 3s reel.
export async function POST(req: NextRequest) {
  const { galleryId, overlayText = "Tunisia Summer 2026", musicTrackId } = await req.json();
  if (!galleryId) return NextResponse.json({ error: "galleryId required" }, { status: 400 });

  const photos = await prisma.photo.findMany({
    where: { galleryId },
    orderBy: { createdAt: "asc" },
  });

  // Burst detection: 5+ photos within a 10-second window
  const bursts: typeof photos[] = [];
  let current: typeof photos = [];
  for (let i = 0; i < photos.length; i++) {
    if (current.length === 0) {
      current = [photos[i]];
      continue;
    }
    const diff = (photos[i].createdAt.getTime() - current[current.length - 1].createdAt.getTime()) / 1000;
    if (diff <= 10) {
      current.push(photos[i]);
    } else {
      if (current.length >= 5) bursts.push(current);
      current = [photos[i]];
    }
  }
  if (current.length >= 5) bursts.push(current);

  const created = [];
  for (const burst of bursts) {
    // Stitch via ffmpeg would happen here in production.
    // For now we record metadata: ffmpeg -framerate 2 -i img%d.jpg -t 3 -loop reel.mp4
    const reel = await prisma.video.create({
      data: {
        galleryId,
        s3Key: `auto-reels/${galleryId}-${Date.now()}.mp4`,
        type: "AUTO_REEL",
        duration: 3,
        isAutoReel: true,
        musicTrackId: musicTrackId ?? null,
        graphicOverlay: overlayText,
      },
    });
    created.push({ reelId: reel.id, photoCount: burst.length });
  }

  return NextResponse.json({ bursts: bursts.length, reels: created });
}
