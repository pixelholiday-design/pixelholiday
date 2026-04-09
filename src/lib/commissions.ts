import { prisma } from "./db";
import type { CommissionType } from "@prisma/client";

// ── Constants ────────────────────────────────────
// Stripe fee structure (standard EU pricing)
const STRIPE_PERCENTAGE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 0.30;  // €0.30

// Fallback rates used if no location is attached or commissionType is FLAT with no override.
const DEFAULT_RATES: Record<CommissionType, number> = {
  PHOTO_SALE: 0.10,
  DIGITAL_PASS_SALE: 0.15,
  APPOINTMENT_BOOKING: 0.05,
  QR_REFERRAL: 0.05,
  SLEEPING_MONEY: 0.20,
  ATTENDANCE_BONUS: 0,
  PACKAGE_BOOKING: 0.08,
};

/**
 * Calculate Stripe processing fee for a given amount.
 * Returns 0 for cash transactions.
 */
export function calculateStripeFee(amount: number, paymentMethod?: string): number {
  if (!paymentMethod || paymentMethod === "CASH") return 0;
  return Math.round((amount * STRIPE_PERCENTAGE + STRIPE_FIXED_FEE) * 100) / 100;
}

/**
 * Calculate net amount after Stripe fees.
 */
export function calculateNetAmount(amount: number, paymentMethod?: string): number {
  const fee = calculateStripeFee(amount, paymentMethod);
  return Math.round((amount - fee) * 100) / 100;
}

/**
 * Compute the commission amount + rate for an order at a given location,
 * honoring the location's commissionType (FLAT / TIERED / TEAM_POOL).
 *
 * CRITICAL FIX: Commission is now calculated on NET amount (after Stripe fees),
 * not on gross. This prevents margin erosion where we'd pay out more in
 * commissions than we actually received.
 */
export async function calculateLocationCommission(
  orderId: string,
  type: CommissionType,
): Promise<{ amount: number; rate: number; grossAmount: number; netAmount: number }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gallery: { include: { location: true } } },
  });
  if (!order) {
    const rate = DEFAULT_RATES[type];
    return { amount: 0, rate, grossAmount: 0, netAmount: 0 };
  }
  const location = order.gallery?.location;
  const grossAmount = order.amount ?? 0;
  const stripeFee = calculateStripeFee(grossAmount, order.paymentMethod);
  const netAmount = grossAmount - stripeFee;

  // Non-sale commission types use default rate on NET amount.
  if (
    type === "APPOINTMENT_BOOKING" ||
    type === "QR_REFERRAL" ||
    type === "ATTENDANCE_BONUS" ||
    type === "SLEEPING_MONEY"
  ) {
    const rate = DEFAULT_RATES[type];
    return {
      amount: Math.round(netAmount * rate * 100) / 100,
      rate,
      grossAmount,
      netAmount,
    };
  }

  if (!location) {
    const rate = DEFAULT_RATES[type];
    return {
      amount: Math.round(netAmount * rate * 100) / 100,
      rate,
      grossAmount,
      netAmount,
    };
  }

  const commissionType = location.commissionType ?? "FLAT";

  if (commissionType === "FLAT") {
    const rate = location.commissionRate ?? DEFAULT_RATES[type];
    return {
      amount: Math.round(netAmount * rate * 100) / 100,
      rate,
      grossAmount,
      netAmount,
    };
  }

  if (commissionType === "TIERED" || commissionType === "TEAM_POOL") {
    const t1 = location.tier1Threshold ?? 1000;
    const t2 = location.tier2Threshold ?? 2500;
    const r1 = location.tier1Rate ?? 0.03;
    const r2 = location.tier2Rate ?? 0.07;
    const r3 = location.tier3Rate ?? 0.12;

    // Sum today's PAID orders at this location for true tiered logic.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAgg = await prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfDay },
        gallery: { locationId: location.id },
      },
      _sum: { amount: true },
    });
    const dayTotal = (todayAgg._sum.amount ?? 0) + grossAmount;

    let rate = r1;
    if (dayTotal > t2) rate = r3;
    else if (dayTotal > t1) rate = r2;

    return {
      amount: Math.round(netAmount * rate * 100) / 100,
      rate,
      grossAmount,
      netAmount,
    };
  }

  const rate = DEFAULT_RATES[type];
  return {
    amount: Math.round(netAmount * rate * 100) / 100,
    rate,
    grossAmount,
    netAmount,
  };
}

/**
 * Record a commission with full financial tracking.
 * Commission amount is calculated on NET revenue (after Stripe fees).
 */
export async function recordCommission(opts: {
  userId: string;
  orderId: string;
  type: CommissionType;
  amount: number; // gross sale amount (kept for API compat, recalculated internally)
  bookingId?: string;
  notes?: string;
}) {
  let amount: number;
  let rate: number;
  let grossAmount: number;
  let netAmount: number;

  try {
    const calc = await calculateLocationCommission(opts.orderId, opts.type);
    amount = calc.amount;
    rate = calc.rate;
    grossAmount = calc.grossAmount;
    netAmount = calc.netAmount;
  } catch {
    rate = DEFAULT_RATES[opts.type];
    // Fallback: estimate net from gross
    grossAmount = opts.amount;
    netAmount = calculateNetAmount(opts.amount, "STRIPE_ONLINE");
    amount = Math.round(netAmount * rate * 100) / 100;
  }

  const month = new Date().toISOString().slice(0, 7);
  return prisma.commission.create({
    data: {
      userId: opts.userId,
      orderId: opts.orderId,
      bookingId: opts.bookingId ?? null,
      type: opts.type,
      grossAmount,
      netAmount,
      amount,
      rate,
      status: "PENDING",
      month,
      notes: opts.notes ?? null,
    },
  });
}

