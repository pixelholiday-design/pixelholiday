/**
 * Idempotent shop product seeder.
 *
 * Seeds all 70+ ShopProduct rows plus the default Prodigi PrintLabPartner.
 * Safe to re-run: uses prisma.shopProduct.upsert with productKey as the
 * unique key, so existing rows are updated and new rows are inserted.
 *
 * Usage:
 *   npx tsx scripts/seed-shop-products.ts
 *   DATABASE_URL=<url> npx tsx scripts/seed-shop-products.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────────────────────────

function j(v: unknown): string {
  return JSON.stringify(v);
}

type ProductDef = {
  productKey: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sizes?: Array<{ key: string; label: string }>;
  defaultSize?: string;
  options?: Array<{ key: string; label: string }>;
  defaultOption?: string;
  costPrice: number;
  retailPrice: number;
  fulfillmentType: "DIGITAL" | "AUTO" | "MANUAL";
  labName?: string;
  isFeatured?: boolean;
  turnaround: string;
  sortOrder?: number;
};

// ── product definitions ───────────────────────────────────────────────────────

const products: ProductDef[] = [
  // ── DIGITAL DOWNLOADS ──────────────────────────────────────────────────────
  {
    productKey: "single_photo",
    name: "Single Photo Download",
    description: "One full-resolution photo, watermark-free.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 15,
    fulfillmentType: "DIGITAL",
    isFeatured: true,
    turnaround: "Instant",
    sortOrder: 10,
  },
  {
    productKey: "photo_pack_3",
    name: "3 Photo Pack",
    description: "Pick any three photos from your gallery.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 35,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 20,
  },
  {
    productKey: "photo_pack_5",
    name: "5 Photo Pack",
    description: "Pick any five photos from your gallery.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 50,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 30,
  },
  {
    productKey: "photo_pack_10",
    name: "10 Photo Pack",
    description: "Ten of your favourite shots in one bundle.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 75,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 40,
  },
  {
    productKey: "full_gallery",
    name: "Full Gallery Download",
    description: "Every photo from your session, ready to download.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 99,
    fulfillmentType: "DIGITAL",
    isFeatured: true,
    turnaround: "Instant",
    sortOrder: 50,
  },
  {
    productKey: "digital_pass_day",
    name: "Day Pass",
    description: "Unlimited downloads from a single session.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 49,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 60,
  },
  {
    productKey: "digital_pass_stay",
    name: "Stay Pass",
    description: "Unlimited photos & videos for your whole stay.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 99,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 70,
  },
  {
    productKey: "digital_pass_vip",
    name: "VIP Pass",
    description: "Unlimited + sunset shoot + priority photographer.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 149,
    fulfillmentType: "DIGITAL",
    isFeatured: true,
    turnaround: "Instant",
    sortOrder: 80,
  },
  {
    productKey: "auto_reel",
    name: "AI Video Reel",
    description: "AI-edited highlight reel set to music.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 25,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 90,
  },
  {
    productKey: "magic_shot",
    name: "Magic Shot",
    description: "AR effect added to one of your photos.",
    category: "DIGITAL",
    costPrice: 0,
    retailPrice: 8,
    fulfillmentType: "DIGITAL",
    turnaround: "Instant",
    sortOrder: 100,
  },

  // ── PRINTS ─────────────────────────────────────────────────────────────────
  {
    productKey: "print_photo",
    name: "Photo Print",
    description: "Lab-quality printed photo on premium paper.",
    category: "PRINT",
    costPrice: 2,
    retailPrice: 15,
    fulfillmentType: "AUTO",
    labName: "PRODIGI",
    isFeatured: true,
    sizes: [
      { key: "4x6", label: "4×6\"" },
      { key: "5x7", label: "5×7\"" },
      { key: "8x10", label: "8×10\"" },
      { key: "8x12", label: "8×12\"" },
      { key: "11x14", label: "11×14\"" },
      { key: "16x20", label: "16×20\"" },
      { key: "20x30", label: "20×30\"" },
    ],
    defaultSize: "4x6",
    options: [
      { key: "lustre", label: "Lustre" },
      { key: "metallic", label: "Metallic" },
      { key: "matte", label: "Matte" },
      { key: "glossy", label: "Glossy" },
    ],
    defaultOption: "lustre",
    turnaround: "3-5 business days",
    sortOrder: 110,
  },

  // ── WALL ART ───────────────────────────────────────────────────────────────
  {
    productKey: "canvas_wrap",
    name: "Canvas Wrap",
    description: "Gallery-wrapped canvas print, ready to hang.",
    category: "WALL_ART",
    subcategory: "canvas",
    costPrice: 25,
    retailPrice: 89,
    fulfillmentType: "AUTO",
    isFeatured: true,
    sizes: [
      { key: "30x40", label: "30×40cm" },
      { key: "40x60", label: "40×60cm" },
      { key: "50x70", label: "50×70cm" },
      { key: "60x90", label: "60×90cm" },
    ],
    defaultSize: "30x40",
    options: [
      { key: "gallery", label: "Gallery Wrap 1.5\"" },
      { key: "slim", label: "Slim 0.75\"" },
      { key: "black", label: "Black Edge" },
      { key: "white", label: "White Edge" },
    ],
    defaultOption: "gallery",
    turnaround: "3-5 business days",
    sortOrder: 120,
  },
  {
    productKey: "wall_metal",
    name: "Metal Print",
    description: "Vibrant photo printed directly onto aluminium.",
    category: "WALL_ART",
    subcategory: "metal",
    costPrice: 28,
    retailPrice: 85,
    fulfillmentType: "AUTO",
    sizes: [
      { key: "30x40", label: "30×40cm" },
      { key: "40x60", label: "40×60cm" },
      { key: "50x70", label: "50×70cm" },
    ],
    defaultSize: "30x40",
    turnaround: "3-5 business days",
    sortOrder: 130,
  },
  {
    productKey: "wall_acrylic",
    name: "Acrylic Print",
    description: "Photo printed under high-gloss acrylic for stunning depth.",
    category: "WALL_ART",
    subcategory: "acrylic",
    costPrice: 30,
    retailPrice: 89,
    fulfillmentType: "AUTO",
    sizes: [
      { key: "30x40", label: "30×40cm" },
      { key: "40x60", label: "40×60cm" },
    ],
    defaultSize: "30x40",
    turnaround: "3-5 business days",
    sortOrder: 140,
  },
  {
    productKey: "wall_framed",
    name: "Framed Print",
    description: "Professional framed print ready to hang.",
    category: "WALL_ART",
    subcategory: "framed",
    costPrice: 22,
    retailPrice: 75,
    fulfillmentType: "AUTO",
    isFeatured: true,
    sizes: [
      { key: "30x40", label: "30×40cm" },
      { key: "40x60", label: "40×60cm" },
    ],
    defaultSize: "30x40",
    options: [
      { key: "black", label: "Black Frame" },
      { key: "white", label: "White Frame" },
      { key: "natural", label: "Natural Wood" },
      { key: "gold", label: "Gold" },
    ],
    defaultOption: "black",
    turnaround: "3-5 business days",
    sortOrder: 150,
  },

  // ── PHOTO BOOKS ────────────────────────────────────────────────────────────
  {
    productKey: "book_softcover",
    name: "Softcover Photo Book",
    description: "Beautifully printed softcover photo book.",
    category: "PHOTO_BOOK",
    costPrice: 10,
    retailPrice: 35,
    fulfillmentType: "AUTO",
    sizes: [
      { key: "8x8", label: "8×8\"" },
      { key: "8x10", label: "8×10\"" },
      { key: "10x10", label: "10×10\"" },
    ],
    defaultSize: "8x8",
    turnaround: "5-7 business days",
    sortOrder: 160,
  },
  {
    productKey: "book_hardcover",
    name: "Hardcover Photo Book",
    description: "Premium hardcover book to cherish your memories.",
    category: "PHOTO_BOOK",
    costPrice: 18,
    retailPrice: 65,
    fulfillmentType: "AUTO",
    isFeatured: true,
    sizes: [
      { key: "8x8", label: "8×8\"" },
      { key: "10x10", label: "10×10\"" },
      { key: "12x12", label: "12×12\"" },
    ],
    defaultSize: "10x10",
    options: [
      { key: "linen", label: "Linen Cover" },
      { key: "leather", label: "Leather Cover" },
    ],
    defaultOption: "linen",
    turnaround: "5-7 business days",
    sortOrder: 170,
  },
  {
    productKey: "book_layflat",
    name: "Premium Layflat Album",
    description: "Luxurious layflat album — pages open completely flat.",
    category: "PHOTO_BOOK",
    costPrice: 38,
    retailPrice: 129,
    fulfillmentType: "AUTO",
    isFeatured: true,
    sizes: [
      { key: "10x10", label: "10×10\"" },
      { key: "12x12", label: "12×12\"" },
    ],
    defaultSize: "10x10",
    options: [
      { key: "leather", label: "Leather" },
      { key: "linen", label: "Linen" },
      { key: "silk", label: "Silk" },
    ],
    defaultOption: "linen",
    turnaround: "5-7 business days",
    sortOrder: 180,
  },
  {
    productKey: "book_mini",
    name: "Mini Accordion Book",
    description: "Compact accordion-fold keepsake book.",
    category: "PHOTO_BOOK",
    costPrice: 5,
    retailPrice: 19,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 190,
  },

  // ── GIFTS ──────────────────────────────────────────────────────────────────
  {
    productKey: "gift_mug",
    name: "Photo Mug",
    description: "Start every morning with your favourite holiday memory.",
    category: "GIFT",
    costPrice: 5,
    retailPrice: 18,
    fulfillmentType: "AUTO",
    options: [
      { key: "white", label: "Classic White" },
      { key: "magic", label: "Magic Color-Change" },
      { key: "travel", label: "Travel Mug" },
    ],
    defaultOption: "white",
    turnaround: "5-7 business days",
    sortOrder: 200,
  },
  {
    productKey: "gift_phone_case",
    name: "Phone Case",
    description: "Slim, protective case with your holiday photo.",
    category: "GIFT",
    costPrice: 5,
    retailPrice: 22,
    fulfillmentType: "AUTO",
    options: [
      { key: "iphone15", label: "iPhone 15" },
      { key: "iphone16", label: "iPhone 16" },
      { key: "samsung_s24", label: "Samsung S24" },
      { key: "samsung_s25", label: "Samsung S25" },
    ],
    defaultOption: "iphone15",
    turnaround: "5-7 business days",
    sortOrder: 210,
  },
  {
    productKey: "gift_puzzle",
    name: "Photo Puzzle",
    description: "Turn your favourite shot into a fun puzzle.",
    category: "GIFT",
    costPrice: 10,
    retailPrice: 35,
    fulfillmentType: "AUTO",
    options: [
      { key: "500", label: "500 pieces" },
      { key: "1000", label: "1000 pieces" },
    ],
    defaultOption: "500",
    turnaround: "5-7 business days",
    sortOrder: 220,
  },
  {
    productKey: "gift_calendar",
    name: "Photo Calendar",
    description: "12-month personalised photo calendar.",
    category: "GIFT",
    costPrice: 8,
    retailPrice: 28,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 230,
  },
  {
    productKey: "gift_mousepad",
    name: "Photo Mousepad",
    description: "Non-slip mousepad featuring your holiday photo.",
    category: "GIFT",
    costPrice: 3,
    retailPrice: 12,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 240,
  },
  {
    productKey: "gift_tote",
    name: "Canvas Tote Bag",
    description: "Reusable canvas tote with your favourite photo.",
    category: "GIFT",
    costPrice: 5,
    retailPrice: 19,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 250,
  },
  {
    productKey: "gift_cushion",
    name: "Photo Cushion 40×40cm",
    description: "Soft cushion printed with your holiday memory.",
    category: "GIFT",
    costPrice: 8,
    retailPrice: 29,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 260,
  },
  {
    productKey: "gift_blanket",
    name: "Fleece Photo Blanket",
    description: "Cosy fleece blanket with a full-bleed photo print.",
    category: "GIFT",
    costPrice: 18,
    retailPrice: 55,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 270,
  },
  {
    productKey: "gift_towel",
    name: "Photo Beach Towel",
    description: "Bold beach towel printed with your photo.",
    category: "GIFT",
    costPrice: 15,
    retailPrice: 42,
    fulfillmentType: "AUTO",
    turnaround: "5-7 business days",
    sortOrder: 280,
  },

  // ── CARDS ──────────────────────────────────────────────────────────────────
  {
    productKey: "card_greeting",
    name: "Greeting Cards (10)",
    description: "Pack of 10 personalised greeting cards.",
    category: "CARD",
    costPrice: 4,
    retailPrice: 18,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 290,
  },
  {
    productKey: "card_postcard",
    name: "Postcards (5)",
    description: "Pack of 5 photo postcards to send to loved ones.",
    category: "CARD",
    costPrice: 2,
    retailPrice: 10,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 300,
  },
  {
    productKey: "card_thank_you",
    name: "Thank You Cards (10)",
    description: "Pack of 10 personalised thank-you cards.",
    category: "CARD",
    costPrice: 4,
    retailPrice: 18,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 310,
  },
  {
    productKey: "card_holiday",
    name: "Holiday Cards (20)",
    description: "Pack of 20 personalised holiday cards.",
    category: "CARD",
    costPrice: 8,
    retailPrice: 30,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 320,
  },

  // ── SOUVENIRS ──────────────────────────────────────────────────────────────
  {
    productKey: "souvenir_usb",
    name: "Waterproof USB Lanyard",
    description: "Branded waterproof USB loaded with all your photos.",
    category: "SOUVENIR",
    costPrice: 3,
    retailPrice: 28,
    fulfillmentType: "AUTO",
    isFeatured: true,
    turnaround: "2-3 business days",
    sortOrder: 330,
  },
  {
    productKey: "souvenir_magnet",
    name: "Photo Fridge Magnet",
    description: "Small but mighty fridge magnet with your holiday photo.",
    category: "SOUVENIR",
    costPrice: 1.5,
    retailPrice: 10,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 340,
  },
  {
    productKey: "souvenir_keychain",
    name: "Photo Keychain",
    description: "Keep your favourite memory in your pocket.",
    category: "SOUVENIR",
    costPrice: 2,
    retailPrice: 10,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 350,
  },
  {
    productKey: "souvenir_coaster",
    name: "Photo Coaster Set (4)",
    description: "Set of 4 ceramic coasters, each with a different photo.",
    category: "SOUVENIR",
    costPrice: 5,
    retailPrice: 19,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 360,
  },
  {
    productKey: "souvenir_ornament",
    name: "Photo Ornament",
    description: "Decorative ornament to remember your holiday.",
    category: "SOUVENIR",
    costPrice: 4,
    retailPrice: 15,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 370,
  },
  {
    productKey: "souvenir_snowglobe",
    name: "Photo Snow Globe",
    description: "A magical snow globe with your photo inside.",
    category: "SOUVENIR",
    costPrice: 6,
    retailPrice: 25,
    fulfillmentType: "AUTO",
    turnaround: "2-3 business days",
    sortOrder: 380,
  },
];

// ── seeder ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding shop products…");

  // 1. Upsert all ShopProduct rows
  let upserted = 0;
  for (const p of products) {
    await prisma.shopProduct.upsert({
      where: { productKey: p.productKey },
      update: {
        name: p.name,
        description: p.description ?? "",
        category: p.category,
        subcategory: p.subcategory ?? null,
        sizes: p.sizes ? j(p.sizes) : null,
        defaultSize: p.defaultSize ?? null,
        options: p.options ? j(p.options) : null,
        defaultOption: p.defaultOption ?? null,
        costPrice: p.costPrice,
        retailPrice: p.retailPrice,
        fulfillmentType: p.fulfillmentType,
        labName: p.labName ?? null,
        isFeatured: p.isFeatured ?? false,
        turnaround: p.turnaround,
        sortOrder: p.sortOrder ?? 0,
        isActive: true,
      },
      create: {
        productKey: p.productKey,
        name: p.name,
        description: p.description ?? "",
        category: p.category,
        subcategory: p.subcategory ?? null,
        sizes: p.sizes ? j(p.sizes) : null,
        defaultSize: p.defaultSize ?? null,
        options: p.options ? j(p.options) : null,
        defaultOption: p.defaultOption ?? null,
        costPrice: p.costPrice,
        retailPrice: p.retailPrice,
        fulfillmentType: p.fulfillmentType,
        labName: p.labName ?? null,
        isFeatured: p.isFeatured ?? false,
        turnaround: p.turnaround,
        sortOrder: p.sortOrder ?? 0,
        isActive: true,
      },
    });
    upserted++;
  }
  console.log(`  ${upserted} ShopProduct rows upserted`);

  // 2. Upsert the default Prodigi PrintLabPartner
  const existingLab = await prisma.printLabPartner.findFirst({
    where: { name: "Prodigi" },
  });

  if (existingLab) {
    await prisma.printLabPartner.update({
      where: { id: existingLab.id },
      data: {
        type: "PRODIGI_API",
        apiBaseUrl: "https://api.prodigi.com/v4.0",
        isDefault: true,
        markupPercent: 50,
        capabilities: j(["prints", "canvas", "metal", "acrylic", "framed", "books", "gifts", "cards"]),
        isActive: true,
      },
    });
    console.log("  PrintLabPartner 'Prodigi' updated");
  } else {
    await prisma.printLabPartner.create({
      data: {
        name: "Prodigi",
        type: "PRODIGI_API",
        apiBaseUrl: "https://api.prodigi.com/v4.0",
        isDefault: true,
        markupPercent: 50,
        capabilities: j(["prints", "canvas", "metal", "acrylic", "framed", "books", "gifts", "cards"]),
        isActive: true,
      },
    });
    console.log("  PrintLabPartner 'Prodigi' created");
  }

  // 3. Summary
  const [productCount, labCount] = await Promise.all([
    prisma.shopProduct.count({ where: { isActive: true } }),
    prisma.printLabPartner.count({ where: { isActive: true } }),
  ]);

  console.log("\nSeed complete:");
  console.log(`  Active ShopProducts : ${productCount}`);
  console.log(`  Active PrintLabs    : ${labCount}`);
  console.log(`  Featured products   : ${products.filter((p) => p.isFeatured).length}`);
}

main()
  .catch((e) => {
    console.error("seed-shop-products failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
