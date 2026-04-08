import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReelForGallery } from "@/lib/ai/reel-generator";

export const dynamic = "force-dynamic";

const schema = z.object({
  galleryId: z.string().min(1),
  musicTrack: z.enum(["upbeat", "romantic", "adventure"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await generateReelForGallery({
      galleryId: parsed.data.galleryId,
      musicTrack: parsed.data.musicTrack,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Not enough photos in this gallery to generate a reel (need 5+)." },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("auto-reel error", e);
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
  }
}
