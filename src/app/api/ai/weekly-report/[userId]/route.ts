import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWeeklyReport } from '@/lib/ai/weekly-report';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    let latest = await prisma.weeklySkillReport.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const stale =
      !latest || Date.now() - new Date(latest.createdAt).getTime() > 7 * 86400000;
    if (stale) {
      latest = await generateWeeklyReport(userId);
    }
    return NextResponse.json({ report: latest });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
