/**
 * Gift Cards & Store Credits — helper functions.
 *
 * ACCOUNTING RULES:
 * - Gift card purchase = DEFERRED REVENUE (liability, NOT income)
 * - Gift card redemption = REVENUE RECOGNITION (deferred → earned)
 * - Unredeemed balance after 12 months = BREAKAGE REVENUE (profit)
 * - Gift card refund = reduce liability
 *
 * Codes follow the format "PH-GIFT-XXXX-XXXX" where X is alphanumeric.
 * Cards can be GIFT, STORE_CREDIT, HOTEL_PACKAGE, or REFUND_CREDIT.
 */
import { prisma } from "@/lib/db";

// ── Code generation ───────────────────────────
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion

function randomSegment(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

export function generateGiftCardCode(): string {
  return `PH-GIFT-${randomSegment(4)}-${randomSegment(4)}`;
}

// ── Anti-fraud limits ─────────────────────────
const MAX_CARD_AMOUNT = 500;   // €500 max per card
const MAX_CARDS_PER_PURCHASE = 10; // Max 10 cards per bulk purchase

// ── Purchase ──────────────────────────────────
export interface PurchaseGiftCardInput {
  amount: number;
  currency?: string;
  purchasedBy?: string;
  locationId?: string;
  type?: string;
  expiresAt?: Date;
  stripeSessionId?: string;
}

export async function purchaseGiftCard(input: PurchaseGiftCardInput) {
  const {
    amount,
    currency = "EUR",
    purchasedBy,
    locationId,
    type = "GIFT",
    expiresAt,
    stripeSessionId,
  } = input;

  // Anti-fraud: enforce max amount
  if (amount > MAX_CARD_AMOUNT) {
    throw new Error(`Gift card amount cannot exceed €${MAX_CARD_AMOUNT}`);
  }
  if (amount <= 0) {
    throw new Error("Gift card amount must be positive");
  }

  // Generate a unique code — retry if collision (extremely unlikely)
  let code = generateGiftCardCode();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.giftCard.findUnique({ where: { code } });
    if (!exists) break;
    code = generateGiftCardCode();
    attempts++;
  }

  // NOTE: This is DEFERRED REVENUE. The amount is a liability until redeemed.
  // Do NOT count this as income. Revenue is only recognized on redemption.
  const card = await prisma.giftCard.create({
    data: {
      code,
      amount,
      balance: amount,
      currency: currency.toUpperCase(),
      purchasedBy: purchasedBy ?? null,
      locationId: locationId ?? null,
      type,
      expiresAt: expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
      isActive: true,
      stripeSessionId: stripeSessionId ?? null,
      totalRedeemed: 0,
    },
  });

  return card;
}

// ── Redeem ────────────────────────────────────
export interface RedeemResult {
  success: boolean;
  remainingBalance: number;
  amountRedeemed: number;
  revenueRecognized: number; // Amount moved from deferred to earned revenue
  error?: string;
}

export async function redeemGiftCard(
  code: string,
  amount: number,
  opts?: { orderId?: string; shopOrderId?: string; redeemedBy?: string },
): Promise<RedeemResult> {
  const card = await prisma.giftCard.findUnique({ where: { code } });

  if (!card) {
    return { success: false, remainingBalance: 0, amountRedeemed: 0, revenueRecognized: 0, error: "Gift card not found" };
  }
  if (!card.isActive) {
    return { success: false, remainingBalance: card.balance, amountRedeemed: 0, revenueRecognized: 0, error: "Gift card is inactive" };
  }
  if (card.expiresAt && card.expiresAt.getTime() < Date.now()) {
    return { success: false, remainingBalance: card.balance, amountRedeemed: 0, revenueRecognized: 0, error: "Gift card has expired" };
  }
  if (amount <= 0) {
    return { success: false, remainingBalance: card.balance, amountRedeemed: 0, revenueRecognized: 0, error: "Amount must be positive" };
  }
  if (amount > card.balance) {
    return {
      success: false,
      remainingBalance: card.balance,
      amountRedeemed: 0,
      revenueRecognized: 0,
      error: `Insufficient balance. Available: ${card.currency} ${card.balance.toFixed(2)}`,
    };
  }

  const newBalance = Math.round((card.balance - amount) * 100) / 100;
  const newTotalRedeemed = Math.round((card.totalRedeemed + amount) * 100) / 100;

  // Use a transaction to ensure atomicity of redemption + audit trail
  await prisma.$transaction([
    prisma.giftCard.update({
      where: { code },
      data: {
        balance: newBalance,
        totalRedeemed: newTotalRedeemed,
        isActive: newBalance > 0,
        redeemedBy: opts?.redeemedBy ?? card.redeemedBy,
      },
    }),
    // Create redemption audit record — this IS the revenue recognition event
    prisma.giftCardRedemption.create({
      data: {
        giftCardId: card.id,
        amount,
        orderId: opts?.orderId ?? null,
        shopOrderId: opts?.shopOrderId ?? null,
        redeemedBy: opts?.redeemedBy ?? null,
      },
    }),
  ]);

  return {
    success: true,
    remainingBalance: newBalance,
    amountRedeemed: amount,
    revenueRecognized: amount, // This amount moves from deferred → earned revenue
  };
}

