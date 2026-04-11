import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { captureOrder, isConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { orderId, galleryToken } = body;

  if (!orderId || !galleryToken) {
    return NextResponse.json({ error: "orderId and galleryToken required" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: galleryToken },
    select: { id: true, customerId: true, status: true },
  });

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  if (gallery.status === "PAID" || gallery.status === "DIGITAL_PASS") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  try {
    const capture = await captureOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", status: capture.status }, { status: 400 });
    }

    // Update gallery to PAID
    await prisma.gallery.update({
      where: { id: gallery.id },
      data: { status: "PAID" },
    });

    // Create order record
    await prisma.order.create({
      data: {
        galleryId: gallery.id,
        customerId: gallery.customerId,
        amount: capture.amount,
        currency: capture.currency,
        paymentMethod: "PAYPAL",
        status: "COMPLETED",
        stripePaymentId: `paypal_${capture.id}`, // Store PayPal ID in this field for reference
      },
    });

    return NextResponse.json({ ok: true, status: "COMPLETED" });
  } catch (e: any) {
    console.error("PayPal capture error:", e.message);
    return NextResponse.json({ error: "Failed to capture PayPal payment" }, { status: 500 });
  }
}
