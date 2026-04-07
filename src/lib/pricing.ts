import { prisma } from "@/lib/db";

export const DEFAULT_PRICES: { key: string; name: string; price: number }[] = [
  { key: "single_photo", name: "Single Photo (digital)", price: 5 },
  { key: "ten_pack", name: "10-Photo Package", price: 39 },
  { key: "full_gallery", name: "Full Gallery (digital)", price: 49 },
  { key: "full_gallery_premium", name: "Full Gallery (premium)", price: 99 },
  { key: "print_4x6", name: "Printed 4x6", price: 3 },
  { key: "print_5x7", name: "Printed 5x7", price: 5 },
  { key: "print_8x10", name: "Printed 8x10", price: 10 },
  { key: "print_a4", name: "Printed A4", price: 15 },
  { key: "pass_basic", name: "Digital Pass Basic", price: 50 },
  { key: "pass_unlimited", name: "Digital Pass Unlimited", price: 100 },
  { key: "pass_vip", name: "Digital Pass VIP", price: 150 },
  { key: "magic_shot", name: "Magic Shot add-on", price: 5 },
  { key: "video_reel", name: "Video Reel add-on", price: 10 },
];

export async function ensureDefaultPricing() {
  for (const p of DEFAULT_PRICES) {
    await prisma.pricingConfig.upsert({
      where: { productKey: p.key },
      update: {},
      create: { productKey: p.key, name: p.name, price: p.price },
    });
  }
}

export async function getPrice(key: string): Promise<number> {
  const row = await prisma.pricingConfig.findUnique({ where: { productKey: key } });
  if (row) return row.price;
  const def = DEFAULT_PRICES.find((d) => d.key === key);
  return def ? def.price : 0;
}

export async function getAllPrices() {
  await ensureDefaultPricing();
  return prisma.pricingConfig.findMany({ orderBy: { productKey: "asc" } });
}
