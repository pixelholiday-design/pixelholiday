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

  // Determine content type and parse accordingly
  const contentType = req.headers.get("content-type") || "";
  let galleryId: string | undefined;
  let photoUrl: string | undefined;
  let hasFile = false;
  let fileName: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    // FormData upload (Lightroom HTTP export plugin sends files this way)
    const formData = await req.formData();
    galleryId = formData.get("galleryId") as string | undefined;
    const file = formData.get("file") as File | null;
    if (file) {
      hasFile = true;
      fileName = file.name || "upload.jpg";
      // In production, the file would be uploaded to R2 via presigned URL.
      // For now, acknowledge the file and return a placeholder reference.
      photoUrl = `lightroom-upload://${fileName}`;
    }
    // Also accept photoUrl via form field as fallback
    if (!photoUrl) {
      photoUrl = formData.get("photoUrl") as string | undefined;
    }
  } else {
    // JSON body
    const body = await req.json().catch(() => ({}));
    galleryId = body.galleryId;
    photoUrl = body.photoUrl || body.url;
  }

  if (!galleryId) {
    return NextResponse.json({
      error: "galleryId is required",
      usage: {
        endpoint: "POST /api/upload/lightroom",
        headers: { "Authorization": "Bearer fq_live_xxx" },
        json: { galleryId: "gallery-id", photoUrl: "https://..." },
        multipart: "Send 'file' (image) + 'galleryId' as form fields",
      },
    }, { status: 400 });
  }

  if (!photoUrl && !hasFile) {
    return NextResponse.json({
      error: "Provide a file (multipart) or photoUrl (JSON)",
    }, { status: 400 });
  }

  // Create photo record
  const photo = await prisma.photo.create({
    data: {
      galleryId,
      s3Key_highRes: photoUrl || `lightroom-upload://${Date.now()}`,
      sortOrder: await prisma.photo.count({ where: { galleryId } }),
    },
  });

  return NextResponse.json({
    ok: true,
    photoId: photo.id,
    galleryId,
    ...(hasFile && { note: "File received. In production, this would be stored in R2." }),
  });
}
