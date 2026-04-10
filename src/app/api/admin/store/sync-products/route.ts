import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PRODIGI_KEY = process.env.PRODIGI_API_KEY || "";
const PRODIGI_ENV = process.env.PRODIGI_ENVIRONMENT || "sandbox";
const PRODIGI_BASE =
  PRODIGI_ENV === "live" || PRODIGI_ENV === "production"
    ? "https://api.prodigi.com/v4.0"
    : "https://api.sandbox.prodigi.com/v4.0";

const PRINTFUL_KEY = process.env.PRINTFUL_API_KEY || "";
const PRINTFUL_BASE = "https://api.printful.com";

// Category mapping for Prodigi product types
const PRODIGI_CATEGORY_MAP: Record<string, string> = {
  "Fine Art Prints": "PRINT",
  "Photo Prints": "PRINT",
  Prints: "PRINT",
  Canvas: "WALL_ART",
  "Canvas Wraps": "WALL_ART",
  "Framed Prints": "WALL_ART",
  "Metal Prints": "SPECIALTY_WALL",
  "Acrylic Prints": "SPECIALTY_WALL",
  Mugs: "GIFT",
  "Phone Cases": "GIFT",
  Cushions: "GIFT",
  "Tote Bags": "GIFT",
  Apparel: "SOUVENIR",
  "T-Shirts": "SOUVENIR",
  Hoodies: "SOUVENIR",
  Calendars: "GIFT",
  Posters: "PRINT",
};

// Category mapping for Printful
const PRINTFUL_CATEGORY_MAP: Record<string, string> = {
  "Posters": "PRINT",
  "Canvas": "WALL_ART",
  "Framed posters": "WALL_ART",
  "Enhanced matte paper framed poster": "WALL_ART",
  "Mugs": "GIFT",
  "Phone cases": "GIFT",
  "T-shirts": "SOUVENIR",
  "Hoodies": "SOUVENIR",
  "Tote bags": "GIFT",
  "All-over print": "SOUVENIR",
};

// ── Prodigi catalog fetch ──────────────────────────────────────────────────

