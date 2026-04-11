/**
 * Unified Lab Catalog — product catalogs, pricing, and shipping for all 7 labs.
 *
 * Ported from fotiqo-lab-integrations microservice into the main project.
 * Each lab has: categories, products (with sizes/finishes/options), volume pricing,
 * finish surcharges, and shipping options.
 *
 * Labs: WHCC, Mpix/Miller's, Loxley Colour, ProDPI, Atkins Pro, Prodigi, Printful
 *
 * In mock mode (no API key): returns this static data.
 * In live mode: calls the lab's real API (via the existing fulfillment clients).
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type LabCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type LabProductSize = {
  width: number;
  height: number;
  unit: string;
};

export type LabProduct = {
  id: string;
  labId: string;
  categoryId: string;
  name: string;
  description: string;
  sku: string;
  size?: LabProductSize;
  finishes?: string[];
  wrapOptions?: string[];
  frameOptions?: string[];
  coverOptions?: string[];
  mountOptions?: string[];
  pages?: number;
  includes?: string[];
  basePrice: number;
  currency: string;
  turnaround: string;
  minQty: number;
};

export type LabShippingOption = {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number;
};

export type LabPricingResult = {
  productId: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  currency: string;
  options: Record<string, unknown>;
};

export type LabInfo = {
  id: string;
  name: string;
  fullName: string;
  mode: "mock" | "live";
  currency: string;
  region: string;
  apiAvailable: boolean; // true = self-service API, false = waiting for API key approval
};

type VolumeDiscount = { minQty: number; multiplier: number };
type FinishSurcharge = { finish: string; multiplier: number };

type LabConfig = {
  info: LabInfo;
  volumeDiscounts: VolumeDiscount[];
  finishSurcharges: FinishSurcharge[];
  categories: LabCategory[];
  products: LabProduct[];
  shippingOptions: LabShippingOption[];
};

// ── WHCC (White House Custom Colour) ─────────────────────────────────────────

const WHCC_CATEGORIES: LabCategory[] = [
  { id: "whcc-prints", name: "Prints", description: "Photographic prints on lustre, glossy, metallic, and deep matte paper", icon: "print" },
  { id: "whcc-wall-art", name: "Wall Art", description: "Canvas wraps, metal prints, framed prints, and acrylic blocks", icon: "frame" },
  { id: "whcc-albums", name: "Albums", description: "Flush-mount, layflat, and press-printed photo albums", icon: "book" },
  { id: "whcc-cards", name: "Cards & Stationery", description: "Press-printed folded cards, flat cards, and holiday cards", icon: "mail" },
  { id: "whcc-gifts", name: "Photo Gifts", description: "Ornaments, phone cases, mugs, and image cubes", icon: "gift" },
];

const WHCC_PRODUCTS: LabProduct[] = [
  { id: "whcc-lus-4x6", labId: "whcc", categoryId: "whcc-prints", name: "Lustre Print 4×6", description: "Professional lustre-finish print on Kodak Endura paper. Rich colour, fine grain.", sku: "WHCC-LUS-4X6", size: { width: 4, height: 6, unit: "in" }, finishes: ["Lustre", "Glossy", "Deep Matte"], basePrice: 0.49, currency: "USD", turnaround: "2-3 business days", minQty: 1 },
  { id: "whcc-lus-8x10", labId: "whcc", categoryId: "whcc-prints", name: "Lustre Print 8×10", description: "Professional lustre print, ideal for portraits and events.", sku: "WHCC-LUS-8X10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Lustre", "Glossy", "Deep Matte", "Metallic"], basePrice: 2.80, currency: "USD", turnaround: "2-3 business days", minQty: 1 },
  { id: "whcc-lus-11x14", labId: "whcc", categoryId: "whcc-prints", name: "Lustre Print 11×14", description: "Large-format photographic print with stunning detail.", sku: "WHCC-LUS-11X14", size: { width: 11, height: 14, unit: "in" }, finishes: ["Lustre", "Glossy", "Deep Matte", "Metallic"], basePrice: 5.50, currency: "USD", turnaround: "2-3 business days", minQty: 1 },
  { id: "whcc-met-16x20", labId: "whcc", categoryId: "whcc-prints", name: "Metallic Print 16×20", description: "Pearlescent metallic paper for a vibrant, luminous finish.", sku: "WHCC-MET-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Metallic"], basePrice: 14.00, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "whcc-cnv-16x20", labId: "whcc", categoryId: "whcc-wall-art", name: "Gallery Canvas Wrap 16×20", description: "Museum-quality canvas on 1.5″ stretcher bars with satin coating.", sku: "WHCC-CNV-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Satin", "Gloss"], wrapOptions: ["Gallery (black)", "Gallery (white)", "Mirror", "Image Wrap"], basePrice: 62.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "whcc-mtl-20x30", labId: "whcc", categoryId: "whcc-wall-art", name: "Metal Print 20×30", description: "HD image infused into aluminium with a float-mount hanger.", sku: "WHCC-MTL-20X30", size: { width: 20, height: 30, unit: "in" }, finishes: ["Glossy", "Satin", "Matte"], basePrice: 118.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "whcc-acr-12x12", labId: "whcc", categoryId: "whcc-wall-art", name: "Acrylic Block 12×12", description: "Thick acrylic face-mount with polished edges. Modern, frameless look.", sku: "WHCC-ACR-12X12", size: { width: 12, height: 12, unit: "in" }, finishes: ["Glossy"], basePrice: 89.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "whcc-alb-10x10-flush", labId: "whcc", categoryId: "whcc-albums", name: "Flush Mount Album 10×10 (20 pages)", description: "Premium layflat album with rigid pages, leatherette cover.", sku: "WHCC-ALB-FM-10X10", size: { width: 10, height: 10, unit: "in" }, pages: 20, coverOptions: ["Black Leatherette", "White Leatherette", "Linen Mist", "Linen Charcoal", "Photo Cover"], basePrice: 165.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "whcc-alb-12x12-press", labId: "whcc", categoryId: "whcc-albums", name: "Press Printed Album 12×12 (30 pages)", description: "Affordable press-printed album with layflat binding.", sku: "WHCC-ALB-PP-12X12", size: { width: 12, height: 12, unit: "in" }, pages: 30, coverOptions: ["Photo Cover", "Linen Ivory", "Linen Slate"], basePrice: 89.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "whcc-card-5x7-folded", labId: "whcc", categoryId: "whcc-cards", name: "Folded Card 5×7", description: "Press-printed folded card on premium 130lb stock.", sku: "WHCC-CRD-5X7-F", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matte", "Pearl"], basePrice: 1.20, currency: "USD", turnaround: "3-5 business days", minQty: 25 },
  { id: "whcc-card-5x7-flat", labId: "whcc", categoryId: "whcc-cards", name: "Flat Card 5×7", description: "Single-sided press-printed flat card, great for announcements.", sku: "WHCC-CRD-5X7-FL", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matte", "Pearl", "Linen"], basePrice: 0.85, currency: "USD", turnaround: "3-5 business days", minQty: 25 },
  { id: "whcc-orn-3x3", labId: "whcc", categoryId: "whcc-gifts", name: "Metal Ornament 3×3", description: "Double-sided aluminium ornament with ribbon.", sku: "WHCC-ORN-3X3", size: { width: 3, height: 3, unit: "in" }, finishes: ["Glossy"], basePrice: 12.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
];

const WHCC_SHIPPING: LabShippingOption[] = [
  { id: "whcc-ship-ground", name: "Ground", carrier: "FedEx", estimatedDays: "5-7", price: 8.95 },
  { id: "whcc-ship-express", name: "Express", carrier: "FedEx", estimatedDays: "2-3", price: 18.95 },
  { id: "whcc-ship-overnight", name: "Overnight", carrier: "FedEx", estimatedDays: "1", price: 34.95 },
];

// ── Mpix / Miller's ──────────────────────────────────────────────────────────

const MPIX_CATEGORIES: LabCategory[] = [
  { id: "mpix-prints", name: "Photo Prints", description: "Professional photo prints in multiple sizes and finishes", icon: "print" },
  { id: "mpix-wall-decor", name: "Wall Décor", description: "Canvas, metal, acrylic, and framed prints for display", icon: "frame" },
  { id: "mpix-books", name: "Photo Books", description: "Hardcover and softcover photo books with layflat options", icon: "book" },
  { id: "mpix-cards", name: "Cards", description: "Greeting cards, holiday cards, and invitations", icon: "mail" },
  { id: "mpix-gifts", name: "Gifts & More", description: "Photo gifts including puzzles, calendars, and coasters", icon: "gift" },
];

const MPIX_PRODUCTS: LabProduct[] = [
  { id: "mpix-pr-4x6", labId: "mpix", categoryId: "mpix-prints", name: "Photo Print 4×6", description: "True photographic print on Fuji Crystal Archive paper.", sku: "MPX-PR-4X6", size: { width: 4, height: 6, unit: "in" }, finishes: ["Lustre", "Glossy", "Matte", "Metallic"], basePrice: 0.33, currency: "USD", turnaround: "1-3 business days", minQty: 1 },
  { id: "mpix-pr-5x7", labId: "mpix", categoryId: "mpix-prints", name: "Photo Print 5×7", description: "Classic 5×7 format, perfect for framing or gifting.", sku: "MPX-PR-5X7", size: { width: 5, height: 7, unit: "in" }, finishes: ["Lustre", "Glossy", "Matte", "Metallic"], basePrice: 1.49, currency: "USD", turnaround: "1-3 business days", minQty: 1 },
  { id: "mpix-pr-8x10", labId: "mpix", categoryId: "mpix-prints", name: "Photo Print 8×10", description: "Large print for portraits and events on archival paper.", sku: "MPX-PR-8X10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Lustre", "Glossy", "Matte", "Metallic"], basePrice: 3.49, currency: "USD", turnaround: "1-3 business days", minQty: 1 },
  { id: "mpix-pr-11x14", labId: "mpix", categoryId: "mpix-prints", name: "Photo Print 11×14", description: "Large-format enlargement with stunning clarity.", sku: "MPX-PR-11X14", size: { width: 11, height: 14, unit: "in" }, finishes: ["Lustre", "Glossy", "Matte", "Metallic"], basePrice: 6.99, currency: "USD", turnaround: "2-4 business days", minQty: 1 },
  { id: "mpix-pr-16x24", labId: "mpix", categoryId: "mpix-prints", name: "Photo Print 16×24", description: "Poster-size print on premium photographic paper.", sku: "MPX-PR-16X24", size: { width: 16, height: 24, unit: "in" }, finishes: ["Lustre", "Glossy", "Metallic"], basePrice: 16.99, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "mpix-cnv-16x20", labId: "mpix", categoryId: "mpix-wall-decor", name: "Gallery Wrap Canvas 16×20", description: "Artist-grade canvas on 1.25″ wooden stretcher bars.", sku: "MPX-CNV-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Satin"], wrapOptions: ["Black Edge", "White Edge", "Mirror Wrap", "Image Wrap"], basePrice: 54.99, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "mpix-mtl-16x24", labId: "mpix", categoryId: "mpix-wall-decor", name: "Metal Print 16×24", description: "ChromaLuxe aluminium print with vivid colour and durability.", sku: "MPX-MTL-16X24", size: { width: 16, height: 24, unit: "in" }, finishes: ["High Gloss", "Satin", "Matte"], basePrice: 89.99, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "mpix-frm-11x14", labId: "mpix", categoryId: "mpix-wall-decor", name: "Framed Print 11×14", description: "Print with mat and frame, ready to hang.", sku: "MPX-FRM-11X14", size: { width: 11, height: 14, unit: "in" }, frameOptions: ["Black Wood", "White Wood", "Walnut", "Natural Maple"], basePrice: 49.99, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "mpix-bk-8x8-hard", labId: "mpix", categoryId: "mpix-books", name: "Hardcover Photo Book 8×8 (20 pages)", description: "Premium hardcover with layflat pages and linen spine.", sku: "MPX-BK-8X8-HC", size: { width: 8, height: 8, unit: "in" }, pages: 20, coverOptions: ["Photo Cover", "Linen Black", "Linen White", "Linen Navy"], basePrice: 39.99, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "mpix-bk-10x10-layflat", labId: "mpix", categoryId: "mpix-books", name: "Layflat Photo Book 10×10 (30 pages)", description: "Seamless spreads with layflat binding — no gutter loss.", sku: "MPX-BK-10X10-LF", size: { width: 10, height: 10, unit: "in" }, pages: 30, coverOptions: ["Photo Cover", "Leather Black", "Leather Brown"], basePrice: 69.99, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "mpix-crd-5x7-flat", labId: "mpix", categoryId: "mpix-cards", name: "Flat Photo Card 5×7 (set of 25)", description: "Press-printed flat cards on premium cardstock.", sku: "MPX-CRD-5X7-FL", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matte", "Pearl"], basePrice: 22.49, currency: "USD", turnaround: "3-5 business days", minQty: 25 },
  { id: "mpix-puz-11x14", labId: "mpix", categoryId: "mpix-gifts", name: "Photo Puzzle 11×14 (252 pieces)", description: "Custom photo puzzle in a keepsake tin.", sku: "MPX-PUZ-11X14", size: { width: 11, height: 14, unit: "in" }, basePrice: 29.99, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
];

const MPIX_SHIPPING: LabShippingOption[] = [
  { id: "mpix-ship-standard", name: "Standard", carrier: "USPS", estimatedDays: "5-8", price: 6.49 },
  { id: "mpix-ship-priority", name: "Priority", carrier: "USPS", estimatedDays: "2-4", price: 12.99 },
  { id: "mpix-ship-express", name: "Express", carrier: "FedEx", estimatedDays: "1-2", price: 24.99 },
];

// ── Loxley Colour (UK) ──────────────────────────────────────────────────────

const LOXLEY_CATEGORIES: LabCategory[] = [
  { id: "lox-prints", name: "Photographic Prints", description: "Professional prints on Fuji and Kodak papers", icon: "print" },
  { id: "lox-fine-art", name: "Fine Art Prints", description: "Giclée prints on Hahnemühle and cotton-rag papers", icon: "brush" },
  { id: "lox-wall", name: "Wall Products", description: "Acrylic face-mount, aluminium, canvas, and framed prints", icon: "frame" },
  { id: "lox-albums", name: "Albums & Books", description: "Bellissimo albums, storybooks, and portfolio boxes", icon: "book" },
  { id: "lox-gifts", name: "Photo Gifts", description: "Coasters, magnets, baubles, and keyrings", icon: "gift" },
];

const LOXLEY_PRODUCTS: LabProduct[] = [
  { id: "lox-pr-6x4", labId: "loxley", categoryId: "lox-prints", name: "Photo Print 6×4″", description: "Standard professional print on Fuji Crystal Archive lustre paper.", sku: "LOX-PR-6X4", size: { width: 6, height: 4, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt"], basePrice: 0.35, currency: "GBP", turnaround: "2-3 business days", minQty: 1 },
  { id: "lox-pr-10x8", labId: "loxley", categoryId: "lox-prints", name: "Photo Print 10×8″", description: "Large-format professional print, ideal for wall display.", sku: "LOX-PR-10X8", size: { width: 10, height: 8, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt", "Metallic"], basePrice: 2.10, currency: "GBP", turnaround: "2-3 business days", minQty: 1 },
  { id: "lox-pr-12x8", labId: "loxley", categoryId: "lox-prints", name: "Photo Print 12×8″", description: "Popular panoramic-style format on Kodak Endura Metallic.", sku: "LOX-PR-12X8", size: { width: 12, height: 8, unit: "in" }, finishes: ["Lustre", "Gloss", "Metallic"], basePrice: 2.85, currency: "GBP", turnaround: "2-3 business days", minQty: 1 },
  { id: "lox-fa-a3", labId: "loxley", categoryId: "lox-fine-art", name: "Fine Art Giclée A3", description: "Archival giclée print on Hahnemühle Photo Rag 308gsm.", sku: "LOX-FA-A3", size: { width: 11.7, height: 16.5, unit: "in" }, finishes: ["Smooth Matt"], basePrice: 18.50, currency: "GBP", turnaround: "3-5 business days", minQty: 1 },
  { id: "lox-fa-a2", labId: "loxley", categoryId: "lox-fine-art", name: "Fine Art Giclée A2", description: "Large-format archival giclée on cotton-rag paper.", sku: "LOX-FA-A2", size: { width: 16.5, height: 23.4, unit: "in" }, finishes: ["Smooth Matt", "Textured"], basePrice: 32.00, currency: "GBP", turnaround: "3-5 business days", minQty: 1 },
  { id: "lox-acr-20x16", labId: "loxley", categoryId: "lox-wall", name: "Acrylic Face-Mount 20×16″", description: "Image bonded behind 5mm acrylic with aluminium sub-frame.", sku: "LOX-ACR-20X16", size: { width: 20, height: 16, unit: "in" }, finishes: ["Glossy"], basePrice: 78.00, currency: "GBP", turnaround: "7-10 business days", minQty: 1 },
  { id: "lox-alu-24x16", labId: "loxley", categoryId: "lox-wall", name: "Aluminium Print 24×16″", description: "Dye-sublimation print on brushed aluminium panel.", sku: "LOX-ALU-24X16", size: { width: 24, height: 16, unit: "in" }, finishes: ["Gloss", "Brushed"], basePrice: 65.00, currency: "GBP", turnaround: "5-7 business days", minQty: 1 },
  { id: "lox-cnv-20x16", labId: "loxley", categoryId: "lox-wall", name: "Canvas Wrap 20×16″", description: "Premium canvas on 38mm kiln-dried wooden stretcher bars.", sku: "LOX-CNV-20X16", size: { width: 20, height: 16, unit: "in" }, finishes: ["Satin"], wrapOptions: ["White Edge", "Black Edge", "Mirror Wrap", "Image Wrap"], basePrice: 42.00, currency: "GBP", turnaround: "5-7 business days", minQty: 1 },
  { id: "lox-bel-12x12", labId: "loxley", categoryId: "lox-albums", name: "Bellissimo Album 12×12″ (20 spreads)", description: "Handcrafted flush-mount album with photographic pages and luxury cover.", sku: "LOX-BEL-12X12", size: { width: 12, height: 12, unit: "in" }, pages: 40, coverOptions: ["Black Leather", "Ivory Leather", "Photo Window", "Linen Oatmeal"], basePrice: 145.00, currency: "GBP", turnaround: "10-14 business days", minQty: 1 },
  { id: "lox-story-10x10", labId: "loxley", categoryId: "lox-albums", name: "Storybook 10×10″ (30 pages)", description: "Press-printed layflat storybook with hardcover.", sku: "LOX-STR-10X10", size: { width: 10, height: 10, unit: "in" }, pages: 30, coverOptions: ["Photo Cover", "Linen Grey", "Linen Black"], basePrice: 55.00, currency: "GBP", turnaround: "5-7 business days", minQty: 1 },
  { id: "lox-cstr-set4", labId: "loxley", categoryId: "lox-gifts", name: "Photo Coaster Set (4 pack)", description: "Hardboard coasters with gloss photographic finish.", sku: "LOX-CSTR-4PK", size: { width: 4, height: 4, unit: "in" }, basePrice: 14.00, currency: "GBP", turnaround: "3-5 business days", minQty: 1 },
];

const LOXLEY_SHIPPING: LabShippingOption[] = [
  { id: "lox-ship-standard", name: "Standard", carrier: "Royal Mail", estimatedDays: "3-5", price: 5.95 },
  { id: "lox-ship-tracked", name: "Tracked 24", carrier: "Royal Mail", estimatedDays: "1-2", price: 9.95 },
  { id: "lox-ship-courier", name: "DPD Next Day", carrier: "DPD", estimatedDays: "1", price: 14.95 },
  { id: "lox-ship-intl", name: "International", carrier: "DHL", estimatedDays: "5-10", price: 24.95 },
];

// ── ProDPI (Premium US) ──────────────────────────────────────────────────────

const PRODPI_CATEGORIES: LabCategory[] = [
  { id: "pdpi-prints", name: "Prints", description: "Silver-halide and giclée prints in sizes up to 40×60", icon: "print" },
  { id: "pdpi-metals", name: "Metal Prints", description: "Dye-sublimation on aluminium with multiple mounting options", icon: "frame" },
  { id: "pdpi-acrylics", name: "Acrylic Prints", description: "Face-mounted and reverse-mounted acrylic displays", icon: "diamond" },
  { id: "pdpi-canvas", name: "Canvas", description: "Gallery and museum canvas wraps on premium stretcher bars", icon: "image" },
  { id: "pdpi-albums", name: "Albums", description: "Handcrafted flush-mount albums with premium covers", icon: "book" },
  { id: "pdpi-folio", name: "Folio & Boxes", description: "Image boxes, folios, and presentation products", icon: "box" },
];

const PRODPI_PRODUCTS: LabProduct[] = [
  { id: "pdpi-pr-8x10", labId: "prodpi", categoryId: "pdpi-prints", name: "Silver Halide Print 8×10", description: "True silver-halide print on Kodak Endura Lustre. Archival 100+ years.", sku: "PDPI-SH-8X10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Lustre", "Glossy", "Metallic", "Deep Matte"], basePrice: 4.50, currency: "USD", turnaround: "2-4 business days", minQty: 1 },
  { id: "pdpi-pr-16x20", labId: "prodpi", categoryId: "pdpi-prints", name: "Silver Halide Print 16×20", description: "Gallery-grade enlargement on premium photographic paper.", sku: "PDPI-SH-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Lustre", "Glossy", "Metallic", "Deep Matte"], basePrice: 18.00, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "pdpi-pr-24x36", labId: "prodpi", categoryId: "pdpi-prints", name: "Giclée Print 24×36", description: "Archival giclée on Hahnemühle Photo Rag Baryta.", sku: "PDPI-GI-24X36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Baryta", "Smooth Matt"], basePrice: 58.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "pdpi-mtl-11x14", labId: "prodpi", categoryId: "pdpi-metals", name: "Metal Print 11×14", description: "ChromaLuxe HD aluminium with float-mount hanger.", sku: "PDPI-MTL-11X14", size: { width: 11, height: 14, unit: "in" }, finishes: ["High Gloss", "Satin", "Matte"], mountOptions: ["Float Mount", "Easel Back", "No Mount"], basePrice: 48.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "pdpi-mtl-24x36", labId: "prodpi", categoryId: "pdpi-metals", name: "Metal Print 24×36", description: "Large-format ChromaLuxe with stunning vibrancy.", sku: "PDPI-MTL-24X36", size: { width: 24, height: 36, unit: "in" }, finishes: ["High Gloss", "Satin"], mountOptions: ["Float Mount", "French Cleat"], basePrice: 168.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "pdpi-acr-16x20", labId: "prodpi", categoryId: "pdpi-acrylics", name: "Acrylic Face-Mount 16×20", description: "Image face-mounted to ¼″ optically clear acrylic with polished edges.", sku: "PDPI-ACR-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Glossy"], mountOptions: ["Aluminium Sub-Frame", "French Cleat", "Standoffs"], basePrice: 125.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "pdpi-cnv-20x30", labId: "prodpi", categoryId: "pdpi-canvas", name: "Museum Canvas Wrap 20×30", description: "Fine-art canvas on 2″ museum-depth stretcher bars.", sku: "PDPI-CNV-20X30", size: { width: 20, height: 30, unit: "in" }, finishes: ["Satin", "Gloss"], wrapOptions: ["Gallery Black", "Gallery White", "Mirror", "Image Wrap"], basePrice: 95.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "pdpi-alb-10x10", labId: "prodpi", categoryId: "pdpi-albums", name: "Artisan Album 10×10 (20 spreads)", description: "Handcrafted flush-mount album with genuine leather cover.", sku: "PDPI-ALB-10X10", size: { width: 10, height: 10, unit: "in" }, pages: 40, coverOptions: ["Black Italian Leather", "Brown Italian Leather", "Ivory Silk", "Photo Cover"], basePrice: 285.00, currency: "USD", turnaround: "14-21 business days", minQty: 1 },
  { id: "pdpi-alb-12x12", labId: "prodpi", categoryId: "pdpi-albums", name: "Artisan Album 12×12 (30 spreads)", description: "Large flush-mount album for wedding or portrait collections.", sku: "PDPI-ALB-12X12", size: { width: 12, height: 12, unit: "in" }, pages: 60, coverOptions: ["Black Italian Leather", "Cognac Leather", "Linen Natural", "Photo Cover"], basePrice: 395.00, currency: "USD", turnaround: "14-21 business days", minQty: 1 },
  { id: "pdpi-folio-8x10", labId: "prodpi", categoryId: "pdpi-folio", name: "Image Box 8×10 (10 matted prints)", description: "Linen presentation box with 10 matted lustre prints.", sku: "PDPI-FLO-8X10", size: { width: 8, height: 10, unit: "in" }, coverOptions: ["Linen Ivory", "Linen Charcoal", "Leather Black"], basePrice: 145.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
];

const PRODPI_SHIPPING: LabShippingOption[] = [
  { id: "pdpi-ship-ground", name: "Ground", carrier: "UPS", estimatedDays: "5-7", price: 9.95 },
  { id: "pdpi-ship-2day", name: "2-Day", carrier: "UPS", estimatedDays: "2", price: 22.95 },
  { id: "pdpi-ship-overnight", name: "Overnight", carrier: "UPS", estimatedDays: "1", price: 39.95 },
];

// ── Atkins Pro (Australia) — 35 products, 8 categories, full specs ───────────

const ATKINS_CATEGORIES: LabCategory[] = [
  { id: "atk-prints", name: "Photographic Prints", description: "Professional prints on Fuji Crystal Archive and fine art papers", icon: "print" },
  { id: "atk-fine-art", name: "Fine Art Prints", description: "Giclée prints on museum-grade cotton rag and baryta papers", icon: "palette" },
  { id: "atk-wall-art", name: "Wall Art", description: "Canvas wraps, aluminium, acrylic, and float-frame prints", icon: "frame" },
  { id: "atk-frames", name: "Framed Prints", description: "Ready-to-hang framed prints with mat board and glass options", icon: "square" },
  { id: "atk-albums", name: "Albums & Books", description: "Layflat flush-mount albums, press books, and proof magazines", icon: "book" },
  { id: "atk-gifts", name: "Photo Gifts", description: "Magnets, keyrings, stubby holders, mouse pads, and calendars", icon: "gift" },
  { id: "atk-school", name: "School & Sports", description: "Packages, team composites, class photos, and ID cards", icon: "users" },
  { id: "atk-cards", name: "Cards & Stationery", description: "Greeting cards, folded cards, thank-you cards, and invitations", icon: "mail" },
];

const ATKINS_PRODUCTS: LabProduct[] = [
  // ── Photographic Prints (8)
  { id: "atk-pr-6x4", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 6×4″", description: "Professional print on Fuji Crystal Archive Supreme paper. Industry-standard C-type printing.", sku: "ATK-PR-6X4", size: { width: 6, height: 4, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt", "Metallic"], basePrice: 0.55, currency: "AUD", turnaround: "2-3 business days", minQty: 1 },
  { id: "atk-pr-5x7", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 5×7″", description: "Classic 5×7 on Fuji Crystal Archive. Perfect for wallets, gifts, and portrait packages.", sku: "ATK-PR-5X7", size: { width: 5, height: 7, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt", "Metallic"], basePrice: 1.60, currency: "AUD", turnaround: "2-3 business days", minQty: 1 },
  { id: "atk-pr-8x10", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 8×10″", description: "Traditional 8×10 enlargement on premium photo paper.", sku: "ATK-PR-8X10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt", "Metallic"], basePrice: 2.85, currency: "AUD", turnaround: "2-3 business days", minQty: 1 },
  { id: "atk-pr-8x12", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 8×12″", description: "Popular enlargement size for portraits, events, and weddings.", sku: "ATK-PR-8X12", size: { width: 8, height: 12, unit: "in" }, finishes: ["Lustre", "Gloss", "Matt", "Metallic"], basePrice: 3.20, currency: "AUD", turnaround: "2-3 business days", minQty: 1 },
  { id: "atk-pr-12x18", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 12×18″", description: "Large-format print with exceptional detail and colour depth.", sku: "ATK-PR-12X18", size: { width: 12, height: 18, unit: "in" }, finishes: ["Lustre", "Gloss", "Metallic"], basePrice: 8.90, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-pr-16x24", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 16×24″", description: "Exhibition-quality large print on Fuji Crystal Archive.", sku: "ATK-PR-16X24", size: { width: 16, height: 24, unit: "in" }, finishes: ["Lustre", "Gloss", "Metallic"], basePrice: 18.50, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-pr-20x30", labId: "atkins", categoryId: "atk-prints", name: "Photo Print 20×30″", description: "Poster-size photographic print on archival paper.", sku: "ATK-PR-20X30", size: { width: 20, height: 30, unit: "in" }, finishes: ["Lustre", "Gloss", "Metallic"], basePrice: 28.00, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-pr-pano-6x18", labId: "atkins", categoryId: "atk-prints", name: "Panoramic Print 6×18″", description: "Wide-format panoramic print on Fuji Crystal Archive.", sku: "ATK-PR-PANO-6X18", size: { width: 6, height: 18, unit: "in" }, finishes: ["Lustre", "Gloss"], basePrice: 12.00, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  // ── Fine Art Prints (4)
  { id: "atk-fa-rag-a4", labId: "atkins", categoryId: "atk-fine-art", name: "Fine Art Cotton Rag A4", description: "Giclée print on Hahnemühle Photo Rag 308gsm. Museum-grade 100% cotton.", sku: "ATK-FA-RAG-A4", size: { width: 8.3, height: 11.7, unit: "in" }, finishes: ["Matt (natural texture)"], basePrice: 22.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-fa-rag-a3", labId: "atkins", categoryId: "atk-fine-art", name: "Fine Art Cotton Rag A3", description: "Giclée print on Hahnemühle Photo Rag 308gsm. Ideal for gallery exhibitions.", sku: "ATK-FA-RAG-A3", size: { width: 11.7, height: 16.5, unit: "in" }, finishes: ["Matt (natural texture)"], basePrice: 38.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-fa-baryta-a3", labId: "atkins", categoryId: "atk-fine-art", name: "Fine Art Baryta A3", description: "Giclée print on Hahnemühle FineArt Baryta 325gsm. Smooth, high-gloss fibre-based feel.", sku: "ATK-FA-BAR-A3", size: { width: 11.7, height: 16.5, unit: "in" }, finishes: ["High Gloss (baryta)"], basePrice: 45.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-fa-rag-a2", labId: "atkins", categoryId: "atk-fine-art", name: "Fine Art Cotton Rag A2", description: "Large format giclée on Hahnemühle Photo Rag. Statement gallery piece.", sku: "ATK-FA-RAG-A2", size: { width: 16.5, height: 23.4, unit: "in" }, finishes: ["Matt (natural texture)"], basePrice: 65.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  // ── Wall Art (7)
  { id: "atk-cnv-12x12", labId: "atkins", categoryId: "atk-wall-art", name: "Canvas Wrap 12×12″", description: "Square canvas on 38mm kiln-dried stretcher bars with UV-resistant coating.", sku: "ATK-CNV-12X12", size: { width: 12, height: 12, unit: "in" }, finishes: ["Satin"], wrapOptions: ["White Edge", "Black Edge", "Mirror Wrap", "Image Wrap"], basePrice: 49.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-cnv-16x24", labId: "atkins", categoryId: "atk-wall-art", name: "Canvas Wrap 16×24″", description: "Premium canvas on 38mm kiln-dried stretcher bars. UV protective coating.", sku: "ATK-CNV-16X24", size: { width: 16, height: 24, unit: "in" }, finishes: ["Satin"], wrapOptions: ["White Edge", "Black Edge", "Mirror Wrap", "Image Wrap"], basePrice: 69.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-cnv-24x36", labId: "atkins", categoryId: "atk-wall-art", name: "Canvas Wrap 24×36″", description: "Large canvas wrap with gallery-quality stretch and mounting hardware.", sku: "ATK-CNV-24X36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Satin"], wrapOptions: ["White Edge", "Black Edge", "Mirror Wrap", "Image Wrap"], basePrice: 119.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-alu-12x18", labId: "atkins", categoryId: "atk-wall-art", name: "Aluminium Print 12×18″", description: "Dye-sublimation on 1.2mm brushed aluminium with float-mount bracket.", sku: "ATK-ALU-12X18", size: { width: 12, height: 18, unit: "in" }, finishes: ["Gloss", "Brushed Satin"], basePrice: 79.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-alu-20x30", labId: "atkins", categoryId: "atk-wall-art", name: "Aluminium Print 20×30″", description: "Dye-sublimation on brushed aluminium with float-mount. Vibrant metallic finish.", sku: "ATK-ALU-20X30", size: { width: 20, height: 30, unit: "in" }, finishes: ["Gloss", "Brushed Satin"], basePrice: 115.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-acr-16x20", labId: "atkins", categoryId: "atk-wall-art", name: "Acrylic Print 16×20″", description: "Image face-mounted behind 6mm optically clear acrylic with polished edges.", sku: "ATK-ACR-16X20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Glossy"], basePrice: 99.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  { id: "atk-acr-24x36", labId: "atkins", categoryId: "atk-wall-art", name: "Acrylic Print 24×36″", description: "Large format face-mounted acrylic. Stunning depth and vibrancy.", sku: "ATK-ACR-24X36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Glossy"], basePrice: 189.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  // ── Framed Prints (3)
  { id: "atk-frm-8x10-bk", labId: "atkins", categoryId: "atk-frames", name: "Framed Print 8×10″ — Black Gallery", description: "Print in black timber gallery frame with white mat board and glass.", sku: "ATK-FRM-8X10-BK", size: { width: 8, height: 10, unit: "in" }, frameOptions: ["Black"], basePrice: 59.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  { id: "atk-frm-12x18-wh", labId: "atkins", categoryId: "atk-frames", name: "Framed Print 12×18″ — White Gallery", description: "Archival print in white timber gallery frame with white mat and glass.", sku: "ATK-FRM-12X18-WH", size: { width: 12, height: 18, unit: "in" }, frameOptions: ["White"], basePrice: 89.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  { id: "atk-frm-16x24-nat", labId: "atkins", categoryId: "atk-frames", name: "Framed Print 16×24″ — Natural Timber", description: "Print in natural Tasmanian oak frame with white mat.", sku: "ATK-FRM-16X24-NAT", size: { width: 16, height: 24, unit: "in" }, frameOptions: ["Natural Timber"], basePrice: 129.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  // ── Albums & Books (4)
  { id: "atk-alb-10x10", labId: "atkins", categoryId: "atk-albums", name: "Layflat Album 10×10″ (20 spreads)", description: "Flush-mount layflat album with photographic pages on rigid board.", sku: "ATK-ALB-10X10", size: { width: 10, height: 10, unit: "in" }, pages: 40, coverOptions: ["Black Leatherette", "White Leatherette", "Photo Cover", "Linen Oatmeal", "Linen Charcoal"], basePrice: 189.00, currency: "AUD", turnaround: "10-14 business days", minQty: 1 },
  { id: "atk-alb-12x12", labId: "atkins", categoryId: "atk-albums", name: "Layflat Album 12×12″ (30 spreads)", description: "Premium large layflat album with photographic pages. Ideal for weddings.", sku: "ATK-ALB-12X12", size: { width: 12, height: 12, unit: "in" }, pages: 60, coverOptions: ["Black Leatherette", "White Leatherette", "Photo Cover", "Linen Oatmeal", "Linen Charcoal", "Velvet Blush"], basePrice: 289.00, currency: "AUD", turnaround: "10-14 business days", minQty: 1 },
  { id: "atk-pb-8x8", labId: "atkins", categoryId: "atk-albums", name: "Press Book 8×8″ (20 pages)", description: "Affordable press-printed book with layflat binding. Great for proofs and gifts.", sku: "ATK-PB-8X8", size: { width: 8, height: 8, unit: "in" }, pages: 20, coverOptions: ["Photo Cover", "Linen Grey"], basePrice: 45.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-proof-mag", labId: "atkins", categoryId: "atk-albums", name: "Proof Magazine A5 (24 pages)", description: "Saddle-stitched proof magazine. Lightweight and perfect for proofing sessions.", sku: "ATK-PROOF-A5", size: { width: 5.8, height: 8.3, unit: "in" }, pages: 24, basePrice: 18.00, currency: "AUD", turnaround: "3-5 business days", minQty: 5 },
  // ── Photo Gifts (5)
  { id: "atk-mag-set6", labId: "atkins", categoryId: "atk-gifts", name: "Photo Magnets (set of 6)", description: "Custom photo magnets with gloss finish, 50×75mm each.", sku: "ATK-MAG-6PK", size: { width: 2, height: 3, unit: "in" }, basePrice: 16.00, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-key", labId: "atkins", categoryId: "atk-gifts", name: "Photo Keyring", description: "Acrylic photo keyring with custom image. Clear-coated for durability.", sku: "ATK-KEY", size: { width: 1.5, height: 2, unit: "in" }, basePrice: 8.50, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-stubby", labId: "atkins", categoryId: "atk-gifts", name: "Stubby Holder", description: "Neoprene stubby holder with full-colour photo wrap. Aussie essential.", sku: "ATK-STUBBY", basePrice: 12.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-mousepad", labId: "atkins", categoryId: "atk-gifts", name: "Photo Mouse Pad", description: "Full-colour printed mouse pad with non-slip rubber base.", sku: "ATK-MPAD", size: { width: 9.3, height: 7.7, unit: "in" }, basePrice: 14.00, currency: "AUD", turnaround: "3-5 business days", minQty: 1 },
  { id: "atk-calendar", labId: "atkins", categoryId: "atk-gifts", name: "Wall Calendar A3 (12 months)", description: "12-month wall calendar with custom images per month on 200gsm silk stock.", sku: "ATK-CAL-A3", size: { width: 11.7, height: 16.5, unit: "in" }, basePrice: 28.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  // ── School & Sports (4)
  { id: "atk-sch-pkg-a", labId: "atkins", categoryId: "atk-school", name: "School Package A", description: "1× 8×12, 2× 5×7, 4× wallet-size prints.", sku: "ATK-SCH-PKG-A", includes: ["1× 8×12″", "2× 5×7″", "4× wallet-size"], basePrice: 32.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-sch-pkg-b", labId: "atkins", categoryId: "atk-school", name: "School Package B — Premium", description: "1× 12×18, 2× 8×10, 4× 5×7, 8× wallet-size. Premium photo package.", sku: "ATK-SCH-PKG-B", includes: ["1× 12×18″", "2× 8×10″", "4× 5×7″", "8× wallet-size"], basePrice: 55.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  { id: "atk-sch-composite", labId: "atkins", categoryId: "atk-school", name: "Team Composite 16×24″", description: "Custom team composite with individual headshots and team photo.", sku: "ATK-SCH-COMP-16X24", size: { width: 16, height: 24, unit: "in" }, basePrice: 55.00, currency: "AUD", turnaround: "7-10 business days", minQty: 1 },
  { id: "atk-sch-id", labId: "atkins", categoryId: "atk-school", name: "Student ID Card (sheet of 8)", description: "Sheet of 8 PVC-coated student ID cards with photo and text.", sku: "ATK-SCH-ID-8", size: { width: 3.4, height: 2.1, unit: "in" }, basePrice: 22.00, currency: "AUD", turnaround: "5-7 business days", minQty: 1 },
  // ── Cards & Stationery (2)
  { id: "atk-card-flat-5x7", labId: "atkins", categoryId: "atk-cards", name: "Flat Card 5×7″", description: "Single-sided flat card on 350gsm matte stock. Great for thank-yous.", sku: "ATK-CRD-FLAT-5X7", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matt", "Gloss Laminate"], basePrice: 1.80, currency: "AUD", turnaround: "3-5 business days", minQty: 25 },
  { id: "atk-card-fold-5x7", labId: "atkins", categoryId: "atk-cards", name: "Folded Card 5×7″ (with envelope)", description: "Folded greeting card with white envelope. Printed on 350gsm stock.", sku: "ATK-CRD-FOLD-5X7", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matt", "Gloss Laminate"], basePrice: 2.50, currency: "AUD", turnaround: "3-5 business days", minQty: 25 },
];

const ATKINS_SHIPPING: LabShippingOption[] = [
  { id: "atk-ship-standard", name: "Standard", carrier: "Australia Post", estimatedDays: "3-5", price: 9.95 },
  { id: "atk-ship-express", name: "Express", carrier: "Australia Post Express", estimatedDays: "1-2", price: 16.95 },
  { id: "atk-ship-nz", name: "New Zealand", carrier: "Australia Post International", estimatedDays: "5-10", price: 24.95 },
  { id: "atk-ship-intl", name: "International", carrier: "DHL Express", estimatedDays: "7-14", price: 39.95 },
];

// ── Prodigi (Global) ─────────────────────────────────────────────────────────

const PRODIGI_CATEGORIES: LabCategory[] = [
  { id: "prodigi-fine-art", name: "Fine Art Prints", description: "Giclée fine art prints on premium archival paper", icon: "brush" },
  { id: "prodigi-photo-prints", name: "Photo Prints", description: "Lustre, gloss, and metallic photo prints", icon: "print" },
  { id: "prodigi-canvas", name: "Canvas", description: "Gallery-wrapped canvas prints on wooden stretcher bars", icon: "image" },
  { id: "prodigi-framed", name: "Framed Prints", description: "Prints with frame and mount, ready to hang", icon: "frame" },
  { id: "prodigi-metal", name: "Metal Prints", description: "HD metal prints on aluminium panels", icon: "diamond" },
  { id: "prodigi-acrylic", name: "Acrylic Prints", description: "Images printed behind crystal-clear acrylic", icon: "diamond" },
  { id: "prodigi-homeware", name: "Homeware", description: "Cushions, mugs, coasters, and more", icon: "gift" },
  { id: "prodigi-cards", name: "Cards & Stationery", description: "Greeting cards, postcards, and invitations", icon: "mail" },
];

const PRODIGI_PRODUCTS: LabProduct[] = [
  { id: "prodigi-fap-8x10", labId: "prodigi", categoryId: "prodigi-fine-art", name: "Fine Art Print 8×10″", description: "Giclée print on Hahnemühle archival fine art paper, 310gsm.", sku: "GLOBAL-FAP-8x10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Matte"], basePrice: 6.80, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-fap-12x16", labId: "prodigi", categoryId: "prodigi-fine-art", name: "Fine Art Print 12×16″", description: "Archival giclée print, museum-quality fine art paper.", sku: "GLOBAL-FAP-12x16", size: { width: 12, height: 16, unit: "in" }, finishes: ["Matte"], basePrice: 11.50, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-fap-16x24", labId: "prodigi", categoryId: "prodigi-fine-art", name: "Fine Art Print 16×24″", description: "Large-format giclée on premium fine art stock.", sku: "GLOBAL-FAP-16x24", size: { width: 16, height: 24, unit: "in" }, finishes: ["Matte"], basePrice: 18.20, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-fap-24x36", labId: "prodigi", categoryId: "prodigi-fine-art", name: "Fine Art Print 24×36″", description: "Extra-large archival giclée print for gallery display.", sku: "GLOBAL-FAP-24x36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Matte"], basePrice: 32.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "prodigi-php-6x4", labId: "prodigi", categoryId: "prodigi-photo-prints", name: "Photo Print 6×4″", description: "Standard photo print on lustre-finish photographic paper.", sku: "GLOBAL-PHP-6x4", size: { width: 6, height: 4, unit: "in" }, finishes: ["Lustre", "Gloss"], basePrice: 1.50, currency: "USD", turnaround: "2-4 business days", minQty: 1 },
  { id: "prodigi-php-8x10", labId: "prodigi", categoryId: "prodigi-photo-prints", name: "Photo Print 8×10″", description: "Professional photo print on premium photographic paper.", sku: "GLOBAL-PHP-8x10", size: { width: 8, height: 10, unit: "in" }, finishes: ["Lustre", "Gloss", "Metallic"], basePrice: 3.90, currency: "USD", turnaround: "2-4 business days", minQty: 1 },
  { id: "prodigi-php-12x18", labId: "prodigi", categoryId: "prodigi-photo-prints", name: "Photo Print 12×18″", description: "Large photo print, ideal for wall display.", sku: "GLOBAL-PHP-12x18", size: { width: 12, height: 18, unit: "in" }, finishes: ["Lustre", "Gloss"], basePrice: 7.50, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-cnv-12x12", labId: "prodigi", categoryId: "prodigi-canvas", name: "Canvas Wrap 12×12″", description: "Gallery-wrapped canvas on 1.5″ kiln-dried pine stretcher bars.", sku: "GLOBAL-CNV-12x12", size: { width: 12, height: 12, unit: "in" }, finishes: ["Satin"], wrapOptions: ["Gallery (white)", "Gallery (black)", "Mirror Wrap", "Image Wrap"], basePrice: 19.90, currency: "USD", turnaround: "4-6 business days", minQty: 1 },
  { id: "prodigi-cnv-16x20", labId: "prodigi", categoryId: "prodigi-canvas", name: "Canvas Wrap 16×20″", description: "Premium canvas print with satin UV-protective coating.", sku: "GLOBAL-CNV-16x20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Satin"], wrapOptions: ["Gallery (white)", "Gallery (black)", "Mirror Wrap", "Image Wrap"], basePrice: 28.50, currency: "USD", turnaround: "4-6 business days", minQty: 1 },
  { id: "prodigi-cnv-24x36", labId: "prodigi", categoryId: "prodigi-canvas", name: "Canvas Wrap 24×36″", description: "Extra-large gallery canvas, perfect for statement pieces.", sku: "GLOBAL-CNV-24x36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Satin"], wrapOptions: ["Gallery (white)", "Gallery (black)", "Mirror Wrap", "Image Wrap"], basePrice: 52.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "prodigi-frm-8x10", labId: "prodigi", categoryId: "prodigi-framed", name: "Framed Print 8×10″", description: "Print with mount in sleek wooden frame, ready to hang.", sku: "GLOBAL-FRM-8x10", size: { width: 8, height: 10, unit: "in" }, frameOptions: ["Black", "White", "Natural Wood"], basePrice: 24.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "prodigi-frm-16x20", labId: "prodigi", categoryId: "prodigi-framed", name: "Framed Print 16×20″", description: "Large framed print with archival mount and glass.", sku: "GLOBAL-FRM-16x20", size: { width: 16, height: 20, unit: "in" }, frameOptions: ["Black", "White", "Natural Wood"], basePrice: 42.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "prodigi-mtl-12x12", labId: "prodigi", categoryId: "prodigi-metal", name: "Metal Print 12×12″", description: "Dye-sublimation print on brushed aluminium with float mount.", sku: "GLOBAL-MTL-12x12", size: { width: 12, height: 12, unit: "in" }, finishes: ["Glossy", "Satin"], basePrice: 35.00, currency: "USD", turnaround: "5-7 business days", minQty: 1 },
  { id: "prodigi-mtl-20x30", labId: "prodigi", categoryId: "prodigi-metal", name: "Metal Print 20×30″", description: "Large metal print with stunning vibrancy and durability.", sku: "GLOBAL-MTL-20x30", size: { width: 20, height: 30, unit: "in" }, finishes: ["Glossy", "Satin"], basePrice: 78.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "prodigi-acr-12x16", labId: "prodigi", categoryId: "prodigi-acrylic", name: "Acrylic Print 12×16″", description: "Image printed behind 5mm crystal-clear acrylic, polished edges.", sku: "GLOBAL-ACR-12x16", size: { width: 12, height: 16, unit: "in" }, finishes: ["Glossy"], basePrice: 45.00, currency: "USD", turnaround: "7-10 business days", minQty: 1 },
  { id: "prodigi-mug-11oz", labId: "prodigi", categoryId: "prodigi-homeware", name: "Photo Mug 11oz", description: "White ceramic mug with full-wrap photo print.", sku: "GLOBAL-MUG-11oz", size: { width: 3.8, height: 3.2, unit: "in" }, basePrice: 7.50, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-cush-18x18", labId: "prodigi", categoryId: "prodigi-homeware", name: "Photo Cushion 18×18″", description: "Faux-suede cushion cover with vibrant dye-sublimation print.", sku: "GLOBAL-CSH-18x18", size: { width: 18, height: 18, unit: "in" }, basePrice: 14.90, currency: "USD", turnaround: "4-6 business days", minQty: 1 },
  { id: "prodigi-grc-a5", labId: "prodigi", categoryId: "prodigi-cards", name: "Greeting Card A5 (folded)", description: "Folded greeting card on 350gsm silk card, blank inside.", sku: "GLOBAL-GRC-A5", size: { width: 5.8, height: 8.3, unit: "in" }, finishes: ["Silk", "Matte"], basePrice: 1.80, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
  { id: "prodigi-psc-a6", labId: "prodigi", categoryId: "prodigi-cards", name: "Postcard A6", description: "Single-sided postcard on 350gsm board.", sku: "GLOBAL-PSC-A6", size: { width: 4.1, height: 5.8, unit: "in" }, finishes: ["Silk", "Matte"], basePrice: 0.95, currency: "USD", turnaround: "3-5 business days", minQty: 1 },
];

const PRODIGI_SHIPPING: LabShippingOption[] = [
  { id: "prodigi-ship-budget", name: "Budget", carrier: "Local Post", estimatedDays: "7-14", price: 3.99 },
  { id: "prodigi-ship-standard", name: "Standard", carrier: "DHL/FedEx", estimatedDays: "3-7", price: 7.99 },
  { id: "prodigi-ship-express", name: "Express", carrier: "FedEx", estimatedDays: "1-3", price: 14.99 },
  { id: "prodigi-ship-overnight", name: "Overnight", carrier: "FedEx", estimatedDays: "1", price: 29.99 },
];

// ── Printful (Global POD) ────────────────────────────────────────────────────

const PRINTFUL_CATEGORIES: LabCategory[] = [
  { id: "printful-posters", name: "Posters", description: "Museum-quality posters on archival matte paper", icon: "print" },
  { id: "printful-canvas", name: "Canvas", description: "Gallery-wrapped canvas prints", icon: "image" },
  { id: "printful-framed", name: "Framed Posters", description: "Posters in premium frames with shatterproof glass", icon: "frame" },
  { id: "printful-metal", name: "Metal Prints", description: "Vivid dye-sublimation on aluminium", icon: "diamond" },
  { id: "printful-acrylic", name: "Acrylic Prints", description: "Premium face-mounted acrylic prints", icon: "diamond" },
  { id: "printful-photo-prints", name: "Photo Prints", description: "Lustre and glossy photographic prints", icon: "print" },
  { id: "printful-home-decor", name: "Home & Living", description: "Pillows, blankets, towels, mugs, and more", icon: "gift" },
  { id: "printful-stationery", name: "Stationery", description: "Greeting cards, postcards, and notebooks", icon: "mail" },
  { id: "printful-apparel", name: "Apparel", description: "T-shirts, hoodies, and all-over prints", icon: "shirt" },
];

const PRINTFUL_PRODUCTS: LabProduct[] = [
  { id: "printful-poster-12x18", labId: "printful", categoryId: "printful-posters", name: "Museum-Quality Poster 12×18″", description: "Giclée poster on 200gsm archival matte paper with vivid colors.", sku: "POSTER-12x18", size: { width: 12, height: 18, unit: "in" }, finishes: ["Matte"], basePrice: 9.75, currency: "USD", turnaround: "2-5 business days", minQty: 1 },
  { id: "printful-poster-18x24", labId: "printful", categoryId: "printful-posters", name: "Museum-Quality Poster 18×24″", description: "Large-format poster on premium archival paper.", sku: "POSTER-18x24", size: { width: 18, height: 24, unit: "in" }, finishes: ["Matte"], basePrice: 14.50, currency: "USD", turnaround: "2-5 business days", minQty: 1 },
  { id: "printful-poster-24x36", labId: "printful", categoryId: "printful-posters", name: "Museum-Quality Poster 24×36″", description: "Extra-large poster for statement wall art.", sku: "POSTER-24x36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Matte"], basePrice: 21.25, currency: "USD", turnaround: "3-7 business days", minQty: 1 },
  { id: "printful-canvas-12x12", labId: "printful", categoryId: "printful-canvas", name: "Canvas Print 12×12″", description: "Gallery-wrapped canvas on 1.25″ stretcher bars with semi-gloss finish.", sku: "CANVAS-12x12", size: { width: 12, height: 12, unit: "in" }, finishes: ["Semi-Gloss"], wrapOptions: ["Mirror Wrap", "Black Edge", "White Edge"], basePrice: 22.75, currency: "USD", turnaround: "3-7 business days", minQty: 1 },
  { id: "printful-canvas-16x20", labId: "printful", categoryId: "printful-canvas", name: "Canvas Print 16×20″", description: "Premium canvas with archival UL Certified inks.", sku: "CANVAS-16x20", size: { width: 16, height: 20, unit: "in" }, finishes: ["Semi-Gloss"], wrapOptions: ["Mirror Wrap", "Black Edge", "White Edge"], basePrice: 32.50, currency: "USD", turnaround: "3-7 business days", minQty: 1 },
  { id: "printful-canvas-24x36", labId: "printful", categoryId: "printful-canvas", name: "Canvas Print 24×36″", description: "Large canvas with fade-resistant inks, perfect for living rooms.", sku: "CANVAS-24x36", size: { width: 24, height: 36, unit: "in" }, finishes: ["Semi-Gloss"], wrapOptions: ["Mirror Wrap", "Black Edge", "White Edge"], basePrice: 56.00, currency: "USD", turnaround: "5-10 business days", minQty: 1 },
  { id: "printful-framed-12x18", labId: "printful", categoryId: "printful-framed", name: "Framed Poster 12×18″", description: "Poster in alder wood frame with shatterproof plexiglass.", sku: "FRAMED-12x18", size: { width: 12, height: 18, unit: "in" }, frameOptions: ["Black", "White", "Natural Wood"], basePrice: 32.00, currency: "USD", turnaround: "5-10 business days", minQty: 1 },
  { id: "printful-framed-18x24", labId: "printful", categoryId: "printful-framed", name: "Framed Poster 18×24″", description: "Large framed poster with museum-quality print and wooden frame.", sku: "FRAMED-18x24", size: { width: 18, height: 24, unit: "in" }, frameOptions: ["Black", "White", "Natural Wood"], basePrice: 45.00, currency: "USD", turnaround: "5-10 business days", minQty: 1 },
  { id: "printful-metal-12x12", labId: "printful", categoryId: "printful-metal", name: "Metal Print 12×12″", description: "Dye-sublimation on 1.2mm aluminium with float mount hanger.", sku: "METAL-12x12", size: { width: 12, height: 12, unit: "in" }, finishes: ["High Gloss", "Satin"], basePrice: 42.00, currency: "USD", turnaround: "5-10 business days", minQty: 1 },
  { id: "printful-metal-18x24", labId: "printful", categoryId: "printful-metal", name: "Metal Print 18×24″", description: "Large metal print with vibrant, scratch-resistant surface.", sku: "METAL-18x24", size: { width: 18, height: 24, unit: "in" }, finishes: ["High Gloss", "Satin"], basePrice: 72.00, currency: "USD", turnaround: "7-14 business days", minQty: 1 },
  { id: "printful-acrylic-12x16", labId: "printful", categoryId: "printful-acrylic", name: "Acrylic Print 12×16″", description: "Premium photo print behind ¼″ clear acrylic with polished edges.", sku: "ACRYLIC-12x16", size: { width: 12, height: 16, unit: "in" }, finishes: ["Glossy"], basePrice: 55.00, currency: "USD", turnaround: "7-14 business days", minQty: 1 },
  { id: "printful-pillow-18x18", labId: "printful", categoryId: "printful-home-decor", name: "Throw Pillow 18×18″", description: "Double-sided all-over print pillow with insert.", sku: "PILLOW-18x18", size: { width: 18, height: 18, unit: "in" }, basePrice: 19.95, currency: "USD", turnaround: "3-7 business days", minQty: 1 },
  { id: "printful-mug-11oz", labId: "printful", categoryId: "printful-home-decor", name: "White Glossy Mug 11oz", description: "Ceramic mug with full-wrap dye-sublimation print.", sku: "MUG-11OZ-WHITE", size: { width: 3.8, height: 3.2, unit: "in" }, basePrice: 6.95, currency: "USD", turnaround: "2-5 business days", minQty: 1 },
  { id: "printful-blanket-50x60", labId: "printful", categoryId: "printful-home-decor", name: "Sherpa Fleece Blanket 50×60″", description: "Super-soft sherpa blanket with all-over photo print.", sku: "BLANKET-50x60", size: { width: 50, height: 60, unit: "in" }, basePrice: 38.95, currency: "USD", turnaround: "5-10 business days", minQty: 1 },
  { id: "printful-greeting-5x7", labId: "printful", categoryId: "printful-stationery", name: "Greeting Card 5×7″ (10 pack)", description: "Folded greeting cards on 300gsm paper with envelopes.", sku: "GREETINGCARD-5x7", size: { width: 5, height: 7, unit: "in" }, finishes: ["Matte", "Semi-Gloss"], basePrice: 18.50, currency: "USD", turnaround: "3-7 business days", minQty: 10 },
  { id: "printful-postcard-4x6", labId: "printful", categoryId: "printful-stationery", name: "Postcard 4×6″", description: "Glossy postcard on 350gsm cardstock.", sku: "POSTCARD-4x6", size: { width: 4, height: 6, unit: "in" }, finishes: ["Glossy"], basePrice: 1.25, currency: "USD", turnaround: "2-5 business days", minQty: 1 },
];

const PRINTFUL_SHIPPING: LabShippingOption[] = [
  { id: "printful-ship-standard", name: "Flat Rate", carrier: "USPS/DPD", estimatedDays: "5-12", price: 4.99 },
  { id: "printful-ship-express", name: "Express", carrier: "FedEx/DHL", estimatedDays: "3-5", price: 12.99 },
  { id: "printful-ship-overnight", name: "Overnight", carrier: "FedEx", estimatedDays: "1-2", price: 24.99 },
];

// ── Lab Registry ─────────────────────────────────────────────────────────────

const LAB_CONFIGS: Record<string, LabConfig> = {
  whcc: {
    info: { id: "whcc", name: "WHCC", fullName: "White House Custom Colour", mode: process.env.WHCC_API_KEY ? "live" : "mock", currency: "USD", region: "US", apiAvailable: false },
    volumeDiscounts: [
      { minQty: 100, multiplier: 0.75 },
      { minQty: 50, multiplier: 0.82 },
      { minQty: 25, multiplier: 0.90 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.30 },
      { finish: "Deep Matte", multiplier: 1.15 },
    ],
    categories: WHCC_CATEGORIES,
    products: WHCC_PRODUCTS,
    shippingOptions: WHCC_SHIPPING,
  },
  mpix: {
    info: { id: "mpix", name: "Mpix", fullName: "Mpix / Miller's Professional Imaging", mode: process.env.MPIX_API_KEY ? "live" : "mock", currency: "USD", region: "US", apiAvailable: false },
    volumeDiscounts: [
      { minQty: 100, multiplier: 0.70 },
      { minQty: 50, multiplier: 0.80 },
      { minQty: 25, multiplier: 0.88 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.25 },
    ],
    categories: MPIX_CATEGORIES,
    products: MPIX_PRODUCTS,
    shippingOptions: MPIX_SHIPPING,
  },
  loxley: {
    info: { id: "loxley", name: "Loxley", fullName: "Loxley Colour", mode: process.env.LOXLEY_API_KEY ? "live" : "mock", currency: "GBP", region: "UK/EU", apiAvailable: false },
    volumeDiscounts: [
      { minQty: 100, multiplier: 0.78 },
      { minQty: 50, multiplier: 0.85 },
      { minQty: 20, multiplier: 0.92 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.35 },
      { finish: "Textured", multiplier: 1.10 },
    ],
    categories: LOXLEY_CATEGORIES,
    products: LOXLEY_PRODUCTS,
    shippingOptions: LOXLEY_SHIPPING,
  },
  prodpi: {
    info: { id: "prodpi", name: "ProDPI", fullName: "ProDPI", mode: process.env.PRODPI_API_KEY ? "live" : "mock", currency: "USD", region: "US (Premium)", apiAvailable: false },
    volumeDiscounts: [
      { minQty: 50, multiplier: 0.90 },
      { minQty: 20, multiplier: 0.95 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.20 },
      { finish: "Baryta", multiplier: 1.15 },
    ],
    categories: PRODPI_CATEGORIES,
    products: PRODPI_PRODUCTS,
    shippingOptions: PRODPI_SHIPPING,
  },
  atkins: {
    info: { id: "atkins", name: "Atkins", fullName: "Atkins Pro Lab", mode: process.env.ATKINS_API_KEY ? "live" : "mock", currency: "AUD", region: "AU/NZ", apiAvailable: false },
    volumeDiscounts: [
      { minQty: 500, multiplier: 0.60 },
      { minQty: 200, multiplier: 0.70 },
      { minQty: 100, multiplier: 0.75 },
      { minQty: 50, multiplier: 0.82 },
      { minQty: 25, multiplier: 0.90 },
      { minQty: 10, multiplier: 0.95 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.30 },
      { finish: "Gloss Laminate", multiplier: 1.10 },
      { finish: "High Gloss (baryta)", multiplier: 1.15 },
    ],
    categories: ATKINS_CATEGORIES,
    products: ATKINS_PRODUCTS,
    shippingOptions: ATKINS_SHIPPING,
  },
  prodigi: {
    info: { id: "prodigi", name: "Prodigi", fullName: "Prodigi Global Print Platform", mode: process.env.PRODIGI_API_KEY ? "live" : "mock", currency: "USD", region: "Global (14 countries)", apiAvailable: true },
    volumeDiscounts: [
      { minQty: 100, multiplier: 0.82 },
      { minQty: 50, multiplier: 0.88 },
      { minQty: 25, multiplier: 0.92 },
      { minQty: 10, multiplier: 0.95 },
    ],
    finishSurcharges: [
      { finish: "Metallic", multiplier: 1.25 },
      { finish: "Gloss", multiplier: 1.05 },
    ],
    categories: PRODIGI_CATEGORIES,
    products: PRODIGI_PRODUCTS,
    shippingOptions: PRODIGI_SHIPPING,
  },
  printful: {
    info: { id: "printful", name: "Printful", fullName: "Printful Print-on-Demand", mode: process.env.PRINTFUL_API_KEY ? "live" : "mock", currency: "USD", region: "Global (US/EU/AU)", apiAvailable: true },
    volumeDiscounts: [
      { minQty: 100, multiplier: 0.80 },
      { minQty: 50, multiplier: 0.85 },
      { minQty: 25, multiplier: 0.90 },
      { minQty: 10, multiplier: 0.93 },
      { minQty: 5, multiplier: 0.97 },
    ],
    finishSurcharges: [
      { finish: "High Gloss", multiplier: 1.15 },
      { finish: "Satin", multiplier: 1.08 },
    ],
    categories: PRINTFUL_CATEGORIES,
    products: PRINTFUL_PRODUCTS,
    shippingOptions: PRINTFUL_SHIPPING,
  },
};

// ── Public API ───────────────────────────────────────────────────────────────

export const LAB_IDS = Object.keys(LAB_CONFIGS) as readonly string[];

export function getLabInfo(labId: string): LabInfo | null {
  return LAB_CONFIGS[labId]?.info ?? null;
}

export function getAllLabsInfo(onlyAvailable?: boolean): LabInfo[] {
  const all = Object.values(LAB_CONFIGS).map((c) => c.info);
  if (onlyAvailable) return all.filter((l) => l.apiAvailable);
  return all;
}

export function getLabCategories(labId: string): LabCategory[] {
  return LAB_CONFIGS[labId]?.categories ?? [];
}

export function getLabProducts(labId: string, category?: string): LabProduct[] {
  const products = LAB_CONFIGS[labId]?.products ?? [];
  if (!category) return products;
  return products.filter((p) => p.categoryId === category);
}

export function getLabProduct(labId: string, productId: string): LabProduct | null {
  return LAB_CONFIGS[labId]?.products.find((p) => p.id === productId) ?? null;
}

export function getLabShipping(labId: string): LabShippingOption[] {
  return LAB_CONFIGS[labId]?.shippingOptions ?? [];
}

/**
 * Calculate pricing for a lab product with volume discounts and finish surcharges.
 */
