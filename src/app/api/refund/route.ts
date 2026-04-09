import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { reverseCommissions } from "@/lib/commissions";

const schema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive().optional(), // partial refund; omit = full
  reason: z.string().max(500).optional(),
});

// Anti-fraud: max 3 refunds per customer per month
async function checkRefundLimit(customerId: string): Promise<boolean> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const refundCount = await prisma.order.count({
    where: {
      customerId,
      refundedAt: { gte: monthStart },
      refundedAmount: { gt: 0 },
    },
  });
  return refundCount < 3;
}

export async function POST(req: Request) {
  try {
    const session = await requireStaff();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { orderId, amount, reason } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { gallery: true, customer: true, commissions: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "REFUNDED") {
      return NextResponse.json({ error: "Order already refunded" }, { status: 409 });
    }

    // Anti-fraud: check refund frequency
    const withinLimit = await checkRefundLimit(order.customerId);
    if (!withinLimit) {
      return NextResponse.json({
        error: "Refund limit exceeded. Maximum 3 refunds per customer per month.",
      }, { status: 429 });
    }

    const remaining = order.amount - (order.refundedAmount || 0);
    const refundAmount = amount && amount > 0 ? Math.min(amount, remaining) : remaining;
    if (refundAmount <= 0) {
      return NextResponse.json({ error: "Nothing left to refund" }, { status: 409 });
    }

    let stripeRefundId: string | null = null;

    // Stripe online refund — use the PaymentIntent from the checkout session.
    if (order.paymentMethod === "STRIPE_ONLINE" && order.stripeSessionId) {
      try {
        const cs = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        const pi = typeof cs.payment_intent === "string" ? cs.payment_intent : cs.payment_intent?.id;
        if (!pi) throw new Error("No payment_intent on session");
        const refund = await stripe.refunds.create({
          payment_intent: pi,
          amount: Math.round(refundAmount * 100),
          reason: "requested_by_customer",
          metadata: { orderId, staffId: (session as any)?.user?.id || "unknown", reason: reason || "" },
        });
        stripeRefundId = refund.id;
      } catch (e: any) {
        return NextResponse.json({ error: `Stripe refund failed: ${e.message}` }, { status: 502 });
      }
    } else if (order.paymentMethod === "STRIPE_TERMINAL" && order.stripePaymentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentId,
          amount: Math.round(refundAmount * 100),
          reason: "requested_by_customer",
          metadata: { orderId, staffId: (session as any)?.user?.id || "unknown", reason: reason || "" },
        });
        stripeRefundId = refund.id;
      } catch (e: any) {
        return NextResponse.json({ error: `Stripe refund failed: ${e.message}` }, { status: 502 });
      }
    }
    // CASH refunds: no external call. The cash drawer transaction is recorded below.

    const newRefundedAmount = (order.refundedAmount || 0) + refundAmount;
    const isFull = Math.abs(newRefundedAmount - order.amount) < 0.005;

    // NOTE: Stripe does NOT refund their processing fee on refunds.
    // On a €100 sale: Stripe took ~€3.20. We refund €100. We lose €3.20.
    // This loss is tracked as a cost of doing business.
    const stripeFeeOnRefund = order.paymentMethod !== "CASH"
      ? Math.round(refundAmount * 0.029 * 100) / 100 + 0.30
      : 0;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundedAmount: newRefundedAmount,
        refundedAt: new Date(),
        refundReason: reason,
        refundedBy: (session as any)?.user?.id || null,
        stripeRefundId,
        status: isFull ? "REFUNDED" : order.status,
      },
    });

    // CRITICAL FIX: Reverse commissions correctly for BOTH full and partial refunds.
    // Old code only zeroed unpaid commissions on full refund.
    // New code also creates negative adjustments for already-paid commissions.
    if (order.commissions.length > 0) {
      await reverseCommissions({
        orderId,
        refundAmount,
        orderTotal: order.amount,
        isFullRefund: isFull,
      });
    }

    // Cash refund: log a REFUND transaction so the register reconciles.
    if (order.paymentMethod === "CASH") {
      try {
        const staffId = (session as any)?.user?.id || "system";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reg = await prisma.cashRegister.findFirst({
          where: { locationId: order.gallery.locationId, date: today, status: "OPEN" },
        });
        if (reg) {
          await prisma.cashTransaction.create({
            data: {
              cashRegisterId: reg.id,
              orderId,
              type: "REFUND",
              amount: refundAmount,
              staffId,
              staffPin: order.cashPin || "REFUND",
              description: `Refund order ${orderId}${reason ? ` — ${reason}` : ""}`,
            },
          });
          const { recomputeRegister } = await import("@/lib/cash");
          await recomputeRegister(reg.id);
        }
      } catch (e) {
        console.warn("Cash refund register update failed (non-fatal)", e);
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      refundedAmount: newRefundedAmount,
      isFullRefund: isFull,
      stripeRefundId,
      stripeFeeAbsorbed: stripeFeeOnRefund, // Surfaced so CEO can see the loss
      order: updated,
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("refund error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
