import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzePhoto } from '@/lib/ai/photo-analyzer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { photoIds } = await req.json();
    if (!Array.isArray(photoIds) || photoIds.length === 0)
      return NextResponse.json({ error: 'photoIds required' }, { status: 400 });

    const photos = await prisma.photo.findMany({
      where: { id: { in: photoIds } },
      include: { gallery: true },
    });

    const analyses = [];
    for (const p of photos) {
      const existing = await prisma.photoAnalysis.findUnique({ where: { photoId: p.id } });
      if (existing) {
        analyses.push(existing);
      } else {
        const a = await analyzePhoto({
          photoId: p.id,
          photographerId: p.gallery.photographerId,
        });
        if (a) analyses.push(a);
      }
    }

    const distinctSubjects = new Set(analyses.map((a) => a.subjectType).filter(Boolean));
    const varietyCount = distinctSubjects.size;
    const varietyState = varietyCount >= 4 ? 'good' : varietyCount >= 2 ? 'ok' : 'low';

    // Collect tips
    const allTips: Record<string, number> = {};
    for (const a of analyses) {
      if (!a.improvements) continue;
      for (const tip of a.improvements.split('.').map((t) => t.trim()).filter(Boolean)) {
        allTips[tip] = (allTips[tip] || 0) + 1;
      }
    }
    const tips = Object.entries(allTips)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t + '.');

    const sortedByHook = [...analyses].sort((a, b) => b.hookPotential - a.hookPotential);
    const recommendedHookPhotoId = sortedByHook[0]?.photoId ?? null;

    return NextResponse.json({
      varietyCount,
      varietyState,
      tips,
      recommendedHookPhotoId,
      analyzed: analyses.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
