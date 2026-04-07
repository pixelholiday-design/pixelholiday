import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { token, items } = parsed.data;

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

  const lineItems = cart.map((it) => ({
    price_data: {
      currency: "eur",
      product_data: { name: it.type.replace(/_/g, " ") },
      unit_amount: PRICES[it.type as keyof typeof PRICES],
    },
    quantity: it.quantity || 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
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
