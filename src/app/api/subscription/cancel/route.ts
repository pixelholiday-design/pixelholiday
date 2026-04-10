import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/subscription/cancel — Cancel subscription at period end.
 * Downgrades to Starter when current period expires.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const org = await prisma.organization.findUnique({ where: { id: user.orgId }, select: { stripeSubscriptionId: true, plan: true } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  if (org.plan === "STARTER") return NextResponse.json({ error: "Already on Starter plan" }, { status: 400 });

  // Cancel in Stripe if subscription exists
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && !stripeKey.includes("xxx") && org.stripeSubscriptionId) {
    try {
      const stripe = require("stripe")(stripeKey);
      await stripe.subscriptions.update(org.stripeSubscriptionId, { cancel_at_period_end: true });
    } catch (e: any) {
      console.warn("[Subscription] Cancel error:", e.message);
    }
  }

  // If no Stripe subscription (mock mode), downgrade immediately
  if (!org.stripeSubscriptionId) {
    await prisma.organization.update({
      where: { id: user.orgId },
      data: { plan: "STARTER", planInterval: null, planExpiresAt: null },
    });
  }

  return NextResponse.json({ ok: true, message: "Subscription cancelled. You'll be downgraded to Starter at the end of your billing period." });
}
