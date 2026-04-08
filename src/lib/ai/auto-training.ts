import { prisma } from '@/lib/db';

export async function autoAssignTraining(userId: string) {
  const profile = await prisma.photographerSkillProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const assignments: { reason: string; priority: string; moduleSlug: string }[] = [];
  const moduleByCategory: Record<string, string> = {
    couple: 'Mastering Couple Poses',
    family: 'Family Group Photography',
    kids: 'Capturing Kids in Motion',
    action: 'Action & Dynamic Shots',
  };

  for (const [cat, mod] of Object.entries(moduleByCategory)) {
    const score = (profile as unknown as Record<string, number>)[cat + 'Poses'];
    if (typeof score === 'number' && score < 40) {
      assignments.push({
        reason: `AI: ${cat} pose variety ${score}/100`,
        priority: 'high',
        moduleSlug: mod,
      });
    }
  }

  if (profile.avgSharpness < 50)
    assignments.push({
      reason: `AI: sharpness avg ${profile.avgSharpness}/100`,
      priority: 'medium',
      moduleSlug: 'Technical Excellence: Focus & Sharpness',
    });
  if (profile.avgLighting < 50)
    assignments.push({
      reason: `AI: lighting avg ${profile.avgLighting}/100`,
      priority: 'medium',
      moduleSlug: 'Lighting for Resort Photography',
    });
  if (profile.avgComposition < 50)
    assignments.push({
      reason: `AI: composition avg ${profile.avgComposition}/100`,
      priority: 'medium',
      moduleSlug: 'Composition & Framing',
    });
  if (profile.avgHookRate < 40)
    assignments.push({
      reason: `AI: hook rate ${profile.avgHookRate}/100`,
      priority: 'high',
      moduleSlug: 'Creating Hook Photos That Sell',
    });

  const created = [];
  for (const a of assignments) {
    const mod = await prisma.academyModule.findFirst({ where: { title: a.moduleSlug } });
    if (!mod) continue;
    const existing = await prisma.trainingAssignment.findFirst({
      where: { userId, moduleId: mod.id, status: { in: ['assigned', 'in_progress'] } },
    });
    if (existing) continue;
    created.push(
      await prisma.trainingAssignment.create({
        data: {
          userId,
          moduleId: mod.id,
          reason: a.reason,
          priority: a.priority,
          assignedBy: 'AI_AUTO',
          status: 'assigned',
        },
      }),
    );
  }
  return created;
}
