import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SUBSCRIPTION_TIERS, type Tier, checkUploadLimit, checkGalleryLimit } from "@/lib/subscriptions";
import { stripe } from "@/lib/stripe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const photoCount = await prisma.photo.count({
    where: { gallery: { location: { orgId } }, createdAt: { gte: startOfMonth } },
  }).catch(() => 0);
  const activeGalleries = await prisma.gallery.count({
    where: { location: { orgId }, status: { in: ["HOOK_ONLY", "PREVIEW_ECOM", "PARTIAL_PAID"] } },
  }).catch(() => 0);

  const tier = (org.subscriptionTier as Tier) || "STARTER";
  return NextResponse.json({
    tier,
    config: SUBSCRIPTION_TIERS[tier],
    usage: { photosThisMonth: photoCount, activeGalleries },
    limits: {
      photos: checkUploadLimit(tier, photoCount, 0),
      galleries: checkGalleryLimit(tier, activeGalleries),
    },
    commissionRate: org.saasCommissionRate,
  });
}

export async function POST(req: Request) {
  // Update tier (mock Stripe subscription create)
  try {
    const { orgId, tier } = await req.json();
    if (!SUBSCRIPTION_TIERS[tier as Tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { subscriptionTier: tier },
    });

    // Mock: in production, create Stripe subscription
    let stripeSubId: string | null = null;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_xxx") {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{ price_data: {
            currency: "usd",
            product_data: { name: `PixelHoliday ${tier}` },
            unit_amount: SUBSCRIPTION_TIERS[tier as Tier].priceMonthly,
            recurring: { interval: "month" },
          }, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/my-dashboard?sub=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup`,
          metadata: { orgId, tier },
        });
        stripeSubId = session.id;
      } catch {}
    }

    return NextResponse.json({ ok: true, org, stripeSessionId: stripeSubId, mocked: !stripeSubId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
