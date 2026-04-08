import { prisma } from '@/lib/db';

export async function generateWeeklyReport(userId: string) {
  const now = new Date();
  const weekEnd = new Date(now);
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  const prevStart = new Date(weekStart.getTime() - 7 * 86400000);

  const thisWeek = await prisma.photoAnalysis.findMany({
    where: { photographerId: userId, createdAt: { gte: weekStart, lte: weekEnd } },
  });
  const prevWeek = await prisma.photoAnalysis.findMany({
    where: { photographerId: userId, createdAt: { gte: prevStart, lt: weekStart } },
  });

  const avg = (xs: number[]) =>
    xs.length === 0 ? 50 : Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

  const avgOverallScore = avg(thisWeek.map((a) => a.overallScore));
  const prevAvg = avg(prevWeek.map((a) => a.overallScore));
  const scoreChange = avgOverallScore - prevAvg;

  const technicalAverages: Record<string, number> = {
    Sharpness: avg(thisWeek.map((a) => a.sharpnessScore)),
    Exposure: avg(thisWeek.map((a) => a.exposureScore)),
    Composition: avg(thisWeek.map((a) => a.compositionScore)),
    Lighting: avg(thisWeek.map((a) => a.lightingScore)),
    Framing: avg(thisWeek.map((a) => a.framingScore)),
    Emotion: avg(thisWeek.map((a) => a.emotionScore)),
  };
  const sorted = Object.entries(technicalAverages).sort((a, b) => b[1] - a[1]);
  const strengths = sorted.slice(0, 3).map(([k, v]) => `${k}: ${v}/100`);
  const improvements = sorted
    .slice(-3)
    .reverse()
    .map(([k, v]) => `${k}: ${v}/100`);

  const recommendations: string[] = [];
  if (scoreChange < 0) recommendations.push('Scores trending down — review recent uploads.');
  if (technicalAverages.Lighting < 55) recommendations.push('Shoot during golden hour for better lighting.');
  if (technicalAverages.Composition < 55)
    recommendations.push('Practice rule-of-thirds framing.');
  if (technicalAverages.Emotion < 55)
    recommendations.push('Capture candid moments for more emotional impact.');

  // Team rank
  const allProfiles = await prisma.photographerSkillProfile.findMany();
  const ranked = allProfiles
    .map((p) => ({
      userId: p.userId,
      avg: Math.round(
        (p.individualPoses +
          p.couplePoses +
          p.familyPoses +
          p.kidsPoses +
          p.actionPoses +
          p.portraitPoses) /
          6,
      ),
    }))
    .sort((a, b) => b.avg - a.avg);
  const teamRank = ranked.findIndex((r) => r.userId === userId) + 1 || null;
  const teamAvg = avg(ranked.map((r) => r.avg));

  const report = await prisma.weeklySkillReport.create({
    data: {
      userId,
      weekStart,
      weekEnd,
      photosAnalyzed: thisWeek.length,
      avgOverallScore,
      scoreChange,
      strengths: JSON.stringify(strengths),
      improvements: JSON.stringify(improvements),
      recommendations: JSON.stringify(recommendations),
      teamRank,
      aboveAverage: avgOverallScore > teamAvg ? 'yes' : 'no',
      belowAverage: avgOverallScore < teamAvg ? 'yes' : 'no',
    },
  });

  return report;
}
