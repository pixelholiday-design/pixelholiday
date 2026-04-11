import { stripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function createConnectAccount(orgId: string, email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: { orgId },
    capabilities: {
      transfers: { requested: true },
    },
  });
  return account;
}

export async function createOnboardingLink(accountId: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/dashboard/payouts/onboard?refresh=true`,
    return_url: `${APP_URL}/dashboard/payouts/onboard?success=true`,
    type: "account_onboarding",
  });
  return link.url;
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    currentlyDue: account.requirements?.currently_due || [],
    pendingVerification: account.requirements?.pending_verification || [],
  };
}

export async function createTransfer(params: {
  amount: number;
  currency: string;
  destinationAccountId: string;
  description?: string;
}) {
  const transfer = await stripe.transfers.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency.toLowerCase(),
    destination: params.destinationAccountId,
    description: params.description,
  });
  return transfer;
}

export async function getBalance(accountId: string) {
  const balance = await stripe.balance.retrieve(
    undefined as any,
    { stripeAccount: accountId },
  );
  return balance;
}
