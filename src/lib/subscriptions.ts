export type Tier = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE";

export const SUBSCRIPTION_TIERS: Record<Tier, {
  name: string;
  priceMonthly: number; // cents
  photosPerMonth: number; // -1 = unlimited
  activeGalleries: number; // -1 = unlimited
  features: string[];
}> = {
  STARTER: {
    name: "Starter",
    priceMonthly: 999,
    photosPerMonth: 100,
    activeGalleries: 1,
    features: ["Basic templates", "Magic link sharing"],
  },
  PROFESSIONAL: {
    name: "Professional",
    priceMonthly: 2999,
    photosPerMonth: 1000,
    activeGalleries: 10,
    features: ["Custom branding", "Logo upload", "Color scheme"],
  },
  BUSINESS: {
    name: "Business",
    priceMonthly: 7999,
    photosPerMonth: 5000,
    activeGalleries: -1,
    features: ["Unlimited galleries", "Priority support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 19999,
    photosPerMonth: -1,
    activeGalleries: -1,
    features: ["White-label", "API access", "Dedicated support"],
  },
};

export const SAAS_COMMISSION_RATE = 0.02; // 2% on every sale

export function checkUploadLimit(tier: Tier, currentMonthCount: number, addingCount: number) {
  const t = SUBSCRIPTION_TIERS[tier];
  if (t.photosPerMonth === -1) return { allowed: true };
  const allowed = currentMonthCount + addingCount <= t.photosPerMonth;
  return { allowed, limit: t.photosPerMonth, current: currentMonthCount };
}

export function checkGalleryLimit(tier: Tier, activeCount: number) {
  const t = SUBSCRIPTION_TIERS[tier];
  if (t.activeGalleries === -1) return { allowed: true };
  return { allowed: activeCount < t.activeGalleries, limit: t.activeGalleries, current: activeCount };
}
