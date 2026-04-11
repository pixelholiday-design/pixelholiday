/**
 * Seed script: Pixieset-style photography store
 * 65 products across 8 categories — photography industry only
 * Run: npx tsx scripts/seed-pixieset-store.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const J = JSON.stringify;

const products = [
  // ═══════════════════════════════════════
  // CATEGORY: PRINTS
  // ═══════════════════════════════════════
  {
    productKey: "print_lustre",
    name: "Photographic Print — Lustre",
    description: "Professional photographic print on premium lustre photo paper. Rich colors, sharp detail, subtle sheen.",
    category: "PRINTS",
    subcategory: "lustre",
    sizes: J([
      { name: "4×6", cost: 1.80, width: 4, height: 6 },
      { name: "5×7", cost: 2.20, width: 5, height: 7 },
      { name: "8×10", cost: 3.50, width: 8, height: 10 },
      { name: "8×12", cost: 4.00, width: 8, height: 12 },
      { name: "11×14", cost: 6.50, width: 11, height: 14 },
      { name: "12×18", cost: 8.00, width: 12, height: 18 },
      { name: "16×20", cost: 12.00, width: 16, height: 20 },
      { name: "16×24", cost: 14.00, width: 16, height: 24 },
      { name: "20×30", cost: 18.00, width: 20, height: 30 },
      { name: "24×36", cost: 25.00, width: 24, height: 36 },
    ]),
    papers: J([{ name: "Lustre", costAddon: 0 }, { name: "Glossy", costAddon: 0 }, { name: "Deep Matte", costAddon: 0.50 }]),
    costPrice: 1.80, retailPrice: 5.00,
    labName: "PRODIGI", fulfillmentType: "AUTO",
    turnaround: "3-5 business days", sortOrder: 1, isFeatured: true,
  },
  {
    productKey: "print_glossy",
    name: "Photographic Print — Glossy",
    description: "Vibrant glossy photo print with maximum color intensity and reflection.",
    category: "PRINTS", subcategory: "glossy",
    sizes: J([
      { name: "4×6", cost: 1.80 }, { name: "5×7", cost: 2.20 }, { name: "8×10", cost: 3.50 },
      { name: "11×14", cost: 6.50 }, { name: "16×20", cost: 12.00 }, { name: "24×36", cost: 25.00 },
    ]),
    costPrice: 1.80, retailPrice: 5.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "3-5 business days", sortOrder: 2,
  },
  {
    productKey: "print_matte",
    name: "Photographic Print — Matte",
    description: "Elegant matte finish with no glare. Perfect for framing.",
    category: "PRINTS", subcategory: "matte",
    sizes: J([
      { name: "4×6", cost: 2.00 }, { name: "5×7", cost: 2.50 }, { name: "8×10", cost: 4.00 },
      { name: "11×14", cost: 7.00 }, { name: "16×20", cost: 13.00 }, { name: "24×36", cost: 26.00 },
    ]),
    costPrice: 2.00, retailPrice: 5.50,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "3-5 business days", sortOrder: 3,
  },
  {
    productKey: "print_fineart",
    name: "Fine Art Print",
    description: "Museum-quality giclée print on archival fine art paper. 100+ year longevity.",
    category: "PRINTS", subcategory: "fine-art",
    sizes: J([
      { name: "8×10", cost: 8.00 }, { name: "11×14", cost: 12.00 }, { name: "12×18", cost: 15.00 },
      { name: "16×20", cost: 22.00 }, { name: "20×30", cost: 35.00 }, { name: "24×36", cost: 45.00 },
    ]),
    papers: J([{ name: "Smooth Cotton Rag", costAddon: 0 }, { name: "Textured Fine Art", costAddon: 2 }, { name: "Baryta", costAddon: 3 }]),
    costPrice: 8.00, retailPrice: 22.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 4, isFeatured: true,
  },
  {
    productKey: "print_mounted",
    name: "Mounted Print",
    description: "Photo print mounted on rigid board. Ready to frame or display on an easel.",
    category: "PRINTS", subcategory: "mounted",
    sizes: J([
      { name: "8×10", cost: 8.00 }, { name: "11×14", cost: 12.00 }, { name: "16×20", cost: 18.00 }, { name: "20×30", cost: 28.00 },
    ]),
    options: J([{ name: "Styrene Board", costAddon: 0 }, { name: "Foam Board", costAddon: 2 }, { name: "Gator Board", costAddon: 5 }]),
    costPrice: 8.00, retailPrice: 18.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 5,
  },

  // ═══════════════════════════════════════
  // CATEGORY: WALL_ART
  // ═══════════════════════════════════════
  {
    productKey: "wall_canvas",
    name: "Canvas Wrap",
    description: "Premium canvas hand-stretched on wooden frame. Ready to hang. Gallery-quality.",
    category: "WALL_ART", subcategory: "canvas", hasRoomPreview: true,
    sizes: J([
      { name: "8×8", cost: 18 }, { name: "8×10", cost: 20 }, { name: "10×10", cost: 22 },
      { name: "11×14", cost: 28 }, { name: "12×12", cost: 30 }, { name: "16×16", cost: 38 },
      { name: "16×20", cost: 42 }, { name: "20×20", cost: 48 }, { name: "20×30", cost: 58 },
      { name: "24×36", cost: 72 }, { name: "30×40", cost: 95 },
    ]),
    options: J([{ name: "Image Wrap", costAddon: 0 }, { name: "Mirror Wrap", costAddon: 0 }, { name: "Black Edge", costAddon: 0 }, { name: "White Edge", costAddon: 0 }]),
    costPrice: 18, retailPrice: 45,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 10, isFeatured: true,
  },
  {
    productKey: "wall_framed_canvas",
    name: "Framed Canvas",
    description: "Canvas print in a premium floating frame. Statement wall art for any room.",
    category: "WALL_ART", subcategory: "framed-canvas", hasRoomPreview: true,
    sizes: J([
      { name: "8×10", cost: 35 }, { name: "11×14", cost: 45 }, { name: "16×20", cost: 65 },
      { name: "20×30", cost: 85 }, { name: "24×36", cost: 110 },
    ]),
    frames: J([{ name: "Black", costAddon: 0 }, { name: "White", costAddon: 0 }, { name: "Natural Wood", costAddon: 5 }, { name: "Walnut", costAddon: 8 }]),
    costPrice: 35, retailPrice: 85,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 11,
  },
  {
    productKey: "wall_metal",
    name: "Metal Print",
    description: "Photo on premium aluminum via dye sublimation. Ultra-vivid colors, modern look.",
    category: "WALL_ART", subcategory: "metal", hasRoomPreview: true,
    sizes: J([
      { name: "8×8", cost: 25 }, { name: "8×10", cost: 28 }, { name: "11×14", cost: 38 },
      { name: "12×12", cost: 40 }, { name: "16×20", cost: 55 }, { name: "20×30", cost: 78 }, { name: "24×36", cost: 105 },
    ]),
    finishes: J([{ name: "High Gloss" }, { name: "Satin Matte" }]),
    costPrice: 25, retailPrice: 65,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 12, isFeatured: true,
  },
  {
    productKey: "wall_acrylic",
    name: "Acrylic Print",
    description: "Photo face-mounted behind crystal-clear acrylic glass. Stunning depth and vibrancy.",
    category: "WALL_ART", subcategory: "acrylic", hasRoomPreview: true,
    sizes: J([
      { name: "8×8", cost: 30 }, { name: "8×10", cost: 35 }, { name: "11×14", cost: 48 },
      { name: "16×20", cost: 68 }, { name: "20×30", cost: 95 }, { name: "24×36", cost: 130 },
    ]),
    costPrice: 30, retailPrice: 75,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 13,
  },
  {
    productKey: "wall_wood",
    name: "Wood Print",
    description: "Photo printed directly on real wood. Natural grain shows through light areas.",
    category: "WALL_ART", subcategory: "wood", hasRoomPreview: true,
    sizes: J([
      { name: "8×8", cost: 22 }, { name: "8×10", cost: 25 }, { name: "11×14", cost: 35 }, { name: "16×20", cost: 50 },
    ]),
    costPrice: 22, retailPrice: 55,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 14,
  },
  {
    productKey: "wall_framed_print",
    name: "Framed Print",
    description: "Professional print in a handcrafted frame with acrylic glazing. Ready to hang.",
    category: "WALL_ART", subcategory: "framed-print", hasRoomPreview: true,
    sizes: J([
      { name: "8×10", cost: 28 }, { name: "11×14", cost: 38 }, { name: "12×16", cost: 42 },
      { name: "16×20", cost: 55 }, { name: "20×30", cost: 75 }, { name: "24×36", cost: 98 },
    ]),
    frames: J([
      { name: "Classic Black", costAddon: 0 }, { name: "Classic White", costAddon: 0 },
      { name: "Natural Oak", costAddon: 5 }, { name: "Walnut", costAddon: 8 },
      { name: "Distressed Black", costAddon: 3 }, { name: "Distressed White", costAddon: 3 },
    ]),
    options: J([{ name: "White Mat", costAddon: 0 }, { name: "Black Mat", costAddon: 0 }, { name: "No Mat", costAddon: 0 }]),
    costPrice: 28, retailPrice: 68,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 15, isFeatured: true,
  },
  {
    productKey: "wall_float_frame",
    name: "Float Frame",
    description: "Print floating inside a frame with gap. Modern, gallery-style display.",
    category: "WALL_ART", subcategory: "float-frame", hasRoomPreview: true,
    sizes: J([
      { name: "8×10", cost: 45 }, { name: "11×14", cost: 58 }, { name: "16×20", cost: 78 },
      { name: "20×30", cost: 105 }, { name: "24×36", cost: 140 },
    ]),
    frames: J([
      { name: "Classic Black", costAddon: 0 }, { name: "Classic White", costAddon: 0 },
      { name: "Wood Natural", costAddon: 5 }, { name: "Wood Walnut", costAddon: 8 },
    ]),
    costPrice: 45, retailPrice: 110,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 16,
  },
  {
    productKey: "wall_acrylic_block",
    name: "Acrylic Block",
    description: "Crystal-clear freestanding acrylic block. Perfect desk or shelf display.",
    category: "WALL_ART", subcategory: "acrylic-block",
    sizes: J([
      { name: "4×4", cost: 15 }, { name: "4×6", cost: 18 }, { name: "5×7", cost: 22 }, { name: "6×6", cost: 25 },
    ]),
    costPrice: 15, retailPrice: 35,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 17,
  },
  {
    productKey: "wall_photo_tiles",
    name: "Photo Tiles",
    description: "Lightweight adhesive-backed foam tiles. Stick to any wall, rearrange anytime.",
    category: "WALL_ART", subcategory: "tiles", hasRoomPreview: true,
    sizes: J([{ name: "8×8", cost: 12 }, { name: "8×10", cost: 14 }]),
    costPrice: 12, retailPrice: 28,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 18,
  },

  // ═══════════════════════════════════════
  // CATEGORY: ALBUMS
  // ═══════════════════════════════════════
  {
    productKey: "album_signature",
    name: "Signature Photo Album",
    description: "Handcrafted flush mount album with thick layflat pages. The ultimate keepsake.",
    category: "ALBUMS", subcategory: "signature", comingSoon: true, minPhotos: 20,
    sizes: J([{ name: "8×8", cost: 120 }, { name: "10×10", cost: 160 }, { name: "12×12", cost: 200 }]),
    options: J([
      { name: "Premium Leather", costAddon: 0 }, { name: "Linen", costAddon: 0 },
      { name: "Silk", costAddon: 10 }, { name: "Acrylic Cover", costAddon: 20 }, { name: "Wood Cover", costAddon: 25 },
    ]),
    costPrice: 120, retailPrice: 350,
    labName: "WHCC", fulfillmentType: "MANUAL", turnaround: "10-14 business days", sortOrder: 20,
  },
  {
    productKey: "album_layflat",
    name: "Layflat Photo Book",
    description: "Layflat binding with seamless panoramic spreads. Perfect for everyday sessions.",
    category: "ALBUMS", subcategory: "layflat", comingSoon: true, minPhotos: 20,
    sizes: J([{ name: "8×8", cost: 80 }, { name: "10×10", cost: 110 }, { name: "8×11", cost: 95 }]),
    costPrice: 80, retailPrice: 220,
    labName: "WHCC", fulfillmentType: "MANUAL", turnaround: "10-14 business days", sortOrder: 21,
  },
  {
    productKey: "album_softcover",
    name: "Softcover Photo Book",
    description: "Beautiful softcover photo book with professional printing. Affordable gift option.",
    category: "ALBUMS", subcategory: "softcover", minPhotos: 10,
    sizes: J([{ name: "8×8", cost: 18 }, { name: "8×11", cost: 22 }, { name: "11×8 Landscape", cost: 22 }]),
    costPrice: 18, retailPrice: 39,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 22,
  },
  {
    productKey: "album_hardcover",
    name: "Hardcover Photo Book",
    description: "Premium hardcover photo book with matte or glossy pages. Coffee table worthy.",
    category: "ALBUMS", subcategory: "hardcover", minPhotos: 10,
    sizes: J([
      { name: "8×8", cost: 28 }, { name: "8×11", cost: 35 },
      { name: "11×8 Landscape", cost: 35 }, { name: "12×12", cost: 42 },
    ]),
    costPrice: 28, retailPrice: 69,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 23, isFeatured: true,
  },
  {
    productKey: "album_mini_accordion",
    name: "Mini Accordion Album",
    description: "Adorable mini accordion-fold album. Perfect surprise gift. Fits in a purse.",
    category: "ALBUMS", subcategory: "mini", comingSoon: true, minPhotos: 10,
    sizes: J([{ name: "3×3 (10 panels)", cost: 15 }]),
    costPrice: 15, retailPrice: 35,
    labName: "WHCC", fulfillmentType: "MANUAL", turnaround: "7-10 business days", sortOrder: 24,
  },

  // ═══════════════════════════════════════
  // CATEGORY: CARDS
  // ═══════════════════════════════════════
  {
    productKey: "card_flat",
    name: "Flat Greeting Card",
    description: "Single-sided flat card. Perfect for thank-you notes, holiday greetings, announcements.",
    category: "CARDS", subcategory: "flat",
    sizes: J([{ name: "4×6", cost: 1.20 }, { name: "5×7", cost: 1.80 }]),
    finishes: J([{ name: "Matte" }, { name: "Glossy" }, { name: "Pearl" }]),
    costPrice: 1.20, retailPrice: 3.50,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 30,
  },
  {
    productKey: "card_folded",
    name: "Folded Greeting Card",
    description: "Folded card with photo on front, custom message inside. Includes envelope.",
    category: "CARDS", subcategory: "folded",
    sizes: J([{ name: "5×7", cost: 2.50 }]),
    costPrice: 2.50, retailPrice: 5.50,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 31,
  },
  {
    productKey: "card_postcard",
    name: "Postcard",
    description: "Classic postcard with your photo on front. Great for marketing or thank-you notes.",
    category: "CARDS", subcategory: "postcard",
    sizes: J([{ name: "4×6", cost: 1.20 }, { name: "5×7", cost: 1.80 }]),
    costPrice: 1.20, retailPrice: 2.50,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 32,
  },
  {
    productKey: "card_holiday",
    name: "Holiday Card",
    description: "Personalized holiday card with your photo and custom text. Includes envelope.",
    category: "CARDS", subcategory: "holiday",
    sizes: J([{ name: "5×7", cost: 2.50 }]),
    costPrice: 2.50, retailPrice: 5.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 33,
  },
  {
    productKey: "card_save_date",
    name: "Save the Date Card",
    description: "Announce your wedding date with a beautiful personalized card.",
    category: "CARDS", subcategory: "save-the-date",
    sizes: J([{ name: "5×7", cost: 2.50 }, { name: "4×6", cost: 1.80 }]),
    costPrice: 1.80, retailPrice: 4.50,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 34,
  },
  {
    productKey: "card_thankyou",
    name: "Thank You Card",
    description: "Express gratitude with a personalized thank-you card featuring your photo.",
    category: "CARDS", subcategory: "thank-you",
    sizes: J([{ name: "5×7", cost: 2.50 }]),
    costPrice: 2.50, retailPrice: 5.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 35,
  },

  // ═══════════════════════════════════════
  // CATEGORY: DIGITAL
  // ═══════════════════════════════════════
  {
    productKey: "digital_single",
    name: "Single Photo Download",
    description: "Download a single high-resolution digital photo. Instant delivery.",
    category: "DIGITAL", isDigital: true,
    options: J([{ name: "Web-size (2048px)", costAddon: 0 }, { name: "Full Resolution", costAddon: 2 }]),
    costPrice: 0, retailPrice: 5.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 40,
  },
  {
    productKey: "digital_gallery",
    name: "Full Gallery Download",
    description: "Download all photos from this gallery. Instant delivery to your device.",
    category: "DIGITAL", isDigital: true,
    options: J([{ name: "Web-size (all photos)", costAddon: 0 }, { name: "Full Resolution (all photos)", costAddon: 10 }]),
    costPrice: 0, retailPrice: 49.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 41, isFeatured: true,
  },

  // ═══════════════════════════════════════
  // CATEGORY: PACKAGES
  // ═══════════════════════════════════════
  {
    productKey: "pkg_starter",
    name: "Starter Package",
    description: "5 digital downloads (web-size) + 3 prints (5×7 Lustre). Perfect starter bundle.",
    category: "PACKAGES",
    costPrice: 8, retailPrice: 29.00,
    fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 50,
  },
  {
    productKey: "pkg_wallart",
    name: "Wall Art Package",
    description: "1 Canvas 16×20 + 2 Framed Prints 8×10 + Full Gallery Download.",
    category: "PACKAGES",
    costPrice: 65, retailPrice: 179.00,
    fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 51, isFeatured: true,
  },
  {
    productKey: "pkg_family",
    name: "Family Package",
    description: "1 Hardcover Photo Book 8×11 + 10 prints (4×6) + Full Gallery Download.",
    category: "PACKAGES",
    costPrice: 50, retailPrice: 129.00,
    fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 52,
  },
  {
    productKey: "pkg_premium",
    name: "Premium Package",
    description: "Metal Print 16×20 + Canvas 11×14 + 2 Framed Prints 8×10 + Full Gallery Download.",
    category: "PACKAGES",
    costPrice: 130, retailPrice: 349.00,
    fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 53, isFeatured: true,
  },

  // ═══════════════════════════════════════
  // CATEGORY: GIFTS
  // ═══════════════════════════════════════
  {
    productKey: "gift_magnet",
    name: "Photo Magnet",
    description: "Durable fridge magnet with your favorite photo. Small but mighty.",
    category: "GIFTS", subcategory: "magnet",
    sizes: J([{ name: "2×3", cost: 3.50 }, { name: "3×4", cost: 4.50 }, { name: "4×6", cost: 6.00 }]),
    costPrice: 3.50, retailPrice: 8.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 60,
  },
  {
    productKey: "gift_keychain",
    name: "Photo Keychain",
    description: "Carry your favorite memory everywhere. Durable acrylic keychain.",
    category: "GIFTS", subcategory: "keychain",
    sizes: J([{ name: "Rectangle", cost: 5 }, { name: "Circle", cost: 5 }]),
    costPrice: 5, retailPrice: 12.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 61,
  },
  {
    productKey: "gift_mug_11oz",
    name: "Photo Mug — 11oz",
    description: "Classic ceramic mug with your photo wrapped around it. Dishwasher safe.",
    category: "GIFTS", subcategory: "mug",
    costPrice: 6, retailPrice: 15.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 62,
  },
  {
    productKey: "gift_mug_15oz",
    name: "Photo Mug — 15oz",
    description: "Oversized ceramic mug for those who need more coffee (and more photo).",
    category: "GIFTS", subcategory: "mug",
    costPrice: 7, retailPrice: 18.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 63,
  },
  {
    productKey: "gift_enamel_mug",
    name: "Enamel Mug",
    description: "Vintage-style enamel mug with your photo. Perfect for camping and outdoor lovers.",
    category: "GIFTS", subcategory: "mug",
    costPrice: 8, retailPrice: 18.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 64,
  },
  {
    productKey: "gift_coasters",
    name: "Photo Coasters (Set of 4)",
    description: "Set of 4 hardboard coasters with cork backing. Each features a different photo.",
    category: "GIFTS", subcategory: "coaster",
    costPrice: 10, retailPrice: 22.00, minPhotos: 4,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 65,
  },
  {
    productKey: "gift_ornament_circle",
    name: "Ceramic Ornament — Circle",
    description: "Personalized ceramic ornament with ribbon. Perfect holiday keepsake.",
    category: "GIFTS", subcategory: "ornament",
    costPrice: 5, retailPrice: 12.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 66,
  },
  {
    productKey: "gift_ornament_heart",
    name: "Ceramic Ornament — Heart",
    description: "Heart-shaped ceramic ornament. Show your love on the tree.",
    category: "GIFTS", subcategory: "ornament",
    costPrice: 5, retailPrice: 12.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 67,
  },
  {
    productKey: "gift_ornament_star",
    name: "Ceramic Ornament — Star",
    description: "Star-shaped ceramic ornament for your favorite holiday photo.",
    category: "GIFTS", subcategory: "ornament",
    costPrice: 5, retailPrice: 12.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 68,
  },
  {
    productKey: "gift_puzzle_120",
    name: "Jigsaw Puzzle — 120 pieces",
    description: "Turn your photo into a fun puzzle. 120 pieces — great for kids and families.",
    category: "GIFTS", subcategory: "puzzle",
    costPrice: 12, retailPrice: 25.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 69, isFeatured: true,
  },
  {
    productKey: "gift_puzzle_500",
    name: "Jigsaw Puzzle — 500 pieces",
    description: "Challenging 500-piece puzzle from your favorite photo. Hours of fun.",
    category: "GIFTS", subcategory: "puzzle",
    costPrice: 18, retailPrice: 38.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 70,
  },
  {
    productKey: "gift_mousepad",
    name: "Mouse Pad",
    description: "Custom photo mouse pad with anti-slip rubber base.",
    category: "GIFTS", subcategory: "mousepad",
    sizes: J([{ name: "Standard", cost: 6 }, { name: "Large", cost: 9 }]),
    costPrice: 6, retailPrice: 14.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 71,
  },
  {
    productKey: "gift_phone_case",
    name: "Phone Case",
    description: "Custom phone case with your photo. iPhone and Samsung available.",
    category: "GIFTS", subcategory: "phone-case",
    options: J([
      { name: "Snap Case", costAddon: 0 }, { name: "Tough Case", costAddon: 4 },
    ]),
    costPrice: 10, retailPrice: 22.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 72,
  },
  {
    productKey: "gift_tote",
    name: "Tote Bag",
    description: "Sturdy canvas tote bag with your photo printed on one side.",
    category: "GIFTS", subcategory: "tote",
    costPrice: 8, retailPrice: 18.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 73,
  },
  {
    productKey: "gift_cushion",
    name: "Cushion Cover",
    description: "Soft cushion cover with your photo. Insert not included.",
    category: "GIFTS", subcategory: "cushion",
    sizes: J([{ name: "16×16", cost: 12 }, { name: "18×18", cost: 15 }]),
    costPrice: 12, retailPrice: 28.00,
    labName: "PRODIGI", fulfillmentType: "AUTO", turnaround: "5-7 business days", sortOrder: 74,
  },
  {
    productKey: "gift_blanket",
    name: "Photo Blanket",
    description: "Cozy photo blanket — your favorite memory keeps you warm.",
    category: "GIFTS", subcategory: "blanket",
    sizes: J([{ name: "50×60 Fleece", cost: 28 }, { name: "60×80 Sherpa", cost: 38 }]),
    costPrice: 28, retailPrice: 55.00,
    labName: "PRINTFUL", fulfillmentType: "AUTO", turnaround: "7-10 business days", sortOrder: 75,
  },
  {
    productKey: "gift_card_25",
    name: "Gift Card — €25",
    description: "Let them choose their own products. Gift card never expires.",
    category: "GIFTS", subcategory: "gift-card", isDigital: true,
    costPrice: 0, retailPrice: 25.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 76,
  },
  {
    productKey: "gift_card_50",
    name: "Gift Card — €50",
    description: "Let them choose their own products. Gift card never expires.",
    category: "GIFTS", subcategory: "gift-card", isDigital: true,
    costPrice: 0, retailPrice: 50.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 77,
  },
  {
    productKey: "gift_card_100",
    name: "Gift Card — €100",
    description: "Let them choose their own products. Gift card never expires.",
    category: "GIFTS", subcategory: "gift-card", isDigital: true,
    costPrice: 0, retailPrice: 100.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 78,
  },

  // ═══════════════════════════════════════
  // CATEGORY: OTHERS
  // ═══════════════════════════════════════
  {
    productKey: "other_video_reel",
    name: "Video Reel",
    description: "AI-generated video reel from your best photos with music and transitions.",
    category: "OTHERS", isDigital: true,
    costPrice: 0, retailPrice: 10.00,
    fulfillmentType: "DIGITAL", turnaround: "Instant", sortOrder: 90,
  },
  {
    productKey: "other_retouching",
    name: "Professional Retouching",
    description: "Professional color correction, skin smoothing, and blemish removal per photo.",
    category: "OTHERS",
    costPrice: 3, retailPrice: 12.00,
    fulfillmentType: "MANUAL", turnaround: "2-3 business days", sortOrder: 91,
  },
];

async function main() {
  console.log("Seeding Pixieset-style store...");

  // Deactivate ALL existing products first
  const deactivated = await prisma.shopProduct.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });
  console.log(`Deactivated ${deactivated.count} existing products`);

  // Upsert all products
  let created = 0;
  let updated = 0;
  for (const p of products) {
    const data = {
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory || null,
      sizes: p.sizes || null,
      defaultSize: null,
      options: p.options || null,
      papers: (p as any).papers || null,
      frames: (p as any).frames || null,
      finishes: (p as any).finishes || null,
      costPrice: p.costPrice,
      retailPrice: p.retailPrice,
      fulfillmentType: p.fulfillmentType || "AUTO",
      labName: p.labName || null,
      isActive: !(p as any).comingSoon,
      isFeatured: p.isFeatured || false,
      comingSoon: (p as any).comingSoon || false,
      sortOrder: p.sortOrder,
      turnaround: p.turnaround || null,
      hasRoomPreview: (p as any).hasRoomPreview || false,
      isDigital: (p as any).isDigital || false,
      minPhotos: (p as any).minPhotos || 1,
      mockupUrl: null,
    };

    try {
      await prisma.shopProduct.upsert({
        where: { productKey: p.productKey },
        create: { productKey: p.productKey, ...data },
        update: data,
      });
      created++;
    } catch (e: any) {
      console.error(`  Error: ${p.productKey}: ${e.message}`);
    }
  }

  const total = await prisma.shopProduct.count({ where: { isActive: true } });
  const byCat: Record<string, number> = {};
  const all = await prisma.shopProduct.findMany({ where: { isActive: true }, select: { category: true } });
  all.forEach((p) => { byCat[p.category] = (byCat[p.category] || 0) + 1; });

  console.log(`\nSeeded ${created} products. Active: ${total}`);
  console.log("By category:", JSON.stringify(byCat, null, 2));
  await prisma.$disconnect();
}

main();
