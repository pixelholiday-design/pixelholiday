import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PRODUCTS = [
  // DIGITAL
  { productKey: "digital_single", name: "Single Photo Download", category: "DIGITAL", retailPrice: 15, costPrice: 0, description: "One high-resolution digital photo, instant delivery.", isFeatured: true, sortOrder: 1, fulfillmentType: "DIGITAL" },
  { productKey: "digital_5pack", name: "5-Photo Pack", category: "DIGITAL", retailPrice: 49, costPrice: 0, description: "Choose any 5 photos from your gallery.", isFeatured: true, sortOrder: 2, fulfillmentType: "DIGITAL" },
  { productKey: "digital_10pack", name: "10-Photo Pack", category: "DIGITAL", retailPrice: 79, costPrice: 0, description: "Choose any 10 photos from your gallery.", isFeatured: false, sortOrder: 3, fulfillmentType: "DIGITAL" },
  { productKey: "digital_full", name: "Full Gallery Download", category: "DIGITAL", retailPrice: 99, costPrice: 0, description: "Download every photo from your session in full resolution.", isFeatured: true, sortOrder: 4, fulfillmentType: "DIGITAL" },
  { productKey: "digital_pass_basic", name: "Digital Pass — Basic", category: "DIGITAL", retailPrice: 50, costPrice: 0, description: "Pre-paid photo package for your stay.", sortOrder: 5, fulfillmentType: "DIGITAL" },
  { productKey: "digital_pass_unlimited", name: "Digital Pass — Unlimited", category: "DIGITAL", retailPrice: 100, costPrice: 0, description: "Unlimited photos during your entire stay.", isFeatured: true, sortOrder: 6, fulfillmentType: "DIGITAL" },
  { productKey: "digital_pass_vip", name: "Digital Pass — VIP", category: "DIGITAL", retailPrice: 150, costPrice: 0, description: "Priority sessions + sunset shoot + all photos.", sortOrder: 7, fulfillmentType: "DIGITAL" },
  { productKey: "video_reel", name: "Video Reel", category: "DIGITAL", retailPrice: 30, costPrice: 0, description: "AI-generated highlight reel from your burst photos.", sortOrder: 8, fulfillmentType: "DIGITAL" },
  { productKey: "magic_shot", name: "Magic Shot", category: "DIGITAL", retailPrice: 20, costPrice: 0, description: "AR/3D character overlay on your photo.", sortOrder: 9, fulfillmentType: "DIGITAL" },

  // PRINTS
  { productKey: "print_4x6", name: "4×6 Print", category: "PRINT", retailPrice: 5, costPrice: 1.5, description: "Classic 4×6 inch photo print on lustre paper.", sortOrder: 10, sizes: JSON.stringify([{ key: "4x6", label: "4×6 inch" }]) },
  { productKey: "print_5x7", name: "5×7 Print", category: "PRINT", retailPrice: 8, costPrice: 2, description: "5×7 inch print, perfect for frames.", sortOrder: 11 },
  { productKey: "print_8x10", name: "8×10 Print", category: "PRINT", retailPrice: 15, costPrice: 3.5, description: "Large 8×10 print on premium paper.", isFeatured: true, sortOrder: 12 },
  { productKey: "print_a4", name: "A4 Print", category: "PRINT", retailPrice: 20, costPrice: 4, description: "A4 size print, ideal for display.", sortOrder: 13 },
  { productKey: "print_a3", name: "A3 Print", category: "PRINT", retailPrice: 35, costPrice: 7, description: "Large A3 poster-size print.", sortOrder: 14 },

  // WALL ART
  { productKey: "canvas_12x16", name: "Canvas 12×16", category: "WALL_ART", subcategory: "canvas", retailPrice: 59, costPrice: 18, description: "Gallery-wrapped canvas, ready to hang.", isFeatured: true, sortOrder: 20 },
  { productKey: "canvas_16x24", name: "Canvas 16×24", category: "WALL_ART", subcategory: "canvas", retailPrice: 89, costPrice: 25, description: "Medium gallery-wrapped canvas.", sortOrder: 21 },
  { productKey: "canvas_24x36", name: "Canvas 24×36", category: "WALL_ART", subcategory: "canvas", retailPrice: 139, costPrice: 38, description: "Large statement canvas piece.", sortOrder: 22 },
  { productKey: "metal_8x12", name: "Metal Print 8×12", category: "WALL_ART", subcategory: "metal", retailPrice: 49, costPrice: 15, description: "Vibrant metal print with modern floating mount.", sortOrder: 23 },
  { productKey: "metal_16x24", name: "Metal Print 16×24", category: "WALL_ART", subcategory: "metal", retailPrice: 99, costPrice: 30, description: "Large HD metal print.", isFeatured: true, sortOrder: 24 },
  { productKey: "framed_8x10", name: "Framed 8×10", category: "WALL_ART", subcategory: "framed", retailPrice: 45, costPrice: 14, description: "8×10 print in a premium black or white frame.", sortOrder: 25 },
  { productKey: "acrylic_12x16", name: "Acrylic 12×16", category: "WALL_ART", subcategory: "acrylic", retailPrice: 79, costPrice: 22, description: "Stunning acrylic glass print with depth effect.", sortOrder: 26 },

  // PHOTO BOOKS
  { productKey: "book_softcover", name: "Softcover Photo Book", category: "PHOTO_BOOK", retailPrice: 39, costPrice: 12, description: "20-page softcover photo book.", sortOrder: 30 },
  { productKey: "book_hardcover", name: "Hardcover Photo Book", category: "PHOTO_BOOK", retailPrice: 69, costPrice: 20, description: "Premium hardcover with lay-flat pages.", isFeatured: true, sortOrder: 31 },
  { productKey: "book_layflat", name: "Luxury Layflat Album", category: "PHOTO_BOOK", retailPrice: 150, costPrice: 45, description: "Professional-grade layflat album, 30 pages.", sortOrder: 32 },

  // GIFTS
  { productKey: "gift_mug", name: "Photo Mug", category: "GIFT", retailPrice: 18, costPrice: 6, description: "11oz ceramic mug with your favourite photo.", sortOrder: 40 },
  { productKey: "gift_phone_case", name: "Custom Phone Case", category: "GIFT", retailPrice: 25, costPrice: 8, description: "Hard-shell phone case with your photo.", sortOrder: 41 },
  { productKey: "gift_puzzle", name: "Photo Puzzle (500pc)", category: "GIFT", retailPrice: 35, costPrice: 12, description: "500-piece jigsaw puzzle of your photo.", isFeatured: true, sortOrder: 42 },
  { productKey: "gift_magnet", name: "Photo Magnet", category: "GIFT", retailPrice: 8, costPrice: 2.5, description: "Fridge magnet with your holiday photo.", sortOrder: 43 },
  { productKey: "gift_keychain", name: "Photo Keychain", category: "GIFT", retailPrice: 12, costPrice: 3, description: "Acrylic keychain with your photo.", sortOrder: 44 },
  { productKey: "gift_calendar", name: "Photo Calendar", category: "GIFT", retailPrice: 29, costPrice: 9, description: "12-month wall calendar with your photos.", sortOrder: 45 },
  { productKey: "gift_tote", name: "Photo Tote Bag", category: "GIFT", retailPrice: 22, costPrice: 7, description: "Canvas tote bag with your photo printed.", sortOrder: 46 },

  // CARDS
  { productKey: "card_greeting", name: "Greeting Card (set of 10)", category: "CARD", retailPrice: 25, costPrice: 8, description: "Set of 10 folded greeting cards with your photo.", sortOrder: 50 },
  { productKey: "card_postcard", name: "Photo Postcards (set of 20)", category: "CARD", retailPrice: 18, costPrice: 5, description: "20 postcards featuring your holiday photo.", isFeatured: true, sortOrder: 51 },
  { productKey: "card_thankyou", name: "Thank You Cards (set of 10)", category: "CARD", retailPrice: 22, costPrice: 7, description: "Elegant thank-you cards with your photo.", sortOrder: 52 },

  // SOUVENIRS
  { productKey: "souvenir_coaster", name: "Photo Coaster Set (4)", category: "SOUVENIR", retailPrice: 18, costPrice: 5, description: "Set of 4 ceramic coasters with your photo.", sortOrder: 60 },
  { productKey: "souvenir_ornament", name: "Photo Ornament", category: "SOUVENIR", retailPrice: 15, costPrice: 4, description: "Round ceramic ornament with your holiday memory.", sortOrder: 61 },
  { productKey: "souvenir_snow_globe", name: "Photo Snow Globe", category: "SOUVENIR", retailPrice: 35, costPrice: 12, description: "Custom snow globe with your photo inside.", isFeatured: true, sortOrder: 62 },

  // BUNDLES
  { productKey: "bundle_starter", name: "Starter Bundle", category: "BUNDLE", retailPrice: 49, costPrice: 10, description: "5 digital photos + 2 prints + 1 magnet. Save 30%.", isFeatured: true, sortOrder: 70 },
  { productKey: "bundle_family", name: "Family Bundle", category: "BUNDLE", retailPrice: 129, costPrice: 30, description: "Full gallery + canvas + photo book. Save 40%.", sortOrder: 71 },
  { productKey: "bundle_premium", name: "Premium Bundle", category: "BUNDLE", retailPrice: 199, costPrice: 50, description: "Full gallery + large canvas + layflat album + mug. Save 45%.", sortOrder: 72 },
];

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== "fotiqo-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.shopProduct.count();
  if (existing > 0) {
    return NextResponse.json({ message: "Shop already seeded", count: existing });
  }

  let created = 0;
  for (const p of PRODUCTS) {
    await prisma.shopProduct.create({
      data: {
        productKey: p.productKey,
        name: p.name,
        category: p.category,
        subcategory: (p as any).subcategory || null,
        retailPrice: p.retailPrice,
        costPrice: p.costPrice,
        description: p.description,
        isFeatured: (p as any).isFeatured || false,
        sortOrder: p.sortOrder,
        fulfillmentType: (p as any).fulfillmentType || "AUTO",
        sizes: (p as any).sizes || null,
        isActive: true,
      },
    });
    created++;
  }

  return NextResponse.json({ success: true, created });
}
