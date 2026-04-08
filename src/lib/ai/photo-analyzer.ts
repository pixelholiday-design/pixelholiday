import { prisma } from '@/lib/db';

// Deterministic hash → 0..100, so the same photo always scores the same.
function h(seed: string, salt: string): number {
  let x = 0;
  const s = seed + ':' + salt;
  for (let i = 0; i < s.length; i++) x = ((x << 5) - x + s.charCodeAt(i)) | 0;
  return Math.abs(x) % 101;
}

const POSE_BUCKETS: Record<string, string[]> = {
  individual: ['Classic Standing', 'Walking Toward Camera', 'Leaning Casual', 'Sitting Relaxed', 'Action Splash', 'Silhouette Sunset', 'Looking Away', 'Hands in Hair', 'Laughing Candid', 'Under Water'],
  couple:     ['Walking Hand in Hand', 'Forehead Touch', 'Piggyback', 'Dip Kiss', 'Sunset Silhouette Couple', 'Back Hug', 'Sitting Together', 'Splash Fight', 'Champagne Toast', 'Dancing'],
  family:     ['Classic Family Lineup', 'Parents Lifting Child', 'Walking Together', 'Piggyback Parade', 'Pyramid', 'Running Toward Camera', 'Family Splash', 'Sand Castle', 'Group Hug', 'Silly Faces'],
  kids:       ['Jumping', 'Running in Water', 'Ice Cream', 'With Floatie', 'Sandbox Play', 'Peek-a-Boo', 'Super Hero', 'On Shoulders'],
  action:     ['Water Slide Exit', 'Cannonball', 'Diving', 'Wave Jump', 'Ball Catch', 'Surfing/Boogie Board', 'Zip Line', 'Roller Coaster'],
  portrait:   ['Headshot with Hat', 'Sunglasses Reflection', 'Wet Hair', 'Profile with Horizon'],
};

export type AnalysisInput = { photoId: string; photographerId: string };

export async function analyzePhoto({ photoId, photographerId }: AnalysisInput) {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { gallery: { include: { customer: true } } },
  });
  if (!photo) return null;

  // TODO: Real impl — use Cloudinary face detection / AI tagging.
  const subjectBuckets = ['individual', 'couple', 'family', 'kids', 'action', 'portrait'] as const;
  const bucketIndex = h(photoId, 'subject') % subjectBuckets.length;
  const subjectType = subjectBuckets[bucketIndex];
  const subjectCount =
    subjectType === 'individual' || subjectType === 'portrait'
      ? 1
      : subjectType === 'couple'
        ? 2
        : subjectType === 'family'
          ? 3 + (h(photoId, 'fc') % 3)
          : 1 + (h(photoId, 'fc2') % 4);
  const facesDetected = subjectCount;
  const smilesDetected = Math.max(0, subjectCount - (h(photoId, 'sm') % 2));
  const eyesOpen = h(photoId, 'eyes') > 10;

  const poses = POSE_BUCKETS[subjectType];
  const detectedPoseCategory = poses[h(photoId, 'pose') % poses.length];
  const poseConfidence = 0.6 + h(photoId, 'pc') / 250;

  const sharpnessScore = 40 + (h(photoId, 'sh') % 50);
  const exposureScore = 40 + (h(photoId, 'ex') % 50);
  const compositionScore = 40 + (h(photoId, 'co') % 50);
  const lightingScore = 40 + (h(photoId, 'li') % 50);
  const framingScore = 40 + (h(photoId, 'fr') % 50);

  const emotionScore = 30 + (h(photoId, 'em') % 65);
  const actionScore =
    subjectType === 'action' ? 70 + (h(photoId, 'ac') % 30) : 30 + (h(photoId, 'ac') % 50);
  const hookPotential = Math.round(emotionScore * 0.5 + actionScore * 0.3 + (h(photoId, 'hk') % 20));
  const wowFactor = Math.round(hookPotential * 0.6 + emotionScore * 0.3 + (h(photoId, 'wf') % 15));

  const technicalTotal = Math.round(
    (sharpnessScore + exposureScore + compositionScore + lightingScore + framingScore) / 5,
  );
  const salesTotal = Math.round((emotionScore + actionScore + hookPotential + wowFactor) / 4);
  const overallScore = Math.round(technicalTotal * 0.4 + salesTotal * 0.6);

  const tips: string[] = [];
  if (sharpnessScore < 60)
    tips.push('Focus technique needs work — pre-focus on the spot where subjects will be.');
  if (compositionScore < 50)
    tips.push('Subject is centered — practice rule-of-thirds placement.');
  if (lightingScore < 55)
    tips.push('Lighting is harsh — try shooting in golden hour or seek shaded reflections.');
  if (hookPotential < 40)
    tips.push("This won't grab attention — for hooks, try action or strong emotional moments.");
  const improvements = tips.join(' ') || null;
  const poseSuggestion =
    subjectType === 'couple'
      ? 'Try Forehead Touch (#12) for more intimacy.'
      : subjectType === 'family'
        ? 'Try Parents Lifting Child (#22) for energy.'
        : subjectType === 'kids'
          ? 'Try Super Hero pose (#37) for kids — they love it.'
          : null;

  // Variety check: did this photographer use this pose in last 24h?
  const recent = await prisma.photoAnalysis.findFirst({
    where: {
      photographerId,
      detectedPoseCategory,
      createdAt: { gte: new Date(Date.now() - 86400000) },
    },
  });
  const poseVariety = !recent;

  return prisma.photoAnalysis.upsert({
    where: { photoId },
    create: {
      photoId,
      photographerId,
      detectedPoseCategory,
      poseConfidence,
      poseVariety,
      subjectCount,
      subjectType,
      facesDetected,
      smilesDetected,
      eyesOpen,
      sharpnessScore,
      exposureScore,
      compositionScore,
      lightingScore,
      framingScore,
      emotionScore,
      actionScore,
      hookPotential,
      wowFactor,
      technicalTotal,
      salesTotal,
      overallScore,
      improvements,
      poseSuggestion,
    },
    update: { overallScore, technicalTotal, salesTotal },
  });
}

export async function analyzeGalleryPhotos(galleryId: string) {
  const g = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: { photos: true },
  });
  if (!g) return [];
  const out = [];
  for (const p of g.photos) {
    out.push(await analyzePhoto({ photoId: p.id, photographerId: g.photographerId }));
  }
  return out.filter(Boolean);
}
