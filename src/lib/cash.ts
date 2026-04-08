import { prisma } from "@/lib/db";
import { CashRegisterStatus } from "@prisma/client";

/** Open a register for a location/today (idempotent). */
export async function openRegister(opts: { locationId: string; openingBalance: number; openedBy: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await prisma.cashRegister.findUnique({
    where: { locationId_date: { locationId: opts.locationId, date: today } },
  }).catch(() => null);
  if (existing) return existing;
  return prisma.cashRegister.create({
    data: {
      locationId: opts.locationId,
      date: today,
      openingBalance: opts.openingBalance,
      expectedBalance: opts.openingBalance,
      openedBy: opts.openedBy,
    },
  });
}

export async function recomputeRegister(id: string) {
  const reg = await prisma.cashRegister.findUnique({ where: { id }, include: { transactions: true, expenses: true } });
  if (!reg) return null;
  const cashIn = reg.transactions.filter((t) => t.type === "SALE").reduce((s, t) => s + t.amount, 0);
  const cashOut = reg.transactions.filter((t) => t.type === "CHANGE_GIVEN" || t.type === "REFUND").reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = reg.expenses.reduce((s, e) => s + e.amount, 0);
  const expected = reg.openingBalance + cashIn - cashOut - expenses;
  return prisma.cashRegister.update({
    where: { id },
    data: { totalCashIn: cashIn, totalCashOut: cashOut, totalExpenses: expenses, expectedBalance: expected },
  });
}

export async function closeRegister(id: string, opts: { actualBalance: number; closedBy: string }) {
  const reg = await recomputeRegister(id);
  if (!reg) throw new Error("Register not found");
  const discrepancy = opts.actualBalance - reg.expectedBalance;
  const status: CashRegisterStatus = Math.abs(discrepancy) > 5 ? "DISCREPANCY" : "RECONCILED";
  return prisma.cashRegister.update({
    where: { id },
    data: {
      actualBalance: opts.actualBalance,
      discrepancy,
      status,
      closedBy: opts.closedBy,
      closedAt: new Date(),
    },
  });
}
