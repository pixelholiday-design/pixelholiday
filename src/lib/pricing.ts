import { prisma } from "@/lib/db";

export const DEFAULT_PRICES: { key: string; name: string; price: number }[] = [
  { key: "single_photo", name: "Single Photo (digital)", price: 5 },
  { key: "ten_pack", name: "10-Photo Package", price: 39 },
  { key: "three_photos", name: "3-Photo Package", price: 15 },
  { key: "full_gallery", name: "Full Gallery (digital)", price: 49 },
  { key: "full_gallery_premium", name: "Full Gallery (premium)", price: 99 },
  { key: "print_4x6", name: "Printed 4x6", price: 3 },
  { key: "print_5x7", name: "Printed 5x7", price: 5 },
  { key: "print_8x10", name: "Printed 8x10", price: 10 },
  { key: "print_a4", name: "Printed A4", price: 15 },
  { key: "canvas_30x40", name: "Canvas 30x40", price: 55 },
  { key: "pass_basic", name: "Digital Pass Basic", price: 50 },
  { key: "pass_unlimited", name: "Digital Pass Unlimited", price: 100 },
  { key: "pass_vip", name: "Digital Pass VIP", price: 150 },
  { key: "magic_shot", name: "Magic Shot add-on", price: 5 },
  { key: "video_reel", name: "Video Reel add-on", price: 10 },
  { key: "waterproof_usb", name: "Waterproof USB", price: 59 },
];

export async function ensureDefaultPricing() {
  for (const p of DEFAULT_PRICES) {
    const existing = await prisma.pricingConfig.findFirst({
      where: { productKey: p.key, locationId: null },
    });
    if (!existing) {
      await prisma.pricingConfig.create({
        data: { productKey: p.key, name: p.name, price: p.price, locationId: null },
      });
    }
  }
}

/**
 * Get the price for a productKey.
 * Resolution order:
 *   1. Location-specific override (locationId set)
 *   2. Global default (locationId = null)
 *   3. Hardcoded DEFAULT_PRICES fallback
 */
export async function getPrice(productKey: string, locationId?: string | null): Promise<number> {
  if (locationId) {
    const loc = await prisma.pricingConfig.findFirst({
      where: { productKey, locationId },
    });
    if (loc) return loc.price;
  }
  const global = await prisma.pricingConfig.findFirst({
    where: { productKey, locationId: null },
  });
  if (global) return global.price;
  const def = DEFAULT_PRICES.find((d) => d.key === productKey);
  return def?.price ?? 0;
}

/**
 * Get all prices. When locationId is provided, merges location overrides
 * over global defaults. Otherwise returns just the globals.
 */
export async function getAllPrices(locationId?: string | null) {
  await ensureDefaultPricing();
  const globals = await prisma.pricingConfig.findMany({
    where: { locationId: null },
    orderBy: { productKey: "asc" },
  });
  if (!locationId) return globals;

  const overrides = await prisma.pricingConfig.findMany({
    where: { locationId },
    orderBy: { productKey: "asc" },
  });
  const overrideMap = new Map(overrides.map((o) => [o.productKey, o]));
  return globals.map((g) => overrideMap.get(g.productKey) ?? g);
}
