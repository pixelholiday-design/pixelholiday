import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { enqueueSync } from "@/lib/sync-queue";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const schema = z.object({ photoId: z.string().min(1), galleryId: z.string().min(1) });

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400, headers: CORS });

  const photo = await prisma.photo.findFirst({
    where: { id: parsed.data.photoId, galleryId: parsed.data.galleryId },
  });
  if (!photo) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404, headers: CORS });

  const updated = await prisma.photo.update({
    where: { id: photo.id },
    data: { isFavorited: !photo.isFavorited },
  });

  await enqueueSync({
    type: "favorite",
    action: "update",
    localId: photo.id,
    payload: { isFavorited: updated.isFavorited },
    priority: 5,
  });

  return NextResponse.json({ ok: true, isFavorited: updated.isFavorited }, { headers: CORS });
}
