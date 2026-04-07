import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  type: z.enum(["view", "individual_original", "individual_4096", "individual_4000", "individual_1080", "zip_all"]),
  photoId: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const gallery = await prisma.gallery.findUnique({ where: { magicLinkToken: params.token } });
  if (!gallery) return NextResponse.json({ ok: false }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
  const ua = req.headers.get("user-agent") || null;

  if (parsed.data.type === "view") {
    await prisma.galleryViewLog.create({
      data: { galleryId: gallery.id, ipAddress: ip, userAgent: ua },
    });
  } else {
    await prisma.downloadLog.create({
      data: { galleryId: gallery.id, type: parsed.data.type, photoId: parsed.data.photoId, ipAddress: ip },
    });
  }
  return NextResponse.json({ ok: true });
}
