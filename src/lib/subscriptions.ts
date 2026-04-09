export type Tier = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE";

export const SUBSCRIPTION_TIERS: Record<Tier, {
  name: string;
  priceMonthly: number; // cents
  photosPerMonth: number; // -1 = unlimited
  activeGalleries: number; // -1 = unlimited
  locations: number; // max locations, -1 = unlimited
  features: string[];
  popular?: boolean;
  cta: string;
}> = {
  STARTER: {
    name: "Free",
    priceMonthly: 0,
    photosPerMonth: 100,
    activeGalleries: 1,
    locations: 1,
    features: ["1 location", "100 photos/month", "Magic link sharing", "Basic watermarking"],
    cta: "Get Started Free",
  },
  PROFESSIONAL: {
    name: "Pro",
    priceMonthly: 4900,
    photosPerMonth: -1,
    activeGalleries: -1,
    locations: 5,
    features: ["5 locations", "Unlimited photos", "Custom branding", "Stripe payments", "WhatsApp delivery", "Analytics dashboard"],
    popular: true,
    cta: "Start Pro Trial",
  },
  BUSINESS: {
    name: "Business",
    priceMonthly: 14900,
    photosPerMonth: -1,
    activeGalleries: -1,
    locations: -1,
    features: ["Unlimited locations", "Unlimited photos", "Kiosk POS system", "AI culling & reels", "Digital passes", "Priority support"],
    cta: "Go Business",
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 0, // custom pricing
    photosPerMonth: -1,
    activeGalleries: -1,
    locations: -1,
    features: ["White-label branding", "Franchise system", "Custom API access", "Dedicated account manager", "SLA guarantee", "Custom integrations"],
    cta: "Contact Sales",
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
