import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe Connect webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const account = event.account;
  if (!account) {
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "account.updated": {
      const acct = event.data.object as any;
      const status = acct.payouts_enabled ? "ACTIVE" : acct.details_submitted ? "PENDING_VERIFICATION" : "PENDING";

      await prisma.organization.updateMany({
        where: { stripeConnectAccountId: account },
        data: {
          stripeConnectStatus: status,
          ...(status === "ACTIVE" ? { stripeConnectOnboardedAt: new Date() } : {}),
        },
      });
      break;
    }

    case "account.application.deauthorized": {
      await prisma.organization.updateMany({
        where: { stripeConnectAccountId: account },
        data: {
          stripeConnectStatus: "DEAUTHORIZED",
          stripeConnectAccountId: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
