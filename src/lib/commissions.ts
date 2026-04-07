import { prisma } from "./db";
import type { CommissionType } from "@prisma/client";

const RATES: Record<CommissionType, number> = {
  PHOTO_SALE: 0.10,
  DIGITAL_PASS_SALE: 0.15,
  APPOINTMENT_BOOKING: 0.05,
  QR_REFERRAL: 0.05,
  SLEEPING_MONEY: 0.20,
};

export async function recordCommission(opts: {
  userId: string;
  orderId: string;
  type: CommissionType;
  amount: number;
}) {
  const rate = RATES[opts.type];
  const month = new Date().toISOString().slice(0, 7);
  return prisma.commission.create({
    data: {
      userId: opts.userId,
      orderId: opts.orderId,
      type: opts.type,
      amount: opts.amount * rate,
      rate,
      month,
    },
  });
}
