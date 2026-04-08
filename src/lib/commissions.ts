import { prisma } from "./db";
import type { CommissionType } from "@prisma/client";

// Fallback rates used if no location is attached or commissionType is FLAT with no override.
const DEFAULT_RATES: Record<CommissionType, number> = {
  PHOTO_SALE: 0.10,
  DIGITAL_PASS_SALE: 0.15,
  APPOINTMENT_BOOKING: 0.05,
  QR_REFERRAL: 0.05,
  SLEEPING_MONEY: 0.20,
  ATTENDANCE_BONUS: 0,
};

/**
 * Compute the commission amount + rate for an order at a given location,
 * honoring the location's commissionType (FLAT / TIERED / TEAM_POOL).
 *
 * Simplified TIERED: uses the single order's amount to pick a tier.
 * A full team-pool aggregation over the day can be layered on later.
 */
export async function calculateLocationCommission(
  orderId: string,
  type: CommissionType,
): Promise<{ amount: number; rate: number }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gallery: { include: { location: true } } },
  });
  if (!order) {
    const rate = DEFAULT_RATES[type];
    return { amount: order ? 0 : 0, rate };
  }
  const location = order.gallery?.location;
  const baseAmount = order.amount ?? 0;

  // Non-sale commission types still use default rate logic.
  if (
    type === "APPOINTMENT_BOOKING" ||
    type === "QR_REFERRAL" ||
    type === "ATTENDANCE_BONUS" ||
    type === "SLEEPING_MONEY"
  ) {
    const rate = DEFAULT_RATES[type];
    return { amount: baseAmount * rate, rate };
  }

  if (!location) {
    const rate = DEFAULT_RATES[type];
    return { amount: baseAmount * rate, rate };
  }

  const commissionType = location.commissionType ?? "FLAT";

  if (commissionType === "FLAT") {
    const rate = location.commissionRate ?? DEFAULT_RATES[type];
    return { amount: baseAmount * rate, rate };
  }

  if (commissionType === "TIERED" || commissionType === "TEAM_POOL") {
    // Tier boundaries and rates from the location, with sensible defaults.
    const t1 = location.tier1Threshold ?? 1000;
    const t2 = location.tier2Threshold ?? 2500;
    const r1 = location.tier1Rate ?? 0.03;
    const r2 = location.tier2Rate ?? 0.07;
    const r3 = location.tier3Rate ?? 0.12;

    // Sum today's PAID orders at this location (for true tiered / pool logic).
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
    const dayTotal = (todayAgg._sum.amount ?? 0) + baseAmount;

    let rate = r1;
    if (dayTotal > t2) rate = r3;
    else if (dayTotal > t1) rate = r2;

    return { amount: baseAmount * rate, rate };
  }

  const rate = DEFAULT_RATES[type];
  return { amount: baseAmount * rate, rate };
}

export async function recordCommission(opts: {
  userId: string;
  orderId: string;
  type: CommissionType;
  amount: number;
}) {
  // Use location-aware calculation when possible; fall back to default rate.
  let amount: number;
  let rate: number;
  try {
    const calc = await calculateLocationCommission(opts.orderId, opts.type);
    amount = calc.amount;
    rate = calc.rate;
  } catch {
    rate = DEFAULT_RATES[opts.type];
    amount = opts.amount * rate;
  }
  const month = new Date().toISOString().slice(0, 7);
  return prisma.commission.create({
    data: {
      userId: opts.userId,
      orderId: opts.orderId,
      type: opts.type,
      amount,
      rate,
      month,
    },
  });
}
