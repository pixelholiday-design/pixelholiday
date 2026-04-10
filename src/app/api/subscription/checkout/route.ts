import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/subscription";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["PRO", "STUDIO"]),
  interval: z.enum(["MONTHLY", "ANNUAL"]).default("ANNUAL"),
});

/**
 * POST /api/subscription/checkout — Create Stripe Checkout session for plan upgrade.
 * Returns a checkout URL to redirect the user to.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { plan, interval } = parsed.data;
  const planDef = PLANS[plan];
  const price = interval === "ANNUAL" ? planDef.annualPrice * 12 : planDef.monthlyPrice;
  const priceMonthly = interval === "ANNUAL" ? planDef.annualPrice : planDef.monthlyPrice;

  // Check if Stripe is configured
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("xxx")) {
    // Mock mode — update plan directly without payment
    await prisma.organization.update({
      where: { id: user.orgId },
      data: { plan, planInterval: interval, planStartedAt: new Date() },
    });
    return NextResponse.json({
      ok: true,
      mock: true,
      message: `Upgraded to ${plan} (${interval}). Stripe not configured — mock upgrade applied.`,
      plan,
      interval,
    });
  }

  // Create Stripe Checkout session
  try {
    const stripe = require("stripe")(stripeKey);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: priceMonthly * 100,
          recurring: { interval: interval === "ANNUAL" ? "year" : "month" },
          product_data: { name: `Fotiqo ${planDef.name}`, description: planDef.description },
        },
        quantity: 1,
      }],
      metadata: { orgId: user.orgId, plan, interval },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com"}/dashboard/settings?upgraded=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com"}/pricing`,
    });

    return NextResponse.json({ ok: true, url: checkoutSession.url });
  } catch (e: any) {
    console.error("[Subscription] Checkout error:", e.message);
    return NextResponse.json({ error: "Payment setup failed. Please try again." }, { status: 500 });
  }
}
