/**
 * Subscription plan definitions and commission logic for Fotiqo.
 *
 * Two business lines:
 * 1. Fotiqo Studio (SaaS) — subscription + store margin commission
 * 2. Fotiqo for Venues — commission only on photo sales (2-5%)
 */

export type Plan = "STARTER" | "PRO" | "STUDIO";

export const PLANS = {
  STARTER: {
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    badge: "Free forever",
    description: "Perfect for getting started",
    features: [
      "3 active galleries (unlimited photos each)",
      "Portfolio website (fotiqo.com/p/you)",
      "3 booking packages",
      "Marketplace listing",
      "Basic client CRM",
      "1GB storage",
      "Fotiqo branding on galleries",
      "Store with 10% margin commission",
    ],
    storeCommission: 0.10,
    maxGalleries: 3,
    maxPackages: 3,
    storageGb: 1,
    customDomain: false,
    removeBranding: false,
    contracts: false,
    aiReels: false,
    faceRecognition: false,
    liveStreaming: false,
    teamMembers: 1,
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 10,
    annualPrice: 8,
    badge: "Best value",
    description: "Everything you need to grow",
    features: [
      "Everything in Starter, plus:",
      "Unlimited galleries",
      "Custom domain (yourname.com)",
      "Remove Fotiqo branding",
      "Unlimited booking packages",
      "Contracts + e-signatures (5 templates)",
      "Invoices + full CRM",
      "Analytics + revenue reports",
      "Custom fonts upload",
      "API keys (Lightroom integration)",
      "CSV bulk gallery creation",
      "50GB storage",
      "Priority email support",
      "Store with 5% margin commission",
    ],
    storeCommission: 0.05,
    maxGalleries: Infinity,
    maxPackages: Infinity,
    storageGb: 50,
    customDomain: true,
    removeBranding: true,
    contracts: true,
    aiReels: false,
    faceRecognition: false,
    liveStreaming: false,
    teamMembers: 1,
  },
  STUDIO: {
    name: "Studio",
    monthlyPrice: 24,
    annualPrice: 19,
    badge: "For teams",
    description: "Advanced features for professionals",
    features: [
      "Everything in Pro, plus:",
      "AI video reels (unlimited)",
      "Face recognition selfie search",
      "Real-time live streaming",
      "White-label (zero Fotiqo branding)",
      "Up to 5 team members",
      "Advanced analytics + reports",
      "200GB storage",
      "Phone + chat support",
      "Store with 0% commission",
    ],
    storeCommission: 0,
    maxGalleries: Infinity,
    maxPackages: Infinity,
    storageGb: 200,
    customDomain: true,
    removeBranding: true,
    contracts: true,
    aiReels: true,
    faceRecognition: true,
    liveStreaming: true,
    teamMembers: 5,
  },
} as const;

/** Store commission is on MARGIN, not full price */
export function calculateStoreCommission(
  salePrice: number,
  labCost: number,
  plan: Plan,
): number {
  const margin = Math.max(0, salePrice - labCost);
  const rate = PLANS[plan]?.storeCommission ?? 0.10;
  return Math.round(margin * rate * 100) / 100;
}

/** Venue commission on photo sales (tiered by monthly revenue) */
export function getVenueCommissionRate(monthlyRevenue: number): number {
  if (monthlyRevenue >= 50000) return 0.02;
  if (monthlyRevenue >= 15000) return 0.03;
  if (monthlyRevenue >= 5000) return 0.04;
  return 0.05;
}
