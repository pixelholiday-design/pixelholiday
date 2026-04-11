import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createConnectAccount, createOnboardingLink } from "@/lib/stripe-connect";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  const email = session.user.email || "";

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripeConnectAccountId: true },
  });

  let accountId = org?.stripeConnectAccountId;

  if (!accountId) {
    try {
      const account = await createConnectAccount(orgId, email);
      accountId = account.id;
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          stripeConnectAccountId: accountId,
          stripeConnectStatus: "PENDING",
        },
      });
    } catch (e: any) {
      console.error("Stripe Connect account creation error:", e.message);
      return NextResponse.json({ error: "Failed to create payout account" }, { status: 500 });
    }
  }

  try {
    const url = await createOnboardingLink(accountId);
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("Stripe Connect onboarding link error:", e.message);
    return NextResponse.json({ error: "Failed to create onboarding link" }, { status: 500 });
  }
}
