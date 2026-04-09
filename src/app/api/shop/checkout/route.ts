import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById, loadShopProducts, type ShopProduct } from "@/lib/shopProducts";
import { redeemGiftCard, checkBalance } from "@/lib/gift-cards";

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
  let giftCardCode: string | undefined;

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    lines = await resolveLines(body?.items);
    giftCardCode = body?.giftCardCode;
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

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  let giftCardDiscount = 0;

  // Apply gift card if provided
  if (giftCardCode) {
    const balance = await checkBalance(giftCardCode);
    if (!balance) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 400 });
    }
    if (!balance.isActive) {
      return NextResponse.json({ error: "Gift card is inactive or expired" }, { status: 400 });
    }
    giftCardDiscount = Math.min(balance.balance, subtotal);

    // If gift card covers the full amount, redeem and skip Stripe
    if (giftCardDiscount >= subtotal) {
      // Pass redemption context for proper revenue recognition tracking
      const result = await redeemGiftCard(giftCardCode, subtotal, {
        redeemedBy: "shop_customer",
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        paid: true,
        method: "gift_card",
        amount: subtotal,
        giftCardRemaining: result.remainingBalance,
        revenueRecognized: result.revenueRecognized, // Amount moved from deferred to earned
      });
    }

    // Partial gift card: redeem partial and send remaining to Stripe
    const result = await redeemGiftCard(giftCardCode, giftCardDiscount, {
      redeemedBy: "shop_customer",
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  const chargeAmount = subtotal - giftCardDiscount;

  try {
    const stripeLineItems = lines.map(({ product, qty }) => ({
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: { name: product.name, description: product.description },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: qty,
    }));

    // Stripe does NOT allow negative unit_amount values in line items.
    // Apply partial gift card discount as a one-time Stripe coupon instead.
    let discounts: { coupon: string }[] | undefined;
    if (giftCardDiscount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(giftCardDiscount * 100),
        currency: lines[0].product.currency.toLowerCase(),
        duration: "once",
        name: `Gift Card (${giftCardCode})`,
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      ...(discounts ? { discounts } : {}),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?ok=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      metadata: {
        shopProductKeys: lines.map((l) => `${l.product.productKey}x${l.qty}`).join(","),
        ...(giftCardCode ? { giftCardCode, giftCardDiscount: String(giftCardDiscount) } : {}),
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