// ── Check Balance ─────────────────────────────
export interface BalanceInfo {
  code: string;
  balance: number;
  currency: string;
  amount: number;
  totalRedeemed: number;
  expiresAt: Date | null;
  isActive: boolean;
  type: string;
}

export async function checkBalance(code: string): Promise<BalanceInfo | null> {
  const card = await prisma.giftCard.findUnique({ where: { code } });
  if (!card) return null;

  return {
    code: card.code,
    balance: card.balance,
    currency: card.currency,
    amount: card.amount,
    totalRedeemed: card.totalRedeemed,
    expiresAt: card.expiresAt,
    isActive: card.isActive,
    type: card.type,
  };
}

// ── Breakage Revenue Recognition ──────────────
/**
 * Process gift card breakage — recognize unredeemed balances as revenue
 * after expiry. Called by cron job monthly.
 *
 * Accounting: Expired unredeemed balance moves from deferred revenue to
 * breakage revenue (income). This is pure profit.
 */
export async function processBreakage(): Promise<{ processed: number; totalBreakage: number }> {
  const now = new Date();
  const expiredCards = await prisma.giftCard.findMany({
    where: {
      expiresAt: { lte: now },
      balance: { gt: 0 },
      breakageRecognized: false,
      isActive: true,
    },
  });

  let totalBreakage = 0;
  for (const card of expiredCards) {
    totalBreakage += card.balance;
    await prisma.giftCard.update({
      where: { id: card.id },
      data: {
        breakageRecognized: true,
        breakageAmount: card.balance,
        breakageDate: now,
        isActive: false,
      },
    });
  }

  return { processed: expiredCards.length, totalBreakage: Math.round(totalBreakage * 100) / 100 };
}

// ── Financial Summary ─────────────────────────
/**
 * Get gift card financial summary for reporting.
 * Returns deferred revenue (liability) and recognized revenue.
 */
export async function getGiftCardFinancials() {
  const [totalIssued, totalRedeemed, totalBreakage, activeCards] = await Promise.all([
    prisma.giftCard.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.giftCard.aggregate({ _sum: { totalRedeemed: true } }),
    prisma.giftCard.aggregate({ _sum: { breakageAmount: true }, where: { breakageRecognized: true } }),
    prisma.giftCard.aggregate({ _sum: { balance: true }, where: { isActive: true } }),
  ]);

  const totalIssuedAmount = totalIssued._sum.amount ?? 0;
  const totalRedeemedAmount = totalRedeemed._sum.totalRedeemed ?? 0;
  const totalBreakageAmount = totalBreakage._sum.breakageAmount ?? 0;
  const outstandingLiability = activeCards._sum.balance ?? 0;

  return {
    totalIssued: Math.round(totalIssuedAmount * 100) / 100,
    cardsIssued: totalIssued._count,
    totalRedeemed: Math.round(totalRedeemedAmount * 100) / 100, // Revenue recognized
    totalBreakage: Math.round(totalBreakageAmount * 100) / 100, // Breakage revenue
    outstandingLiability: Math.round(outstandingLiability * 100) / 100, // Deferred revenue (balance sheet)
    revenueRecognized: Math.round((totalRedeemedAmount + totalBreakageAmount) * 100) / 100,
  };
}

// ── Bulk Create ───────────────────────────────
export async function bulkCreateGiftCards(
  count: number,
  amount: number,
  currency: string = "EUR",
  locationId?: string,
) {
  if (count > MAX_CARDS_PER_PURCHASE) {
    throw new Error(`Cannot create more than ${MAX_CARDS_PER_PURCHASE} cards at once`);
  }
  if (amount > MAX_CARD_AMOUNT) {
    throw new Error(`Gift card amount cannot exceed €${MAX_CARD_AMOUNT}`);
  }

  const cards: { code: string; amount: number }[] = [];
  for (let i = 0; i < count; i++) {
    const card = await purchaseGiftCard({
      amount,
      currency,
      locationId,
      type: "HOTEL_PACKAGE",
      purchasedBy: "BULK_ISSUE",
    });
    cards.push({ code: card.code, amount: card.amount });
  }

  return cards;
}
