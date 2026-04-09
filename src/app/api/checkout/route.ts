import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getPrice } from "@/lib/pricing";

// Map from OrderItemType enum to PricingConfig productKey
const ITEM_TYPE_TO_KEY: Record<string, string> = {
  SINGLE_PHOTO: "single_photo",
  PARTIAL_GALLERY: "ten_pack",
  FULL_GALLERY: "full_gallery",
  PRINTED_ALBUM: "canvas_30x40",
  VIDEO_CLIP: "video_reel",
  AUTO_REEL: "video_reel",
  MAGIC_SHOT: "magic_shot",
  DIGITAL_PASS: "pass_unlimited",
  SOCIAL_MEDIA_PACKAGE: "ten_pack",
};

const schema = z.object({
  token: z.string().min(1),
  items: z
    .array(
      z.object({
        type: z.enum([
          "SINGLE_PHOTO",
          "PARTIAL_GALLERY",
          "FULL_GALLERY",
          "PRINTED_ALBUM",
          "VIDEO_CLIP",
          "AUTO_REEL",
          "MAGIC_SHOT",
          "DIGITAL_PASS",
          "SOCIAL_MEDIA_PACKAGE",
        ]),
        quantity: z.number().int().positive().max(500).optional(),
      })
    )
    .optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { token, items, couponCode } = parsed.data;

  const gallery = await prisma.gallery.findUnique({ where: { magicLinkToken: token } });
  if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  if (gallery.expiresAt && gallery.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Gallery expired" }, { status: 410 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in environment." },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cart = items && items.length ? items : [{ type: "FULL_GALLERY" as const, quantity: 1 }];

  // Resolve prices: location-specific first, then global, then hardcoded fallback
  const locationId = gallery.locationId || null;
  const lineItems = await Promise.all(
    cart.map(async (it) => {
      const productKey = ITEM_TYPE_TO_KEY[it.type];
      let unitAmountEur: number;
      if (productKey) {
        try {
          unitAmountEur = await getPrice(productKey, locationId);
        } catch {
          unitAmountEur = (PRICES[it.type as keyof typeof PRICES] ?? 4900) / 100;
        }
      } else {
        unitAmountEur = (PRICES[it.type as keyof typeof PRICES] ?? 4900) / 100;
      }
      return {
        price_data: {
          currency: "eur",
          product_data: { name: it.type.replace(/_/g, " ") },
          unit_amount: Math.round(unitAmountEur * 100),
        },
        quantity: it.quantity || 1,
      };
    })
  );

  // Resolve discount: gallery.discountPercent (sleeping money) takes priority,
  // then a manually supplied couponCode (promotion code lookup).
  let stripeCouponId: string | undefined;
  let stripePromotionCodeId: string | undefined;

  if (gallery.discountPercent && gallery.discountPercent > 0) {
    // Create a one-time Stripe coupon for the automated sleeping-money discount.
    try {
      const pct = Math.round(gallery.discountPercent * 100);
      const coupon = await stripe.coupons.create({
        percent_off: pct,
        duration: "once",
        name: `Gallery discount ${pct}%`,
        max_redemptions: 1,
      });
      stripeCouponId = coupon.id;
    } catch (e: any) {
      console.warn("Failed to create Stripe coupon for gallery discount", e?.message);
    }
  } else if (couponCode) {
    // Look up a Stripe promotion code supplied by the customer.
    try {
      const promoCodes = await stripe.promotionCodes.list({ code: couponCode, active: true, limit: 1 });
      if (promoCodes.data.length > 0) {
        stripePromotionCodeId = promoCodes.data[0].id;
      } else {
        return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
      }
    } catch (e: any) {
      console.warn("Stripe promotion code lookup failed", e?.message);
    }
  }

  const discounts = stripeCouponId
    ? [{ coupon: stripeCouponId }]
    : stripePromotionCodeId
    ? [{ promotion_code: stripePromotionCodeId }]
    : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      success_url: `${baseUrl}/gallery/${token}?paid=1`,
      cancel_url: `${baseUrl}/gallery/${token}`,
      metadata: {
        galleryId: gallery.id,
        magicLinkToken: token,
        cart: JSON.stringify(cart),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Stripe error" }, { status: 502 });
  }
}
