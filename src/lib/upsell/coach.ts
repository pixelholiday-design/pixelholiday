import { prisma } from "@/lib/db";

export interface UpsellContext {
  cartItemCount: number;
  cartTotal: number;
  locationType?: string;
  hasKids?: boolean;
  has3Generations?: boolean;
  hesitating?: boolean;
}

export async function pickScript(ctx: UpsellContext) {
  const scripts = await prisma.upsellScript.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  const matches = scripts.filter((s) => {
    if (s.locationType && ctx.locationType && s.locationType !== ctx.locationType) return false;
    switch (s.trigger) {
      case "small_cart":
        return ctx.cartItemCount > 0 && ctx.cartItemCount <= 3;
      case "ai_pivot":
        return ctx.cartTotal > 0 && ctx.cartTotal < 50;
      case "legacy_close":
        return !!ctx.has3Generations;
      case "splash_bundle":
        return ctx.locationType === "SPLASH";
      case "fear_of_loss":
        return !!ctx.hesitating;
      case "kids_hook":
        return !!ctx.hasKids;
      default:
        return true;
    }
  });

  return matches[0] ?? scripts[0] ?? null;
}
