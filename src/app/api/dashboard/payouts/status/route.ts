import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccountStatus } from "@/lib/stripe-connect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stripeConnectAccountId: true, stripeConnectStatus: true, stripeConnectOnboardedAt: true },
  });

  if (!org?.stripeConnectAccountId) {
    return NextResponse.json({
      ok: true,
      connected: false,
      status: null,
    });
  }

  try {
    const status = await getAccountStatus(org.stripeConnectAccountId);

    // Update status in DB if changed
    const newStatus = status.payoutsEnabled ? "ACTIVE" : status.detailsSubmitted ? "PENDING_VERIFICATION" : "PENDING";
    if (newStatus !== org.stripeConnectStatus) {
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          stripeConnectStatus: newStatus,
          ...(newStatus === "ACTIVE" && !org.stripeConnectOnboardedAt ? { stripeConnectOnboardedAt: new Date() } : {}),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      connected: true,
      status: {
        ...status,
        dbStatus: newStatus,
        onboardedAt: org.stripeConnectOnboardedAt,
      },
    });
  } catch (e: any) {
    console.error("Stripe Connect status error:", e.message);
    return NextResponse.json({ error: "Failed to check payout status" }, { status: 500 });
  }
}
