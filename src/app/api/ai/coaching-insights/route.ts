import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = await prisma.photographerSkillProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const heatmap = profiles.map((p) => ({
      userId: p.userId,
      name: p.user.name,
      individual: p.individualPoses,
      couple: p.couplePoses,
      family: p.familyPoses,
      kids: p.kidsPoses,
      action: p.actionPoses,
      portrait: p.portraitPoses,
      avgOverall: Math.round(
        (p.individualPoses +
          p.couplePoses +
          p.familyPoses +
          p.kidsPoses +
          p.actionPoses +
          p.portraitPoses) /
          6,
      ),
    }));

    const alerts = heatmap
      .filter((h) => h.avgOverall < 50)
      .map((h) => ({
        userId: h.userId,
        name: h.name,
        avgOverall: h.avgOverall,
        message: `${h.name} is averaging ${h.avgOverall}/100 overall — needs coaching.`,
      }));

    const since = new Date(Date.now() - 30 * 86400000);
    const completed = await prisma.trainingAssignment.findMany({
      where: { status: 'completed', completedAt: { gte: since } },
      include: { user: { select: { name: true } }, module: { select: { title: true } } },
      take: 50,
    });
    const trainingROI = completed.map((t) => ({
      userName: t.user.name,
      moduleTitle: t.module?.title,
      skillBefore: t.skillBefore,
      skillAfter: t.skillAfter,
      gain: (t.skillAfter ?? 0) - (t.skillBefore ?? 0),
    }));

    return NextResponse.json({ heatmap, alerts, trainingROI });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
