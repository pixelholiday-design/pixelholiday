import { prisma } from "@/lib/db";

/**
 * Plan feature definitions — matches /src/lib/subscription.ts PLANS object.
 * Each plan maps to which features are enabled.
 */
const PLAN_FEATURES: Record<string, Record<string, boolean>> = {
  STARTER: {
    galleries: true,
    store: true,
    marketplace: true,
    contracts: false,
    invoicing: false,
    aiReels: false,
    faceRecognition: false,
    customDomain: false,
    teamMembers: false,
    removeBranding: false,
    liveStreaming: false,
    miniSessions: false,
    albumDesigner: false,
    projectBoard: false,
  },
  PRO: {
    galleries: true,
    store: true,
    marketplace: true,
    contracts: true,
    invoicing: true,
    aiReels: false,
    faceRecognition: false,
    customDomain: true,
    teamMembers: false,
    removeBranding: true,
    liveStreaming: false,
    miniSessions: true,
    albumDesigner: false,
    projectBoard: true,
  },
  STUDIO: {
    galleries: true,
    store: true,
    marketplace: true,
    contracts: true,
    invoicing: true,
    aiReels: true,
    faceRecognition: true,
    customDomain: true,
    teamMembers: true,
    removeBranding: true,
    liveStreaming: true,
    miniSessions: true,
    albumDesigner: true,
    projectBoard: true,
  },
};

const PLAN_LIMITS: Record<string, { maxGalleries: number; storageGb: number }> = {
  STARTER: { maxGalleries: 3, storageGb: 1 },
  PRO: { maxGalleries: Infinity, storageGb: 50 },
  STUDIO: { maxGalleries: Infinity, storageGb: 200 },
};

/**
 * Check if a feature is available for the given org's plan.
 */
export async function checkPlanFeature(orgId: string, feature: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, trialEndsAt: true, trialExpired: true },
  });
  if (!org) return false;

  // During active trial, grant STUDIO-level access
  const isTrialActive = org.trialEndsAt && !org.trialExpired && new Date(org.trialEndsAt) > new Date();
  const effectivePlan = isTrialActive ? "STUDIO" : (org.plan || "STARTER");

  return PLAN_FEATURES[effectivePlan]?.[feature] ?? false;
}

/**
 * Throw an error if feature is not available. Use in API routes.
 */
export async function requirePlan(orgId: string, feature: string): Promise<void> {
  const allowed = await checkPlanFeature(orgId, feature);
  if (!allowed) {
    throw new PlanError(`Feature "${feature}" requires a higher plan. Please upgrade.`);
  }
}

export class PlanError extends Error {
  status = 403;
  constructor(message: string) {
    super(message);
    this.name = "PlanError";
  }
}

/**
 * Get plan limits for the given org.
 */
export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.STARTER;
}

/**
 * Get current plan features for display in UI.
 */
export function getPlanFeatures(plan: string) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.STARTER;
}
