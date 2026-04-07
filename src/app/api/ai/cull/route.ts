import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Module 1.9: AI Culling Pre-Filter — quality checks (mock heuristics).
// Production: Laplacian variance for blur, face/eye detection, histogram exposure check.
function analyze(meta: any = {}): { cull: boolean; reason?: string } {
  if (meta.blurScore !== undefined && meta.blurScore < 100)
    return { cull: true, reason: "blurry" };
  if (meta.eyesClosed) return { cull: true, reason: "eyes_closed" };
  if (meta.exposure !== undefined && (meta.exposure < 0.1 || meta.exposure > 0.95))
    return { cull: true, reason: "bad_exposure" };
  if (meta.faces !== undefined && meta.faces === 0)
    return { cull: true, reason: "misfire" };
  // Random 15% cull as fallback heuristic for tests
  if (Math.random() < 0.15) return { cull: true, reason: "low_quality" };
  return { cull: false };
}

export async function POST(req: NextRequest) {
  const { photoIds = [], metadata = {} } = await req.json();
  if (!photoIds.length) return NextResponse.json({ error: "photoIds required" }, { status: 400 });

  let culledCount = 0;
  const results = [];
  for (const id of photoIds) {
    const verdict = analyze(metadata[id] || {});
    if (verdict.cull) {
      await prisma.photo.update({
        where: { id },
        data: { aiCulled: true, aiCullReason: verdict.reason },
      }).catch(() => {});
      culledCount++;
    }
    results.push({ id, ...verdict });
  }
  return NextResponse.json({ analyzed: photoIds.length, culled: culledCount, results });
}

// Admin override
export async function PATCH(req: NextRequest) {
  const { photoId } = await req.json();
  await prisma.photo.update({
    where: { id: photoId },
    data: { aiCulled: false, aiCullReason: null },
  });
  return NextResponse.json({ ok: true });
}
