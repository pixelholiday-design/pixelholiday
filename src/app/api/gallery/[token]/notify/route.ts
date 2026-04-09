import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { liveStream, type LivePhotoEvent } from "@/lib/live-stream";
import { photoRef } from "@/lib/cloudinary";

const schema = z.object({
  /** IDs of the newly added photos (from the upload response) */
  photoIds: z.array(z.string()).min(1).max(200),
});

/**
 * POST /api/gallery/[token]/notify — Trigger SSE events for new photos.
 *
 * Called after a photographer uploads photos to a gallery. Pushes a
 * `new_photos` event to all connected SSE clients (customer's gallery page,
 * kiosk TV display, etc.).
 *
 * Returns the current viewer count so the photographer knows how many
 * people are watching their live session.
 */
export async function POST(
  req: Request,
  { params }: { params: { token: string } },
) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: {
      id: true,
      locationId: true,
      photographer: { select: { name: true } },
    },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  // Fetch the new photo records
  const photos = await prisma.photo.findMany({
    where: { id: { in: parsed.data.photoIds }, galleryId: gallery.id },
    select: {
      id: true,
      s3Key_highRes: true,
      cloudinaryId: true,
      isHookImage: true,
      createdAt: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  if (photos.length === 0) {
    return NextResponse.json({ ok: false, error: "No matching photos found" }, { status: 404 });
  }

  // Total photo count for the gallery
  const totalCount = await prisma.photo.count({ where: { galleryId: gallery.id } });

  const event: LivePhotoEvent = {
    type: "new_photos",
    galleryId: gallery.id,
    locationId: gallery.locationId,
    photos: photos.map((p) => ({
      id: p.id,
      thumbnailUrl: photoRef(p),
      fullUrl: photoRef(p),
      isHookImage: p.isHookImage,
      createdAt: p.createdAt.toISOString(),
    })),
    totalCount,
    photographerName: gallery.photographer.name,
  };

  // Broadcast to gallery viewers AND location-wide viewers (TV display)
  liveStream.broadcast(params.token, gallery.locationId, event);

  const viewers = liveStream.getGalleryViewerCount(params.token);

  return NextResponse.json({ ok: true, notified: photos.length, viewers });
}

/**
 * GET /api/gallery/[token]/notify — Get current viewer count.
 */
export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const viewers = liveStream.getGalleryViewerCount(params.token);
  return NextResponse.json({ viewers, stats: liveStream.getStats() });
}