export function calculateLabPricing(
  labId: string,
  productId: string,
  options: { quantity?: number; finish?: string } = {},
): LabPricingResult | null {
  const config = LAB_CONFIGS[labId];
  if (!config) return null;

  const product = config.products.find((p) => p.id === productId);
  if (!product) return null;

  const qty = options.quantity || 1;
  let unitPrice = product.basePrice;

  // Apply volume discount (sorted high→low, take first match)
  for (const vd of config.volumeDiscounts) {
    if (qty >= vd.minQty) {
      unitPrice *= vd.multiplier;
      break;
    }
  }

  // Apply finish surcharge
  if (options.finish) {
    const surcharge = config.finishSurcharges.find(
      (s) => s.finish.toLowerCase() === options.finish!.toLowerCase(),
    );
    if (surcharge) {
      unitPrice *= surcharge.multiplier;
    }
  }

  unitPrice = Math.round(unitPrice * 100) / 100;

  return {
    productId,
    sku: product.sku,
    unitPrice,
    quantity: qty,
    subtotal: Math.round(unitPrice * qty * 100) / 100,
    currency: product.currency,
    options,
  };
}

/**
 * Compare products across labs by type (category name) and optional size.
 */
export function compareLabProducts(
  type?: string,
  size?: string,
): { labId: string; labName: string; product: LabProduct }[] {
  const results: { labId: string; labName: string; product: LabProduct }[] = [];

  for (const [labId, config] of Object.entries(LAB_CONFIGS)) {
    for (const product of config.products) {
      let match = true;

      if (type) {
        const cat = config.categories.find((c) => c.id === product.categoryId);
        const typeL = type.toLowerCase();
        match =
          product.categoryId.toLowerCase().includes(typeL) ||
          product.name.toLowerCase().includes(typeL) ||
          (cat?.name.toLowerCase().includes(typeL) ?? false);
      }

      if (match && size && product.size) {
        const [w, h] = size.split("x").map(Number);
        match = product.size.width === w && product.size.height === h;
      }

      if (match) {
        results.push({ labId, labName: config.info.fullName, product });
      }
    }
  }

  return results;
}

/**
 * Get the lab cost for a product by its SKU across all labs.
 * Used by the fulfillment engine to calculate accurate margins.
 */
export function getLabCostBySku(sku: string): { labId: string; basePrice: number; currency: string } | null {
  for (const [labId, config] of Object.entries(LAB_CONFIGS)) {
    const product = config.products.find((p) => p.sku === sku);
    if (product) {
      return { labId, basePrice: product.basePrice, currency: product.currency };
    }
  }
  return null;
}

/**
 * Get all products across all labs (flattened).
 * Pass onlyAvailable=true to restrict to labs with live API access.
 */
export function getAllLabProducts(onlyAvailable?: boolean): LabProduct[] {
  return Object.entries(LAB_CONFIGS)
    .filter(([, c]) => !onlyAvailable || c.info.apiAvailable)
    .flatMap(([, c]) => c.products);
}
