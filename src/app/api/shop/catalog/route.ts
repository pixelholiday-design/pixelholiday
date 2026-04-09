import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Category display labels & blurbs
const CATEGORY_META: Record<string, { label: string; blurb: string; icon: string }> = {
  DIGITAL: { label: "Digital Downloads", blurb: "High-res files delivered instantly to your phone.", icon: "💾" },
  PRINTS: { label: "Prints", blurb: "Lab-quality photo prints, ready to frame or gift.", icon: "🖼" },
  WALL_ART: { label: "Wall Art", blurb: "Premium canvas, metal, and gallery-wrap pieces.", icon: "🎨" },
  PHOTO_BOOK: { label: "Books", blurb: "Luxury layflat and hardcover photo books.", icon: "📖" },
  GIFT: { label: "Gifts", blurb: "Mugs, puzzles, ornaments and personalised keepsakes.", icon: "🎁" },
  CARD: { label: "Cards", blurb: "Greeting cards, postcards and thank-you sets.", icon: "💌" },
  SOUVENIR: { label: "Souvenirs", blurb: "Resort-branded souvenirs and wearables.", icon: "🌅" },
  PASSES: { label: "Digital Passes", blurb: "Pre-purchase a photo pass and skip the kiosk line.", icon: "🎫" },
  ADD_ONS: { label: "Add-ons", blurb: "Magic Shots, video reels and other extras.", icon: "✨" },
};

const CATEGORY_ORDER = ["DIGITAL", "PASSES", "PRINTS", "WALL_ART", "PHOTO_BOOK", "GIFTS", "GIFT", "CARD", "SOUVENIR", "ADD_ONS"];

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    // Group by category
    const byCategory: Record<string, typeof products> = {};
    for (const p of products) {
      const cat = p.category ?? "DIGITAL";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    }

    // Build ordered category list
    const presentCategories = CATEGORY_ORDER.filter((c) => byCategory[c]?.length > 0);
    // Append any categories not in the ordered list
    for (const c of Object.keys(byCategory)) {
      if (!presentCategories.includes(c)) presentCategories.push(c);
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
