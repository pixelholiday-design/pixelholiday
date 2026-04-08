import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe, PRICES } from "@/lib/stripe";

const schema = z.object({
  galleryId: z.string().min(1),
  photoIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const gallery = await prisma.gallery.findUnique({
    where: { id: parsed.data.galleryId },
    include: { photos: true },
  });
  if (!gallery) return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });

  const validIds = new Set(gallery.photos.map((p) => p.id));
  const cleanIds = parsed.data.photoIds.filter((id) => validIds.has(id));
  if (cleanIds.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid photos" }, { status: 400 });
  }
  const isFull = cleanIds.length === gallery.photos.length;
  const amountCents = isFull ? PRICES.FULL_GALLERY : cleanIds.length * PRICES.SINGLE_PHOTO;

  if (!process.env.STRIPE_SECRET_KEY) {
    // Dev mode — return a fake QR/payment URL the kiosk UI can render.
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/${gallery.magicLinkToken}?qr=mock`;
    return NextResponse.json({
      ok: true,
      mocked: true,
      paymentUrl: url,
      amountCents,
      qrText: url,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: isFull ? "Full Gallery" : `${cleanIds.length} Photos` },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.magicLinkToken}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.magicLinkToken}`,
      metadata: {
        galleryId: gallery.id,
        magicLinkToken: gallery.magicLinkToken,
        kioskQR: "1",
        photoIds: cleanIds.join(","),
      },
    });
    return NextResponse.json({ ok: true, paymentUrl: session.url, qrText: session.url, amountCents });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Stripe error" }, { status: 502 });
  }
}
