import { NextRequest, NextResponse } from "next/server";
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

// Require a secret token for this public route
const SYNC_SECRET = process.env.SHOP_SYNC_TOKEN || process.env.CRON_SECRET || "fotiqo-sync-2026";

async function fetchProdigiCatalog(): Promise<any[]> {
  if (!PRODIGI_KEY) return [];
  try {
    const res = await fetch(`${PRODIGI_BASE}/Products`, {
      headers: { "X-API-Key": PRODIGI_KEY },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || data.items || (Array.isArray(data) ? data : []);
  } catch { return []; }
}

async function fetchPrintfulCatalog(): Promise<any[]> {
  if (!PRINTFUL_KEY) return [];
  try {
    const res = await fetch(`${PRINTFUL_BASE}/products`, {
      headers: { Authorization: `Bearer ${PRINTFUL_KEY}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.result || [];
  } catch { return []; }
}

const CAT_MAP: Record<string, string> = {
  "Fine Art Prints": "PRINT", "Photo Prints": "PRINT", Prints: "PRINT", Posters: "PRINT",
  Canvas: "WALL_ART", "Canvas Wraps": "WALL_ART", "Framed Prints": "WALL_ART", "Framed posters": "WALL_ART",
  "Metal Prints": "SPECIALTY_WALL", "Acrylic Prints": "SPECIALTY_WALL",
  Mugs: "GIFT", "Phone Cases": "GIFT", "Phone cases": "GIFT", Cushions: "GIFT", "Tote Bags": "GIFT", "Tote bags": "GIFT",
  Apparel: "SOUVENIR", "T-Shirts": "SOUVENIR", "T-shirts": "SOUVENIR", Hoodies: "SOUVENIR",
};

function mapProdigi(p: any, i: number) {
  const sku = p.sku || p.id || `prodigi_${i}`;
  const name = p.description || p.name || sku;
  const cost = p.cost?.amount ? parseFloat(p.cost.amount) / 100 : 5;
  return {
    productKey: `prodigi_${sku}`.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 100),
    name, description: `${name} — printed by Prodigi`,
    category: CAT_MAP[p.category || p.productType || ""] || "PRINT",
    retailPrice: Math.ceil(cost * 2.5 * 100) / 100, costPrice: cost,
    fulfillmentType: "PRODIGI", labName: "PRODIGI", labProductId: sku,
    turnaround: "3-7 business days", isActive: true, isFeatured: false, sortOrder: 1000 + i,
    mockupUrl: p.image || p.thumbnail || null,
  };
}

function mapPrintful(p: any, i: number) {
  const name = p.title || p.type || "Printful Product";
  const avg = p.variants?.length > 0
    ? p.variants.reduce((s: number, v: any) => s + (parseFloat(v.price) || 10), 0) / p.variants.length
    : 10;
  return {
    productKey: `printful_${p.id}`,
    name, description: p.description || `${name} — printed by Printful`,
    category: CAT_MAP[p.type || p.type_name || ""] || "GIFT",
    retailPrice: Math.ceil(avg * 2.2 * 100) / 100, costPrice: Math.round(avg * 100) / 100,
    fulfillmentType: "PRINTFUL", labName: "PRINTFUL", labProductId: String(p.id),
    turnaround: "5-10 business days", isActive: true, isFeatured: false, sortOrder: 2000 + i,
    mockupUrl: p.image || p.thumbnail_url || null,
  };
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== SYNC_SECRET) {
    return NextResponse.json({ error: "Invalid sync token" }, { status: 403 });
  }

  // If ?clean=1, remove all manual (non-lab) products first
  const clean = req.nextUrl.searchParams.get("clean") === "1";
  let removed = 0;
  if (clean) {
    const del = await prisma.shopProduct.deleteMany({
      where: { OR: [{ labName: null }, { labName: { notIn: ["PRODIGI", "PRINTFUL"] } }] },
    });
    removed = del.count;
  }

  const [prodigiList, printfulList] = await Promise.all([
    fetchProdigiCatalog(), fetchPrintfulCatalog(),
  ]);

  const results = { prodigi: 0, printful: 0, errors: [] as string[] };

  for (let i = 0; i < prodigiList.length; i++) {
    try {
      const m = mapProdigi(prodigiList[i], i);
      await prisma.shopProduct.upsert({
        where: { productKey: m.productKey },
        create: m, update: { name: m.name, costPrice: m.costPrice, retailPrice: m.retailPrice, labProductId: m.labProductId, labName: m.labName, mockupUrl: m.mockupUrl },
      });
      results.prodigi++;
    } catch (e: any) { results.errors.push(`P${i}: ${e.message?.slice(0, 80)}`); }
  }

  for (let i = 0; i < printfulList.length; i++) {
    try {
      const m = mapPrintful(printfulList[i], i);
      await prisma.shopProduct.upsert({
        where: { productKey: m.productKey },
        create: m, update: { name: m.name, costPrice: m.costPrice, retailPrice: m.retailPrice, labProductId: m.labProductId, labName: m.labName, mockupUrl: m.mockupUrl },
      });
      results.printful++;
    } catch (e: any) { results.errors.push(`F${i}: ${e.message?.slice(0, 80)}`); }
  }

  const total = await prisma.shopProduct.count({ where: { isActive: true } });

  return NextResponse.json({
    ok: true, synced: results, totalProducts: total,
    fetched: { prodigi: prodigiList.length, printful: printfulList.length },
    removed: clean ? removed : undefined,
    errors: results.errors.length ? results.errors : undefined,
  });
}

export async function GET() {
  const [total, prodigi, printful] = await Promise.all([
    prisma.shopProduct.count({ where: { isActive: true } }),
    prisma.shopProduct.count({ where: { labName: "PRODIGI", isActive: true } }),
    prisma.shopProduct.count({ where: { labName: "PRINTFUL", isActive: true } }),
  ]);
  return NextResponse.json({ totalProducts: total, bySource: { prodigi, printful, manual: total - prodigi - printful } });
}
