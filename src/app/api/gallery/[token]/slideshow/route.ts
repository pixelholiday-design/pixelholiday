import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateSlideshowHtml, getTrackById } from "@/lib/slideshow";
import { photoRef } from "@/lib/cloudinary";

const createSchema = z.object({
  photoIds: z.array(z.string()).min(5).max(30),
  musicTrackId: z.string().min(1),
  duration: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  title: z.string().optional(),
});

/** POST — generate a slideshow preview and save VideoReel */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { photoIds, musicTrackId, duration, title } = parsed.data;

  const track = getTrackById(musicTrackId);
  if (!track) {
    return NextResponse.json({ ok: false, error: "Unknown music track" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    include: { photos: { select: { id: true, s3Key_highRes: true, cloudinaryId: true } } },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  // Validate all photoIds belong to this gallery
  const galleryPhotoMap = new Map(gallery.photos.map((p) => [p.id, p]));
  const invalidIds = photoIds.filter((id) => !galleryPhotoMap.has(id));
  if (invalidIds.length > 0) {
    return NextResponse.json({ ok: false, error: "Some photo IDs are not in this gallery" }, { status: 400 });
  }

  // Resolve photo URLs in the order requested
  const photoUrls = photoIds.map((id) => {
    const photo = galleryPhotoMap.get(id)!;
    return photoRef(photo);
  });

  const previewHtml = generateSlideshowHtml(photoUrls, musicTrackId, duration, title);

  // Use first photo as thumbnail
  const thumbnailUrl = photoUrls[0] ?? null;

  const reel = await prisma.videoReel.upsert({
    where: {
      id: (await prisma.videoReel.findFirst({
        where: { galleryId: gallery.id, status: { in: ["READY", "GENERATING"] } },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      }))?.id ?? "",
    },
    update: {
      photoIds: JSON.stringify(photoIds),
      musicTrack: musicTrackId,
      duration,
      status: "READY",
      previewHtml,
      thumbnailUrl,
    },
    create: {
      galleryId: gallery.id,
      photoIds: JSON.stringify(photoIds),
      musicTrack: musicTrackId,
      duration,
      status: "READY",
      previewHtml,
      thumbnailUrl,
    },
  });

  const previewUrl = `/api/gallery/${params.token}/slideshow?reelId=${reel.id}`;

  return NextResponse.json({ ok: true, reelId: reel.id, previewUrl });
}

/** GET — returns the slideshow HTML for preview/download */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { searchParams } = new URL(req.url);
  const reelId = searchParams.get("reelId");

  if (!reelId) {
    return NextResponse.json({ ok: false, error: "reelId required" }, { status: 400 });
  }

  // Verify the reel belongs to this gallery token
  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: { id: true },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  const reel = await prisma.videoReel.findFirst({
    where: { id: reelId, galleryId: gallery.id },
    select: { previewHtml: true, status: true },
  });
  if (!reel || !reel.previewHtml) {
    return NextResponse.json({ ok: false, error: "Slideshow not found" }, { status: 404 });
  }

  return new Response(reel.previewHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
