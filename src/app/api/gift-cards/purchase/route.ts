import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { generateGiftCardCode } from "@/lib/gift-cards";

const schema = z.object({
  amount: z.number().positive().min(5).max(1000),
  currency: z.string().length(3).optional(),
  purchasedBy: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { amount, currency = "EUR", purchasedBy, email } = parsed.data;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in environment." },
      { status: 503 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const giftCardCode = generateGiftCardCode();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Pixelvo Gift Card — ${currency.toUpperCase()} ${amount}`,
              description: `Gift card code: ${giftCardCode}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${baseUrl}/shop/gift-cards?success=1&code=${giftCardCode}`,
      cancel_url: `${baseUrl}/shop/gift-cards?cancelled=1`,
      metadata: {
        type: "GIFT_CARD",
        giftCardCode,
        amount: String(amount),
        currency: currency.toUpperCase(),
        purchasedBy: purchasedBy || email || "anonymous",
      },
    });

    return NextResponse.json({ url: session.url, code: giftCardCode });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Stripe error" },
      { status: 502 },
    );
  }
}
