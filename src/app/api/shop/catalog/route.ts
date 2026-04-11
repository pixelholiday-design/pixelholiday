import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// 8 Pixieset-style categories
const CATEGORY_META: Record<string, { label: string; blurb: string; icon: string }> = {
  PRINTS:    { label: "Prints",            blurb: "Lab-quality photo prints on premium paper.",              icon: "Image" },
  WALL_ART:  { label: "Wall Art",          blurb: "Canvas, metal, acrylic, and framed art for your walls.", icon: "Frame" },
  ALBUMS:    { label: "Albums & Books",    blurb: "Photo books and layflat albums to treasure forever.",     icon: "Book" },
  CARDS:     { label: "Cards",            blurb: "Greeting cards, postcards, and personalized stationery.", icon: "Mail" },
  DIGITAL:   { label: "Digital Downloads", blurb: "High-res files delivered instantly to your device.",      icon: "Download" },
  PACKAGES:  { label: "Packages",         blurb: "Curated bundles — prints, wall art, and digital.",        icon: "Package" },
  GIFTS:     { label: "Gifts & Souvenirs",blurb: "Mugs, puzzles, ornaments, and personalized keepsakes.",   icon: "Gift" },
  OTHERS:    { label: "Extras",           blurb: "Video reels, retouching, and custom products.",            icon: "Star" },
  // Legacy aliases
  PRINT:     { label: "Prints",            blurb: "Lab-quality photo prints.",                              icon: "Image" },
  PHOTO_BOOK:{ label: "Albums & Books",    blurb: "Photo books and albums.",                                icon: "Book" },
  GIFT:      { label: "Gifts",            blurb: "Photo gifts and keepsakes.",                              icon: "Gift" },
  CARD:      { label: "Cards",            blurb: "Cards and stationery.",                                   icon: "Mail" },
};

const CATEGORY_ORDER = [
  "PRINTS", "WALL_ART", "ALBUMS", "CARDS", "DIGITAL", "PACKAGES", "GIFTS", "OTHERS",
];

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { isFeatured: "desc" }, { name: "asc" }],
    });

    const byCategory: Record<string, typeof products> = {};
    for (const p of products) {
      const cat = p.category ?? "OTHERS";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    }

    const seen = new Set<string>();
    const presentCategories: string[] = [];
    for (const c of CATEGORY_ORDER) {
      if (!seen.has(c) && (byCategory[c]?.length ?? 0) > 0) {
        presentCategories.push(c);
        seen.add(c);
      }
    }
    for (const c of Object.keys(byCategory)) {
      if (!seen.has(c)) {
        presentCategories.push(c);
        seen.add(c);
      }
    }

    return NextResponse.json({
      products,
      byCategory,
      categories: presentCategories,
      categoryMeta: CATEGORY_META,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, products: [], byCategory: {}, categories: [], categoryMeta: CATEGORY_META }, { status: 500 });
  }
}
