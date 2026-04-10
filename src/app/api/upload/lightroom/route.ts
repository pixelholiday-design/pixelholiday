import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/upload/lightroom — Lightroom-compatible upload endpoint.
 * Auth via Bearer token (API key from /api/keys).
 * Accepts multipart/form-data or JSON with photo URLs.
 */
export async function POST(req: Request) {
  // Validate API key
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key. Use: Authorization: Bearer fq_live_xxx" }, { status: 401 });
  }
  const key = auth.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey || !apiKey.isActive) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  // Update last used
  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });

  // Get user's org
  const user = await prisma.user.findUnique({
    where: { id: apiKey.userId },
    select: { id: true, orgId: true, locationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // For now: accept JSON body with gallery reference
  const body = await req.json().catch(() => ({}));
  const galleryId = body.galleryId;
  const photoUrl = body.photoUrl || body.url;

  if (!galleryId && !photoUrl) {
    return NextResponse.json({
      error: "Provide galleryId + photoUrl, or use /api/upload/presigned for direct file upload",
      usage: {
        endpoint: "POST /api/upload/lightroom",
        headers: { "Authorization": "Bearer fq_live_xxx", "Content-Type": "application/json" },
        body: { galleryId: "gallery-id", photoUrl: "https://..." },
      },
    }, { status: 400 });
  }

  // Create photo record
  if (galleryId && photoUrl) {
    const photo = await prisma.photo.create({
      data: {
        galleryId,
        s3Key_highRes: photoUrl,
        sortOrder: await prisma.photo.count({ where: { galleryId } }),
      },
    });
    return NextResponse.json({ ok: true, photoId: photo.id, galleryId });
  }

  return NextResponse.json({ error: "galleryId and photoUrl required" }, { status: 400 });
}
