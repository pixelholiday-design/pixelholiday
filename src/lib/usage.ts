import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-guard";

/**
 * Check if the org can create a new gallery.
 */
export async function canCreateGallery(orgId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, trialEndsAt: true, trialExpired: true },
  });
  if (!org) return { allowed: false, current: 0, max: 0 };

  const isTrialActive = org.trialEndsAt && !org.trialExpired && new Date(org.trialEndsAt) > new Date();
  const effectivePlan = isTrialActive ? "STUDIO" : (org.plan || "STARTER");
  const limits = getPlanLimits(effectivePlan);

  if (limits.maxGalleries === Infinity) return { allowed: true, current: 0, max: Infinity };

  const current = await prisma.gallery.count({
    where: {
      photographer: { orgId },
      status: { not: "EXPIRED" },
    },
  });

  return {
    allowed: current < limits.maxGalleries,
    current,
    max: limits.maxGalleries,
  };
}

/**
 * Check if the org can upload a photo (storage limit check).
 */
export async function canUploadPhoto(orgId: string, fileSizeMb: number = 5): Promise<{
  allowed: boolean;
  usedGb: number;
  maxGb: number;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, trialEndsAt: true, trialExpired: true },
  });
  if (!org) return { allowed: false, usedGb: 0, maxGb: 0 };

  const isTrialActive = org.trialEndsAt && !org.trialExpired && new Date(org.trialEndsAt) > new Date();
  const effectivePlan = isTrialActive ? "STUDIO" : (org.plan || "STARTER");
  const limits = getPlanLimits(effectivePlan);

  // Count photos as approximate storage (assume ~5MB per photo)
  const photoCount = await prisma.photo.count({
    where: { gallery: { photographer: { orgId } } },
  });
  const usedGb = (photoCount * 5) / 1024; // Rough estimate

  return {
    allowed: usedGb + (fileSizeMb / 1024) <= limits.storageGb,
    usedGb: Math.round(usedGb * 100) / 100,
    maxGb: limits.storageGb,
  };
}

/**
 * Get full usage stats for the org.
 */
export async function getUsageStats(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, trialEndsAt: true, trialExpired: true },
  });
  if (!org) return null;

  const isTrialActive = org.trialEndsAt && !org.trialExpired && new Date(org.trialEndsAt) > new Date();
  const effectivePlan = isTrialActive ? "STUDIO" : (org.plan || "STARTER");
  const limits = getPlanLimits(effectivePlan);

  const galleryCount = await prisma.gallery.count({
    where: { photographer: { orgId }, status: { not: "EXPIRED" } },
  });

  const photoCount = await prisma.photo.count({
    where: { gallery: { photographer: { orgId } } },
  });

  return {
    plan: effectivePlan,
    isTrialActive,
    trialEndsAt: org.trialEndsAt,
    galleries: { current: galleryCount, max: limits.maxGalleries },
    storage: { usedGb: Math.round((photoCount * 5) / 1024 * 100) / 100, maxGb: limits.storageGb },
    photos: photoCount,
  };
}