/**
 * Record a marketplace booking commission.
 * Platform takes 10% of total booking price.
 */
export async function recordMarketplaceCommission(opts: {
  bookingId: string;
  photographerId: string;
  totalPrice: number;
  paymentMethod?: string;
}) {
  const MARKETPLACE_FEE_RATE = 0.10; // 10%
  const stripeFee = calculateStripeFee(opts.totalPrice, opts.paymentMethod || "STRIPE_ONLINE");
  const netAmount = opts.totalPrice - stripeFee;
  const platformFee = Math.round(opts.totalPrice * MARKETPLACE_FEE_RATE * 100) / 100;
  const photographerPayout = Math.round((netAmount - platformFee) * 100) / 100;

  const month = new Date().toISOString().slice(0, 7);

  // Update the booking with calculated fees
  await prisma.marketplaceBooking.update({
    where: { id: opts.bookingId },
    data: {
      platformFeeRate: MARKETPLACE_FEE_RATE,
      platformFee,
      photographerPayout,
      stripeFee,
    },
  });

  return { platformFee, photographerPayout, stripeFee, netAmount };
}

/**
 * Reverse commissions for a refund.
 * Handles both full and partial refunds correctly.
 * - Full refund: reverses all unpaid commissions, creates adjustment for paid ones
 * - Partial refund: creates proportional negative adjustment
 */
export async function reverseCommissions(opts: {
  orderId: string;
  refundAmount: number;
  orderTotal: number;
  isFullRefund: boolean;
}) {
  const commissions = await prisma.commission.findMany({
    where: { orderId: opts.orderId },
  });

  if (commissions.length === 0) return;

  if (opts.isFullRefund) {
    // Full refund: zero out unpaid, create reversal for paid
    for (const c of commissions) {
      if (!c.isPaid) {
        await prisma.commission.update({
          where: { id: c.id },
          data: { amount: 0, status: "REVERSED", notes: "Full refund reversal" },
        });
      } else {
        // Commission was already paid — create a negative adjustment
        await prisma.commission.create({
          data: {
            userId: c.userId,
            orderId: c.orderId,
            bookingId: c.bookingId,
            type: c.type,
            grossAmount: -(c.grossAmount ?? 0),
            netAmount: -(c.netAmount ?? 0),
            amount: -c.amount,
            rate: c.rate,
            status: "ADJUSTED",
            month: new Date().toISOString().slice(0, 7),
            notes: `Reversal of paid commission ${c.id} due to full refund`,
          },
        });
      }
    }
  } else {
    // Partial refund: proportional reduction
    const refundRatio = opts.refundAmount / opts.orderTotal;
    for (const c of commissions) {
      const reduction = Math.round(c.amount * refundRatio * 100) / 100;
      if (!c.isPaid) {
        await prisma.commission.update({
          where: { id: c.id },
          data: {
            amount: Math.max(0, c.amount - reduction),
            notes: `Reduced by €${reduction.toFixed(2)} due to partial refund of €${opts.refundAmount.toFixed(2)}`,
          },
        });
      } else {
        // Create negative adjustment for the proportional amount
        await prisma.commission.create({
          data: {
            userId: c.userId,
            orderId: c.orderId,
            bookingId: c.bookingId,
            type: c.type,
            amount: -reduction,
            rate: c.rate,
            status: "ADJUSTED",
            month: new Date().toISOString().slice(0, 7),
            notes: `Partial refund adjustment: €${opts.refundAmount.toFixed(2)} of €${opts.orderTotal.toFixed(2)}`,
          },
        });
      }
    }
  }
}

/**
 * Record a package booking commission.
 * Platform takes 15% of total booking price for resort packages.
 */
export async function recordPackageBookingCommission(opts: {
  bookingId: string;
  photographerId: string;
  totalPrice: number;
  paymentMethod?: string;
}) {
  const PACKAGE_FEE_RATE = 0.15; // 15%
  const stripeFee = calculateStripeFee(opts.totalPrice, opts.paymentMethod || "STRIPE_ONLINE");
  const netAmount = opts.totalPrice - stripeFee;
  const platformFee = Math.round(opts.totalPrice * PACKAGE_FEE_RATE * 100) / 100;
  const photographerPayout = Math.round((netAmount - platformFee) * 100) / 100;

  // Update the booking with calculated fees
  await prisma.packageBooking.update({
    where: { id: opts.bookingId },
    data: {
      platformFeeRate: PACKAGE_FEE_RATE,
      platformFee,
      photographerPayout,
      stripeFee,
    },
  });

  return { platformFee, photographerPayout, stripeFee, netAmount };
}
