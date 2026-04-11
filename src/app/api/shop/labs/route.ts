import { NextRequest, NextResponse } from "next/server";
import {
  getAllLabsInfo,
  getLabInfo,
  getLabCategories,
  getLabProducts,
  getLabProduct,
  getLabShipping,
  calculateLabPricing,
  compareLabProducts,
} from "@/lib/labCatalog";

export const dynamic = "force-dynamic";

/**
 * Unified lab catalog API.
 *
 * GET /api/shop/labs                              → list available labs (API ready)
 * GET /api/shop/labs?all=true                     → list ALL labs (including pending API keys)
 * GET /api/shop/labs?lab=whcc                     → single lab info
 * GET /api/shop/labs?lab=whcc&view=categories     → lab categories
 * GET /api/shop/labs?lab=whcc&view=products       → lab products (optional &category=)
 * GET /api/shop/labs?lab=whcc&view=product&id=X   → single product detail
 * GET /api/shop/labs?lab=whcc&view=shipping       → shipping options
 * GET /api/shop/labs?lab=whcc&view=pricing&id=X   → pricing (optional &quantity=, &finish=)
 * GET /api/shop/labs?view=compare&type=X          → cross-lab comparison (optional &size=)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const labId = searchParams.get("lab");
  const view = searchParams.get("view");
  const showAll = searchParams.get("all") === "true";

  // List labs (default: only those with live API access)
  if (!labId && !view) {
    const labs = getAllLabsInfo(!showAll);
    return NextResponse.json({
      labs,
      total: labs.length,
      note: showAll ? undefined : "Showing labs with live API access. Add ?all=true for all labs.",
      timestamp: new Date().toISOString(),
    });
  }

  // Cross-lab comparison
  if (view === "compare") {
    const type = searchParams.get("type") ?? undefined;
    const size = searchParams.get("size") ?? undefined;
    const results = compareLabProducts(type, size);
    return NextResponse.json({
      type,
      size,
      total: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  }

  // Single lab operations
  if (!labId) {
    return NextResponse.json({ error: "Missing ?lab= parameter" }, { status: 400 });
  }

  const info = getLabInfo(labId);
  if (!info) {
    return NextResponse.json(
      { error: `Lab '${labId}' not found`, available: getAllLabsInfo().map((l) => l.id) },
      { status: 404 },
    );
  }

  switch (view) {
    case "categories":
      return NextResponse.json({
        lab: info.id,
        mock: info.mode === "mock",
        data: getLabCategories(labId),
        timestamp: new Date().toISOString(),
      });

    case "products": {
      const category = searchParams.get("category") ?? undefined;
      const products = getLabProducts(labId, category);
      return NextResponse.json({
        lab: info.id,
        mock: info.mode === "mock",
        total: products.length,
        data: products,
        timestamp: new Date().toISOString(),
      });
    }

    case "product": {
      const productId = searchParams.get("id");
      if (!productId) {
        return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
      }
      const product = getLabProduct(labId, productId);
      if (!product) {
        return NextResponse.json({ error: `Product '${productId}' not found in ${labId}` }, { status: 404 });
      }
      return NextResponse.json({
        lab: info.id,
        mock: info.mode === "mock",
        data: product,
        timestamp: new Date().toISOString(),
      });
    }

    case "shipping":
      return NextResponse.json({
        lab: info.id,
        mock: info.mode === "mock",
        data: getLabShipping(labId),
        timestamp: new Date().toISOString(),
      });

    case "pricing": {
      const productId = searchParams.get("id");
      if (!productId) {
        return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
      }
      const quantity = parseInt(searchParams.get("quantity") || "1", 10);
      const finish = searchParams.get("finish") ?? undefined;
      const pricing = calculateLabPricing(labId, productId, { quantity, finish });
      if (!pricing) {
        return NextResponse.json({ error: `Product '${productId}' not found in ${labId}` }, { status: 404 });
      }
      return NextResponse.json({
        lab: info.id,
        mock: info.mode === "mock",
        data: pricing,
        timestamp: new Date().toISOString(),
      });
    }

    default:
      // No view → return lab info
      return NextResponse.json({
        ...info,
        categories: getLabCategories(labId).length,
        products: getLabProducts(labId).length,
        shipping: getLabShipping(labId).length,
        timestamp: new Date().toISOString(),
      });
  }
}
