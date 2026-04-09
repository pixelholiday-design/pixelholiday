import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, galleryId, photographerId } = await req.json();

    if (!amount || !galleryId || !photographerId) {
      return NextResponse.json({ error: "amount, galleryId, and photographerId are required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount < 100) {
      return NextResponse.json({ error: "amount must be at least 100 (1.00 in currency units)" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || "eur",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: {
        galleryId,
        photographerId,
        source: "mobile_pos",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("[terminal/create-payment-intent]", err);
    return NextResponse.json({ error: err.message || "Failed to create payment intent" }, { status: 500 });
  }
}
