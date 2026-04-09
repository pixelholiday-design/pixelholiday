import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Category display labels & blurbs
const CATEGORY_META: Record<string, { label: string; blurb: string; icon: string }> = {
  DIGITAL:       { label: "Digital Downloads",    blurb: "High-res files delivered instantly to your phone.",           icon: "Download" },
  PRINT:         { label: "Photo Prints",          blurb: "Lab-quality photo prints, ready to frame or gift.",           icon: "Image" },
  WALL_ART:      { label: "Canvas & Wall Art",     blurb: "Premium canvas, metal, and gallery-wrap pieces.",             icon: "Frame" },
  SPECIALTY_WALL:{ label: "Specialty Wall Art",    blurb: "Acrylic, metal, and unique wall-display formats.",            icon: "Palette" },
  PHOTO_BOOK:    { label: "Photo Books & Albums",  blurb: "Luxury layflat and hardcover photo books.",                   icon: "Book" },
  GIFT:          { label: "Photo Gifts",           blurb: "Mugs, puzzles, ornaments and personalised keepsakes.",        icon: "Gift" },
  CARD:          { label: "Photo Cards",           blurb: "Greeting cards, postcards and thank-you sets.",               icon: "Mail" },
  SOUVENIR:      { label: "Resort Souvenirs",      blurb: "Resort-branded souvenirs and wearables.",                     icon: "Star" },
  BUNDLE:        { label: "Bundles & Packages",    blurb: "Save more with curated photo product bundles.",               icon: "Package" },
  DISPLAY:       { label: "Tabletop & Display",    blurb: "Frames, stands, and desk displays for your memories.",        icon: "Monitor" },
  // Legacy / alias keys kept for backwards compat
  PRINTS:        { label: "Photo Prints",          blurb: "Lab-quality photo prints, ready to frame or gift.",           icon: "Image" },
  PASSES:        { label: "Digital Passes",        blurb: "Pre-purchase a photo pass and skip the kiosk line.",          icon: "Gift" },
  ADD_ONS:       { label: "Add-ons",               blurb: "Magic Shots, video reels and other extras.",                  icon: "Star" },
};

const CATEGORY_ORDER = [
  "DIGITAL",
  "PRINT", "PRINTS",
  "WALL_ART",
  "SPECIALTY_WALL",
  "PHOTO_BOOK",
  "GIFT",
  "CARD",
  "SOUVENIR",
  "BUNDLE",
  "DISPLAY",
  "PASSES",
  "ADD_ONS",
];

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { isFeatured: "desc" }, { name: "asc" }],
    });

    // Group by category, maintaining sortOrder within each group
    const byCategory: Record<string, typeof products> = {};
    for (const p of products) {
      const cat = p.category ?? "DIGITAL";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    }

    // Build ordered category list — use CATEGORY_ORDER, skip duplicates, append unknowns
    const seen = new Set<string>();
    const presentCategories: string[] = [];
    for (const c of CATEGORY_ORDER) {
      if (!seen.has(c) && (byCategory[c]?.length ?? 0) > 0) {
        presentCategories.push(c);
        seen.add(c);
      }
    }
    // Append any categories not in the ordered list
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
