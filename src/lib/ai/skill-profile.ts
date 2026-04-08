import { prisma } from '@/lib/db';

export async function calculateSkillProfile(userId: string) {
  const since = new Date(Date.now() - 30 * 86400000);
  const analyses = await prisma.photoAnalysis.findMany({
    where: { photographerId: userId, createdAt: { gte: since } },
  });
  if (analyses.length === 0) {
    return prisma.photographerSkillProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  const avg = (xs: number[]) =>
    Math.round(xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length));

  const byBucket = (bucket: string) => analyses.filter((a) => a.subjectType === bucket);
  const bucketScore = (bucket: string) => {
    const xs = byBucket(bucket);
    if (xs.length === 0) return 30; // never used → low
    const variety = Math.min(100, xs.length * 8); // more uses = more variety
    const quality = avg(xs.map((a) => a.overallScore));
    return Math.round(variety * 0.4 + quality * 0.6);
  };

  const individualPoses = bucketScore('individual');
  const couplePoses = bucketScore('couple');
  const familyPoses = bucketScore('family');
  const kidsPoses = bucketScore('kids');
  const actionPoses = bucketScore('action');
  const portraitPoses = bucketScore('portrait');

  const avgSharpness = avg(analyses.map((a) => a.sharpnessScore));
  const avgExposure = avg(analyses.map((a) => a.exposureScore));
  const avgComposition = avg(analyses.map((a) => a.compositionScore));
  const avgLighting = avg(analyses.map((a) => a.lightingScore));
  const avgFraming = avg(analyses.map((a) => a.framingScore));

  const avgHookRate = avg(analyses.map((a) => a.hookPotential));
  const avgSalesConversion = avg(analyses.map((a) => a.salesTotal));
  const avgEmotionCapture = avg(analyses.map((a) => a.emotionScore));

  const poseScores: Record<string, number> = {
    individual: individualPoses,
    couple: couplePoses,
    family: familyPoses,
    kids: kidsPoses,
    action: actionPoses,
    portrait: portraitPoses,
  };
  const technicalScores: Record<string, number> = {
    sharpness: avgSharpness,
    exposure: avgExposure,
    composition: avgComposition,
    lighting: avgLighting,
    framing: avgFraming,
  };
  const weakestPoseCategory = Object.entries(poseScores).sort((a, b) => a[1] - b[1])[0][0];
  const strongestArea = Object.entries(poseScores).sort((a, b) => b[1] - a[1])[0][0];
  const weakestTechnical = Object.entries(technicalScores).sort((a, b) => a[1] - b[1])[0][0];

  return prisma.photographerSkillProfile.upsert({
    where: { userId },
    create: {
      userId,
      individualPoses,
      couplePoses,
      familyPoses,
      kidsPoses,
      actionPoses,
      portraitPoses,
      avgSharpness,
      avgExposure,
      avgComposition,
      avgLighting,
      avgFraming,
      avgHookRate,
      avgSalesConversion,
      avgEmotionCapture,
      weakestPoseCategory,
      weakestTechnical,
      strongestArea,
    },
    update: {
      individualPoses,
      couplePoses,
      familyPoses,
      kidsPoses,
      actionPoses,
      portraitPoses,
      avgSharpness,
      avgExposure,
      avgComposition,
      avgLighting,
      avgFraming,
      avgHookRate,
      avgSalesConversion,
      avgEmotionCapture,
      weakestPoseCategory,
      weakestTechnical,
      strongestArea,
    },
  });
}
