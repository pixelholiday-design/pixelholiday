import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, galleryId, photographerId } = await req.json();

    if (!paymentIntentId || !galleryId || !photographerId) {
      return NextResponse.json(
        { error: "paymentIntentId, galleryId, and photographerId are required" },
        { status: 400 },
      );
    }

    // Verify payment succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${pi.status}` },
        { status: 400 },
      );
    }

    // Load gallery with customer
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { customer: true },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Check if order already exists for this gallery (idempotency)
    const existingOrder = await prisma.order.findUnique({ where: { galleryId } });
    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.id, note: "Order already exists" });
    }

    const amountEur = pi.amount / 100;
    const commissionRate = 0.10; // 10% photographer commission

    // Create Order + Commission in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          galleryId,
          customerId: gallery.customerId,
          amount: amountEur,
          currency: pi.currency.toUpperCase(),
          paymentMethod: "STRIPE_TERMINAL",
          stripePaymentId: paymentIntentId,
          status: "COMPLETED",
          items: {
            create: {
              type: "FULL_GALLERY",
              quantity: 1,
              unitPrice: amountEur,
            },
          },
        },
      });

      await tx.commission.create({
        data: {
          userId: photographerId,
          orderId: order.id,
          type: "PHOTO_SALE",
          amount: amountEur * commissionRate,
          rate: commissionRate,
          month: new Date().toISOString().slice(0, 7), // "2026-04"
        },
      });

      // Update gallery status
      await tx.gallery.update({
        where: { id: galleryId },
        data: { status: "PAID" },
      });

      return order;
    });

    return NextResponse.json({ success: true, orderId: result.id });
  } catch (err: any) {
    console.error("[terminal/confirm]", err);
    return NextResponse.json({ error: err.message || "Failed to confirm payment" }, { status: 500 });
  }
}
