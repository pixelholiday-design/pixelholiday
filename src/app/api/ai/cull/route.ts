import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cullGallery } from "@/lib/ai/photo-culler";

// Module 1.9: AI Culling Pre-Filter — quality scoring and categorization.

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Support gallery-level culling (new) or photo-level culling (legacy)
  if (body.galleryId) {
    const result = await cullGallery(body.galleryId);
    return NextResponse.json({
      ok: true,
      total: result.total,
      kept: result.kept,
      maybe: result.maybe,
      rejected: result.rejected,
      results: result.results,
    });
  }

  // Legacy: individual photo IDs with metadata
  const { photoIds = [], metadata = {} } = body;
  if (!photoIds.length) return NextResponse.json({ error: "photoIds or galleryId required" }, { status: 400 });

  let culledCount = 0;
  const results = [];
  for (const id of photoIds) {
    const meta = metadata[id] || {};
    const verdict = analyzeLegacy(meta);

    await prisma.photo.update({
      where: { id },
      data: {
        aiCulled: verdict.cull,
        aiCullReason: verdict.reason || null,
        aiScore: verdict.score,
        aiStatus: verdict.status,
      },
    }).catch(() => {});

    if (verdict.cull) culledCount++;
    results.push({ id, ...verdict });
  }

  return NextResponse.json({
    analyzed: photoIds.length,
    culled: culledCount,
    kept: photoIds.length - culledCount,
    rejected: culledCount,
    results,
  });
}

// Legacy analysis function with scoring
function analyzeLegacy(meta: any = {}): { cull: boolean; reason?: string; score: number; status: "KEEP" | "MAYBE" | "REJECT" } {
  let score = 70; // base
  let reason: string | undefined;

  if (meta.blurScore !== undefined && meta.blurScore < 100) {
    score -= 40; reason = "blurry";
  }
  if (meta.eyesClosed) { score -= 30; reason = "eyes_closed"; }
  if (meta.exposure !== undefined && (meta.exposure < 0.1 || meta.exposure > 0.95)) {
    score -= 25; reason = "bad_exposure";
  }
  if (meta.faces !== undefined && meta.faces === 0) {
    score -= 35; reason = "misfire";
  }

  score = Math.max(0, Math.min(100, score));
  const status: "KEEP" | "MAYBE" | "REJECT" = score >= 70 ? "KEEP" : score >= 40 ? "MAYBE" : "REJECT";
  return { cull: status === "REJECT", reason, score, status };
}

// Admin override to un-cull a photo
export async function PATCH(req: NextRequest) {
  const { photoId } = await req.json();
  await prisma.photo.update({
    where: { id: photoId },
    data: { aiCulled: false, aiCullReason: null, aiStatus: "KEEP", aiScore: 75 },
  });
  return NextResponse.json({ ok: true });
}
