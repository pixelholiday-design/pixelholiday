import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getPrice } from "@/lib/pricing";

const schema = z.object({
  reelId: z.string().min(1),
});

const SLIDESHOW_PRICE_KEYS: Record<number, string> = {
  30: "slideshow_30",
  60: "slideshow_60",
  90: "slideshow_90",
};

const SLIDESHOW_FALLBACK_PRICES: Record<number, number> = {
  30: 20,
  60: 30,
  90: 40,
};

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "reelId is required" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: params.token },
    select: { id: true, locationId: true, customerId: true },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  const reel = await prisma.videoReel.findFirst({
    where: { id: parsed.data.reelId, galleryId: gallery.id },
    select: { id: true, duration: true, status: true },
  });
  if (!reel) {
    return NextResponse.json({ ok: false, error: "Slideshow not found" }, { status: 404 });
  }

  const dur = reel.duration as 30 | 60 | 90;
  const priceKey = SLIDESHOW_PRICE_KEYS[dur] ?? "slideshow_30";
  const fallback = SLIDESHOW_FALLBACK_PRICES[dur] ?? 20;

  // Resolve price from PricingConfig, then fallback
  let priceEur: number;
  try {
    priceEur = await getPrice(priceKey, gallery.locationId);
    if (priceEur <= 0) priceEur = fallback;
  } catch {
    priceEur = fallback;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const successUrl = `${baseUrl}/gallery/${params.token}?slideshow=purchased`;
  const cancelUrl = `${baseUrl}/gallery/${params.token}?slideshow=cancelled`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(priceEur * 100),
            product_data: {
              name: `Video Slideshow (${dur}s)`,
              description: `Custom photo slideshow with music - ${dur} seconds`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        galleryId: gallery.id,
        reelId: reel.id,
        type: "slideshow_purchase",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("[Slideshow Purchase] Stripe error:", err.message);
    return NextResponse.json({ ok: false, error: "Payment setup failed" }, { status: 500 });
  }
}
