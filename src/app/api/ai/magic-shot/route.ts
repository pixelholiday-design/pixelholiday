import { NextResponse } from "next/server";
import { z } from "zod";
import { applyMagicShot } from "@/lib/ai/magic-shot";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  photoId: z.string().min(1),
  // Accept either "elementId" (current spec) or "magicElementId" (legacy)
  elementId: z.string().min(1).optional(),
  magicElementId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const elementId = parsed.data.elementId || parsed.data.magicElementId;
  if (!elementId) {
    return NextResponse.json({ error: "elementId required" }, { status: 400 });
  }

  try {
    const result = await applyMagicShot(parsed.data.photoId, elementId);
    const newPhoto = await prisma.photo.findUnique({
      where: { id: result.photoId },
      select: {
        id: true,
        s3Key_highRes: true,
        cloudinaryId: true,
        isMagicShot: true,
        parentPhotoId: true,
        magicElementId: true,
      },
    });
    return NextResponse.json({ ok: true, ...result, photo: newPhoto });
  } catch (e: any) {
    console.error("magic-shot error", e);
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
  }
}
