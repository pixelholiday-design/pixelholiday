import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { CARD_PRICING, getTemplateById, type CardQuantity } from "@/lib/card-templates";

const schema = z.object({
  cardType: z.enum(["greeting", "postcard", "thank_you", "holiday", "birthday"]),
  templateId: z.string().min(1),
  photoId: z.string().min(1),
  frontText: z.string().max(500).default(""),
  backText: z.string().max(500).default(""),
  quantity: z.union([z.literal(10), z.literal(20)]),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { cardType, templateId, photoId, frontText, backText, quantity } = parsed.data;

    // Validate template exists
    const template = getTemplateById(templateId);
    if (!template || template.type !== cardType) {
      return NextResponse.json({ error: "Invalid template for this card type" }, { status: 400 });
    }

    const gallery = await prisma.gallery.findUnique({
      where: { magicLinkToken: params.token },
      select: { id: true, expiresAt: true, customerId: true },
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

    const priceInCents = CARD_PRICING[quantity as CardQuantity];
    const priceLabel = quantity === 10 ? "10-Pack" : "20-Pack";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/gallery/${params.token}?cards=success&qty=${quantity}`;
    const cancelUrl = `${appUrl}/gallery/${params.token}/card-designer`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceInCents,
            product_data: {
              name: `Custom Photo Cards — ${priceLabel}`,
              description: `${quantity} ${template.name} ${cardType.replace("_", " ")} cards`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "card_order",
        galleryToken: params.token,
        galleryId: gallery.id,
        photoId,
        cardType,
        templateId,
        frontText: frontText.slice(0, 200),
        backText: backText.slice(0, 200),
        quantity: String(quantity),
        customerId: gallery.customerId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[card-order] Error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
