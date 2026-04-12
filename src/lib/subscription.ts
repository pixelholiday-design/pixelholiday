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
      "6 gallery themes (classic, masonry, filmstrip, magazine, minimal, dark)",
      "Per-photo purchasing + digital pass tiers",
      "Photo book designer (13 layouts, 11 shapes)",
      "Auto language detection (10 languages + RTL)",
      "Portfolio website (fotiqo.com/p/you)",
      "3 booking packages",
      "Marketplace listing",
      "Basic client CRM",
      "Help center (100+ articles)",
      "PayPal + Stripe checkout",
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
    monthlyPrice: 19,
    annualPrice: 15,
    badge: "Best value",
    description: "Everything you need to grow",
    features: [
      "Everything in Starter, plus:",
      "Unlimited galleries",
      "Custom domain (yourname.com)",
      "Remove Fotiqo branding",
      "Unlimited booking packages",
      "Contracts + e-signatures (5 templates)",
      "Invoices with Stripe payment links + PDF",
      "Full CRM with communications log",
      "AI Website Builder (3-step wizard)",
      "Kanban project board (6 columns)",
      "Album designer (7 layouts)",
      "Lightroom API integration",
      "Password protection + download limits",
      "Analytics + revenue reports",
      "Custom fonts upload",
      "Access to Premium AI Services (pay-per-use)",
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
    aiReels: true,
    faceRecognition: true,
    liveStreaming: false,
    teamMembers: 1,
    aiServicesModel: "pay-per-use" as const,
  },
  STUDIO: {
    name: "Studio",
    monthlyPrice: 30,
    annualPrice: 24,
    badge: "For teams",
    description: "Advanced features for professionals",
    features: [
      "Everything in Pro, plus:",
      "AI Command Center (daily briefing + marketing)",
      "500 AI tokens/month included (worth €65+)",
      "White-label (zero Fotiqo branding)",
      "Up to 5 team members",
      "Advanced analytics + competitor analysis",
      "Real-time live streaming",
      "500GB storage",
      "Phone + chat support",
      "Store with 0% commission",
    ],
    storeCommission: 0,
    maxGalleries: Infinity,
    maxPackages: Infinity,
    storageGb: 500,
    customDomain: true,
    removeBranding: true,
    contracts: true,
    aiReels: true,
    faceRecognition: true,
    liveStreaming: true,
    teamMembers: 5,
    aiServicesModel: "included" as const,
    aiTokensPerMonth: 500,
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
  if (monthlyRevenue >= 50000) return 0.02;  // 2% for large operations
  if (monthlyRevenue >= 30000) return 0.03;  // 3%
  if (monthlyRevenue >= 15000) return 0.05;  // 5%
  if (monthlyRevenue >= 5000) return 0.07;   // 7%
  return 0.10;                               // 10% for small operations
}

/** Get venue commission with possible negotiated override */
export function getEffectiveVenueRate(monthlyRevenue: number, negotiatedRate?: number | null): number {
  if (negotiatedRate != null && negotiatedRate > 0) return negotiatedRate;
  return getVenueCommissionRate(monthlyRevenue);
}