async function fetchProdigiProducts(): Promise<any[]> {
  if (!PRODIGI_KEY) return [];
  try {
    const res = await fetch(`${PRODIGI_BASE}/Products`, {
      headers: { "X-API-Key": PRODIGI_KEY },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || data.items || data || [];
  } catch {
    return [];
  }
}

// ── Printful catalog fetch ─────────────────────────────────────────────────

async function fetchPrintfulProducts(): Promise<any[]> {
  if (!PRINTFUL_KEY) return [];
  try {
    const res = await fetch(`${PRINTFUL_BASE}/products`, {
      headers: { Authorization: `Bearer ${PRINTFUL_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.result || [];
  } catch {
    return [];
  }
}

// ── Map Prodigi product to ShopProduct shape ───────────────────────────────

function mapProdigiProduct(p: any, sortBase: number): any {
  const sku = p.sku || p.id || "";
  const name = p.description || p.name || sku;
  const category =
    PRODIGI_CATEGORY_MAP[p.category || ""] ||
    PRODIGI_CATEGORY_MAP[p.productType || ""] ||
    "PRINT";

  // Build sizes from Prodigi attributes
  const sizes: { key: string; label: string; price?: number }[] = [];
  if (p.attributes?.length) {
    for (const attr of p.attributes) {
      if (attr.name?.toLowerCase().includes("size")) {
        for (const opt of attr.options || []) {
          sizes.push({ key: opt.value || opt, label: opt.label || opt.value || opt });
        }
      }
    }
  }
  if (p.variants?.length) {
    for (const v of p.variants) {
      sizes.push({
        key: v.sku || v.id,
        label: v.description || v.attributes?.size || v.sku,
        price: v.cost ? parseFloat(v.cost) : undefined,
      });
    }
  }

  const cost = p.cost?.amount
    ? parseFloat(p.cost.amount) / 100
    : p.costPerUnit
      ? parseFloat(p.costPerUnit)
      : 5.0;

  return {
    productKey: `prodigi_${sku}`.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 100),
    name,
    description: p.description || `${name} — printed and shipped by Prodigi`,
    category,
    retailPrice: Math.ceil(cost * 2.5 * 100) / 100, // 2.5x markup
    costPrice: cost,
    fulfillmentType: "PRODIGI",
    labName: "PRODIGI",
    labProductId: sku,
    turnaround: "3-7 business days",
    isActive: true,
    isFeatured: false,
    sortOrder: sortBase,
    sizes: sizes.length > 0 ? JSON.stringify(sizes) : null,
  };
}

// ── Map Printful product to ShopProduct shape ──────────────────────────────

function mapPrintfulProduct(p: any, sortBase: number): any {
  const name = p.title || p.type || "Printful Product";
  const category =
    PRINTFUL_CATEGORY_MAP[p.type || ""] ||
    PRINTFUL_CATEGORY_MAP[p.type_name || ""] ||
    "GIFT";

  // Build sizes from Printful variants
  const sizes: { key: string; label: string; price?: number }[] = [];
  if (p.variants?.length) {
    for (const v of p.variants.slice(0, 20)) {
      sizes.push({
        key: String(v.id),
        label: v.name || v.size || `Variant ${v.id}`,
        price: v.price ? parseFloat(v.price) : undefined,
      });
    }
  }

  const avgPrice =
    p.variants?.length > 0
      ? p.variants.reduce((s: number, v: any) => s + (parseFloat(v.price) || 10), 0) /
        p.variants.length
      : 10;

  return {
    productKey: `printful_${p.id}`,
    name,
    description: p.description || `${name} — printed and shipped by Printful`,
    category,
    retailPrice: Math.ceil(avgPrice * 2.2 * 100) / 100, // 2.2x markup
    costPrice: Math.round(avgPrice * 100) / 100,
    fulfillmentType: "PRINTFUL",
    labName: "PRINTFUL",
    labProductId: String(p.id),
    turnaround: "5-10 business days",
    isActive: true,
    isFeatured: false,
    sortOrder: sortBase,
    sizes: sizes.length > 0 ? JSON.stringify(sizes.slice(0, 20)) : null,
    mockupUrl: p.image || p.thumbnail_url || null,
  };
}

// ── POST: Sync products from both platforms ────────────────────────────────

export async function POST() {
  const results = { prodigi: 0, printful: 0, errors: [] as string[] };

  // Fetch from both platforms in parallel
  const [prodigiProducts, printfulProducts] = await Promise.all([
    fetchProdigiProducts(),
    fetchPrintfulProducts(),
  ]);

  // Sync Prodigi products
  for (let i = 0; i < prodigiProducts.length; i++) {
    try {
      const mapped = mapProdigiProduct(prodigiProducts[i], 1000 + i);
      await prisma.shopProduct.upsert({
        where: { productKey: mapped.productKey },
        create: mapped,
        update: {
          name: mapped.name,
          description: mapped.description,
          costPrice: mapped.costPrice,
          retailPrice: mapped.retailPrice,
          labProductId: mapped.labProductId,
          labName: mapped.labName,
          sizes: mapped.sizes,
          sortOrder: mapped.sortOrder,
        },
      });
      results.prodigi++;
    } catch (e: any) {
      results.errors.push(`Prodigi ${i}: ${e.message?.slice(0, 100)}`);
    }
  }

  // Sync Printful products
  for (let i = 0; i < printfulProducts.length; i++) {
    try {
      const mapped = mapPrintfulProduct(printfulProducts[i], 2000 + i);
      await prisma.shopProduct.upsert({
        where: { productKey: mapped.productKey },
        create: mapped,
        update: {
          name: mapped.name,
          description: mapped.description,
          costPrice: mapped.costPrice,
          retailPrice: mapped.retailPrice,
          labProductId: mapped.labProductId,
          labName: mapped.labName,
          sizes: mapped.sizes,
          sortOrder: mapped.sortOrder,
          mockupUrl: mapped.mockupUrl,
        },
      });
      results.printful++;
    } catch (e: any) {
      results.errors.push(`Printful ${i}: ${e.message?.slice(0, 100)}`);
    }
  }

  const total = await prisma.shopProduct.count({ where: { isActive: true } });

  return NextResponse.json({
    ok: true,
    synced: { prodigi: results.prodigi, printful: results.printful },
    totalProducts: total,
    errors: results.errors.length > 0 ? results.errors : undefined,
    source: {
      prodigiFetched: prodigiProducts.length,
      printfulFetched: printfulProducts.length,
    },
  });
}

// ── GET: Show sync status ──────────────────────────────────────────────────

export async function GET() {
  const [total, prodigi, printful, manual] = await Promise.all([
    prisma.shopProduct.count({ where: { isActive: true } }),
    prisma.shopProduct.count({ where: { labName: "PRODIGI", isActive: true } }),
    prisma.shopProduct.count({ where: { labName: "PRINTFUL", isActive: true } }),
    prisma.shopProduct.count({
      where: { isActive: true, labName: { notIn: ["PRODIGI", "PRINTFUL"] } },
    }),
  ]);

  return NextResponse.json({
    totalProducts: total,
    bySource: { prodigi, printful, manual },
    hasProdigiKey: !!PRODIGI_KEY,
    hasPrintfulKey: !!PRINTFUL_KEY,
  });
}
