import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, galleryId, description } = await req.json();

    if (!amount || !galleryId) {
      return NextResponse.json({ error: "amount and galleryId are required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount < 100) {
      return NextResponse.json({ error: "amount must be at least 100 (1.00 in currency units)" }, { status: 400 });
    }

    // Create a Stripe Payment Link via a one-time price
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount),
      currency: currency || "eur",
      product_data: {
        name: description || "Fotiqo Photo Gallery",
      },
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        galleryId,
        source: "qr_payment",
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/payment-success?gallery=${galleryId}`,
        },
      },
    });

    return NextResponse.json({
      url: paymentLink.url,
      paymentLinkId: paymentLink.id,
    });
  } catch (err: any) {
    console.error("[terminal/qr-payment]", err);
    return NextResponse.json({ error: err.message || "Failed to create payment link" }, { status: 500 });
  }
}
