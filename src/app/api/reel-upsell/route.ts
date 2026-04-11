import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const REEL_PRICES: Record<string, { amount: number; label: string }> = {
  SHORT: { amount: 900, label: "Short Reel (15s)" },
  STANDARD: { amount: 1500, label: "Standard Reel (30s)" },
  PREMIUM: { amount: 2500, label: "Premium Reel (60s)" },
};

/** POST /api/reel-upsell — Create a Stripe checkout for a reel purchase */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, tier } = body;

    if (!orderId || !tier) {
      return NextResponse.json(
        { error: "orderId and tier are required" },
        { status: 400 }
      );
    }

    const pricing = REEL_PRICES[tier];
    if (!pricing) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${Object.keys(REEL_PRICES).join(", ")}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { gallery: true, customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.reelStatus !== "PREVIEW_READY") {
      return NextResponse.json(
        { error: "Reel is not available for this order. Status: " + (order.reelStatus || "none") },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: order.currency || "EUR",
            unit_amount: pricing.amount,
            product_data: {
              name: `Fotiqo ${pricing.label}`,
              description: `Cinematic reel from your ${order.gallery?.totalCount || ""} photos`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "REEL_UPSELL",
        orderId: order.id,
        galleryId: order.galleryId || "",
        reelTier: tier,
      },
      success_url: `${baseUrl}/order/${order.id}/reel?purchased=true&tier=${tier}`,
      cancel_url: `${baseUrl}/order/${order.id}/reel`,
      ...(order.customer?.email && { customer_email: order.customer.email }),
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  } catch (err: any) {
    console.error("[reel-upsell] Error:", err.message);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
