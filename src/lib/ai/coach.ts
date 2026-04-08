import { prisma } from "@/lib/db";

/**
 * Real-time sales coach. Given the current state of a kiosk session — which
 * customer, how many photos selected, how long they've been viewing, etc. —
 * returns the most relevant coaching tips for the photographer.
 *
 * Tips live in the SalesCoachTip table so non-technical staff can edit them
 * without redeploying. condition is a tiny JSON DSL evaluated by `matches()`.
 */

export type CoachContext = {
  customerId?: string;
  galleryId?: string;
  selectedPhotos?: number;
  totalPhotos?: number;
  favoriteCount?: number;
  viewingMinutes?: number;
  hasReturnedBefore?: boolean;
  groupSize?: number;
  hourOfDay?: number;
};

function matches(condition: Record<string, any>, ctx: CoachContext): boolean {
  for (const [k, expected] of Object.entries(condition)) {
    const actual = (ctx as any)[k];
    if (typeof expected === "object" && expected !== null) {
      if ("min" in expected && (actual ?? 0) < expected.min) return false;
      if ("max" in expected && (actual ?? Infinity) > expected.max) return false;
      if ("eq" in expected && actual !== expected.eq) return false;
    } else if (actual !== expected) {
      return false;
    }
  }
  return true;
}

export async function getCoachTips(ctx: CoachContext) {
  const tips = await prisma.salesCoachTip.findMany({ where: { isActive: true } });
  const matched = [];
  for (const t of tips) {
    let cond: Record<string, any> = {};
    try {
      cond = JSON.parse(t.condition || "{}");
    } catch {}
    if (matches(cond, ctx)) {
      matched.push({
        id: t.id,
        trigger: t.trigger,
        message: t.message,
        script: t.script,
        tactic: t.tactic,
      });
    }
  }
  return matched.slice(0, 3); // top 3 most relevant
}

export const DEFAULT_COACH_TIPS = [
  {
    trigger: "customer_viewing",
    condition: JSON.stringify({ favoriteCount: { min: 5 } }),
    message: "They love 5+ photos! Suggest the 10-pack — only €10 more for double the photos.",
    script: "I see you've favourited a few — for just €10 more you can take all 10 home.",
    tactic: "bundle",
  },
  {
    trigger: "customer_selecting",
    condition: JSON.stringify({ selectedPhotos: { eq: 3 } }),
    message: "Customer picked exactly 3. Push the 10-pack: 'For €15 more you get 7 extra photos!'",
    script: "Did you know — for just €15 more you get the full ten-pack instead of three?",
    tactic: "bundle",
  },
  {
    trigger: "customer_viewing",
    condition: JSON.stringify({ viewingMinutes: { min: 3 }, selectedPhotos: { max: 0 } }),
    message: "They've been viewing for 3+ minutes with no selection — try a soft close.",
    script: "These photos expire in 5 days. Want me to walk you through the best ones?",
    tactic: "urgency",
  },
  {
    trigger: "checkout_start",
    condition: JSON.stringify({ groupSize: { min: 4 } }),
    message: "Group of 4+. Groups always spend more — push everyone-gets-a-copy.",
    script: "Everyone in the family gets their own copy for just €20 extra.",
    tactic: "value",
  },
  {
    trigger: "customer_arrival",
    condition: JSON.stringify({ hasReturnedBefore: true }),
    message: "Returning customer! Offer 10% loyalty discount.",
    script: "Welcome back! As a returning guest you get 10% off everything today.",
    tactic: "value",
  },
  {
    trigger: "customer_arrival",
    condition: JSON.stringify({ hourOfDay: { min: 17, max: 19 } }),
    message: "Golden hour photos are premium. Price 20% higher.",
    script: "These sunset shots are our most-loved package — they're worth every cent.",
    tactic: "value",
  },
];

export async function ensureDefaultCoachTips() {
  const count = await prisma.salesCoachTip.count();
  if (count > 0) return;
  for (const t of DEFAULT_COACH_TIPS) {
    await prisma.salesCoachTip.create({ data: t });
  }
}
