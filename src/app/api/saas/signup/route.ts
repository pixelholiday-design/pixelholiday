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

    const org = await prisma.organization.create({
      data: {
        name: businessName,
        type: "HEADQUARTERS",
        subscriptionTier: t,
        saasCommissionRate: SAAS_COMMISSION_RATE,
        sleepingMoneyShare: 0.5,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "CEO",
        orgId: org.id,
        pin: await bcrypt.hash(password, 10),
      },
    });

    return NextResponse.json({ ok: true, orgId: org.id, userId: user.id, tier: t });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Signup failed" }, { status: 500 });
  }
}
