import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getPrice } from "@/lib/pricing";

const PRESETS = ["auto", "warm", "cool", "vibrant", "portrait"] as const;

const schema = z.object({
  photoId: z.string().min(1),
  preset: z.enum(PRESETS),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { photoId, preset } = parsed.data;

    const gallery = await prisma.gallery.findUnique({
      where: { magicLinkToken: params.token },
      select: { id: true, locationId: true, expiresAt: true, customerId: true },
    });
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }
    if (gallery.expiresAt && new Date(gallery.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Gallery expired" }, { status: 410 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, galleryId: gallery.id },
      select: { id: true },
    });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found in this gallery" }, { status: 404 });
    }

    const priceEur = await getPrice("retouch_credit", gallery.locationId);
    const priceInCents = Math.round(priceEur * 100);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/gallery/${params.token}?retouch=success&photo=${photoId}`;
    const cancelUrl = `${appUrl}/gallery/${params.token}`;

    const presetLabels: Record<string, string> = {
      auto: "Auto Enhance",
      warm: "Warm Tone",
      cool: "Cool Tone",
      vibrant: "Vibrant",
      portrait: "Portrait",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceInCents,
            product_data: {
              name: `AI Retouch — ${presetLabels[preset] || preset}`,
              description: `Professional AI enhancement for your photo`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "retouch_credit",
        galleryToken: params.token,
        galleryId: gallery.id,
        photoId,
        preset,
        customerId: gallery.customerId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[retouch/purchase] Error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
