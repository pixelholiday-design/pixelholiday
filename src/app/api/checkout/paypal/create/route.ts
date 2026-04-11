import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOrder, isConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { galleryToken, amount, currency } = body;

  if (!galleryToken || !amount) {
    return NextResponse.json({ error: "galleryToken and amount required" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: galleryToken },
    include: { customer: true, photographer: true },
  });

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  if (gallery.status === "PAID" || gallery.status === "DIGITAL_PASS") {
    return NextResponse.json({ error: "Gallery already paid" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/gallery/${galleryToken}?paypal=success`;
  const cancelUrl = `${appUrl}/gallery/${galleryToken}?paypal=cancelled`;

  try {
    const order = await createOrder({
      amount: parseFloat(amount),
      currency: currency || "EUR",
      description: `Gallery photos — ${gallery.photographer?.name || "Fotiqo"}`,
      galleryId: gallery.id,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      approveUrl: order.approveUrl,
    });
  } catch (e: any) {
    console.error("PayPal create order error:", e.message);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
