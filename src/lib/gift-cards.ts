/**
 * Gift Cards & Store Credits — helper functions.
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

  // Generate a unique code — retry if collision (extremely unlikely)
  let code = generateGiftCardCode();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.giftCard.findUnique({ where: { code } });
    if (!exists) break;
    code = generateGiftCardCode();
    attempts++;
  }

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
    },
  });

  return card;
}

// ── Redeem ────────────────────────────────────

export interface RedeemResult {
  success: boolean;
  remainingBalance: number;
  error?: string;
}

export async function redeemGiftCard(
  code: string,
  amount: number,
): Promise<RedeemResult> {
  const card = await prisma.giftCard.findUnique({ where: { code } });

  if (!card) {
    return { success: false, remainingBalance: 0, error: "Gift card not found" };
  }
  if (!card.isActive) {
    return { success: false, remainingBalance: card.balance, error: "Gift card is inactive" };
  }
  if (card.expiresAt && card.expiresAt.getTime() < Date.now()) {
    return { success: false, remainingBalance: card.balance, error: "Gift card has expired" };
  }
  if (amount <= 0) {
    return { success: false, remainingBalance: card.balance, error: "Amount must be positive" };
  }
  if (amount > card.balance) {
    return {
      success: false,
      remainingBalance: card.balance,
      error: `Insufficient balance. Available: ${card.currency} ${card.balance.toFixed(2)}`,
    };
  }

  const newBalance = Math.round((card.balance - amount) * 100) / 100;

  await prisma.giftCard.update({
    where: { code },
    data: {
      balance: newBalance,
      // Deactivate if fully redeemed
      isActive: newBalance > 0,
    },
  });

  return { success: true, remainingBalance: newBalance };
}

// ── Check Balance ─────────────────────────────

export interface BalanceInfo {
  code: string;
  balance: number;
  currency: string;
  amount: number;
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
    expiresAt: card.expiresAt,
    isActive: card.isActive,
    type: card.type,
  };
}

// ── Bulk Create ───────────────────────────────

export async function bulkCreateGiftCards(
  count: number,
  amount: number,
  currency: string = "EUR",
  locationId?: string,
) {
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
