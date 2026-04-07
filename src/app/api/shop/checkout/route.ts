import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS } from "../products/route";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const productId = String(data.get("productId"));
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?ok=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      metadata: { shopProductId: productId },
    });
    return NextResponse.redirect(session.url!, 303);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, mock: true, product }, { status: 200 });
  }
}
