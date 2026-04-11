import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SUBSCRIPTION_TIERS, SAAS_COMMISSION_RATE, type Tier } from "@/lib/subscriptions";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, tier } = await req.json();
    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const t: Tier = SUBSCRIPTION_TIERS[tier as Tier] ? tier : "STARTER";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // Try with trial fields first; fall back without them if columns don't exist yet
    let org;
    try {
      org = await prisma.organization.create({
        data: {
          name: businessName,
          type: "HEADQUARTERS",
          subscriptionTier: t,
          saasCommissionRate: SAAS_COMMISSION_RATE,
          sleepingMoneyShare: 0.5,
          trialStartedAt: now,
          trialEndsAt: trialEnd,
          trialExpired: false,
        },
      });
    } catch {
      org = await prisma.organization.create({
        data: {
          name: businessName,
          type: "HEADQUARTERS",
          subscriptionTier: t,
          saasCommissionRate: SAAS_COMMISSION_RATE,
          sleepingMoneyShare: 0.5,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CEO",
        orgId: org.id,
      },
    });

    return NextResponse.json({ ok: true, orgId: org.id, userId: user.id, tier: t });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Signup failed" }, { status: 500 });
  }
}
