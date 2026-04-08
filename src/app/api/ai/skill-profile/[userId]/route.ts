import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateSkillProfile } from '@/lib/ai/skill-profile';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    let profile = await prisma.photographerSkillProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await calculateSkillProfile(userId);
    }
    const trainingAssignments = await prisma.trainingAssignment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { module: true },
    });
    return NextResponse.json({ profile, trainingAssignments });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
