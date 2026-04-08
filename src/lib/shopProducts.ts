import { prisma } from "@/lib/db";

export type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  price: number;
  currency: string;
  category: ShopCategory;
  description: string;
  badge?: string;
  locationName?: string;
};

export type ShopCategory =
  | "DIGITAL"
  | "PRINTS"
  | "WALL_ART"
  | "PASSES"
  | "ADD_ONS";

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  DIGITAL: "Digital downloads",
  PRINTS: "Prints",
  WALL_ART: "Wall art & keepsakes",
  PASSES: "Digital passes",
  ADD_ONS: "Add-ons",
};

export const CATEGORY_BLURB: Record<ShopCategory, string> = {
  DIGITAL: "High-resolution downloads delivered straight to your phone.",
  PRINTS: "Lab-quality printed photos, ready to frame or gift.",
  WALL_ART: "Premium canvas, USB keepsakes and gallery pieces.",
  PASSES: "Pre-purchase a pass and skip the kiosk line.",
  ADD_ONS: "Magic Shots, video reels, and other extras.",
};

const KEY_TO_CATEGORY: Record<string, ShopCategory> = {
  single_photo: "DIGITAL",
  three_photos: "DIGITAL",
  ten_pack: "DIGITAL",
  full_gallery: "DIGITAL",
  full_gallery_premium: "DIGITAL",
  print_4x6: "PRINTS",
  print_5x7: "PRINTS",
  print_8x10: "PRINTS",
  print_a4: "PRINTS",
  canvas_30x40: "WALL_ART",
  waterproof_usb: "WALL_ART",
  pass_basic: "PASSES",
  pass_unlimited: "PASSES",
  pass_vip: "PASSES",
  magic_shot: "ADD_ONS",
  video_reel: "ADD_ONS",
};

const KEY_TO_DESC: Record<string, string> = {
  single_photo: "One full-resolution photo, watermark-free.",
  three_photos: "Pick any three photos from your gallery.",
  ten_pack: "Ten of your favourite shots in one bundle.",
  full_gallery: "Every photo from your session, ready to download.",
  full_gallery_premium: "Full gallery + retouched highlights.",
  print_4x6: "Standard 10×15 cm photo print on premium paper.",
  print_5x7: "13×18 cm print on lustre archival paper.",
  print_8x10: "20×25 cm print, frame-ready.",
  print_a4: "21×30 cm A4 print, museum-quality.",
  canvas_30x40: "30×40 cm gallery-wrapped canvas.",
  waterproof_usb: "Branded waterproof USB with all your photos.",
  pass_basic: "Unlimited downloads from a single session.",
  pass_unlimited: "Unlimited photos & videos for your whole stay.",
  pass_vip: "Unlimited + sunset shoot + priority photographer.",
  magic_shot: "AR effect added to one of your photos.",
  video_reel: "AI-edited highlight reel set to music.",
};

const KEY_TO_BADGE: Record<string, string | undefined> = {
  full_gallery_premium: "Most popular",
  pass_unlimited: "Best value",
  pass_vip: "VIP",
};

export async function loadShopProducts(): Promise<{
  byCategory: Record<ShopCategory, ShopProduct[]>;
  all: ShopProduct[];
}> {
  const rows = await prisma.pricingConfig.findMany({
    where: { isActive: true, isHidden: false },
    include: { location: { select: { name: true } } },
    orderBy: [{ displayOrder: "asc" }, { price: "asc" }],
  });

  const mapped: ShopProduct[] = rows
    .filter((r) => KEY_TO_CATEGORY[r.productKey])
    .map((r) => ({
      id: r.id,
      productKey: r.productKey,
      name: r.name,
      price: r.price,
      currency: r.currency,
      category: KEY_TO_CATEGORY[r.productKey],
      description: KEY_TO_DESC[r.productKey] ?? "",
      badge: KEY_TO_BADGE[r.productKey],
      locationName: r.location?.name,
    }));

  // Dedupe by productKey: pricing can have one global row + per-location overrides;
  // the shop shows the canonical (first / lowest displayOrder) price.
  const seen = new Set<string>();
  const deduped: ShopProduct[] = [];
  for (const p of mapped) {
    if (seen.has(p.productKey)) continue;
    seen.add(p.productKey);
    deduped.push(p);
  }

  const byCategory: Record<ShopCategory, ShopProduct[]> = {
    DIGITAL: [],
    PRINTS: [],
    WALL_ART: [],
    PASSES: [],
    ADD_ONS: [],
  };
  for (const p of deduped) byCategory[p.category].push(p);

  return { byCategory, all: deduped };
}

export async function getProductById(id: string): Promise<ShopProduct | null> {
  const { all } = await loadShopProducts();
  return all.find((p) => p.id === id || p.productKey === id) ?? null;
}
