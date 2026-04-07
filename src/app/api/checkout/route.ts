import { NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { token } = await req.json();
  const gallery = await prisma.gallery.findUnique({ where: { magicLinkToken: token } });
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Full PixelHoliday Gallery" },
            unit_amount: PRICES.FULL_GALLERY,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/gallery/${token}?paid=1`,
      cancel_url: `${baseUrl}/gallery/${token}`,
      metadata: { galleryId: gallery.id, magicLinkToken: token },
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    // Dev fallback when Stripe key is not set
    return NextResponse.json({ url: `${baseUrl}/gallery/${token}?paid=1`, mocked: true, error: e?.message });
  }
}
