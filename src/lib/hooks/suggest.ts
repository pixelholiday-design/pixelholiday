import { prisma } from "@/lib/db";

export interface HookContext {
  demographic?: string;
  location?: string;
  locationType?: string;
  timeOfDay?: string;
}

export async function suggestHook(ctx: HookContext) {
  const hooks = await prisma.approachHook.findMany({
    where: { isActive: true },
    orderBy: { successRate: "desc" },
  });
  const score = (h: any) => {
    let s = 0;
    if (h.demographic && ctx.demographic && h.demographic === ctx.demographic) s += 4;
    if (h.location && ctx.location && h.location === ctx.location) s += 3;
    if (h.locationType && ctx.locationType && h.locationType === ctx.locationType) s += 3;
    if (h.timeOfDay && ctx.timeOfDay && h.timeOfDay === ctx.timeOfDay) s += 1;
    return s;
  };
  const ranked = hooks
    .map((h) => ({ h, s: score(h) }))
    .sort((a, b) => b.s - a.s || b.h.successRate - a.h.successRate);
  return ranked[0]?.h ?? null;
}
