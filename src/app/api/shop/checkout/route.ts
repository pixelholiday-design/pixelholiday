import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById, loadShopProducts, type ShopProduct } from "@/lib/shopProducts";

type CartLine = { productKey: string; qty: number };

async function resolveLines(raw: unknown): Promise<{ product: ShopProduct; qty: number }[]> {
  if (!Array.isArray(raw)) return [];
  const { all } = await loadShopProducts();
  const byKey = new Map(all.map((p) => [p.productKey, p]));
  const lines: { product: ShopProduct; qty: number }[] = [];
  for (const item of raw as CartLine[]) {
    if (!item || typeof item.productKey !== "string") continue;
    const qty = Math.max(1, Math.min(20, Number(item.qty) || 1));
    const product = byKey.get(item.productKey);
    if (product) lines.push({ product, qty });
  }
  return lines;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let lines: { product: ShopProduct; qty: number }[] = [];

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    lines = await resolveLines(body?.items);
  } else {
    // Legacy form post: a single productId
    const data = await req.formData();
    const productId = String(data.get("productId") || "");
    const product = await getProductById(productId);
    if (product) lines = [{ product, qty: 1 }];
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map(({ product, qty }) => ({
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: { name: product.name, description: product.description },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: qty,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?ok=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      metadata: {
        shopProductKeys: lines.map((l) => `${l.product.productKey}x${l.qty}`).join(","),
      },
    });
    if (contentType.includes("application/json")) {
      return NextResponse.json({ url: session.url });
    }
    return NextResponse.redirect(session.url!, 303);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message,
        mock: true,
        lines: lines.map((l) => ({ key: l.product.productKey, qty: l.qty, price: l.product.price })),
      },
      { status: 200 },
    );
  }
}
