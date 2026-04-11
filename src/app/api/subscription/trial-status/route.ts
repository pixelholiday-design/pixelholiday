import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, trialStartedAt: true, trialEndsAt: true, trialExpired: true },
  });

  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const now = new Date();
  const isActive = org.trialEndsAt && !org.trialExpired && new Date(org.trialEndsAt) > now;
  const daysRemaining = isActive
    ? Math.ceil((new Date(org.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return NextResponse.json({
    ok: true,
    trial: {
      isActive,
      daysRemaining,
      startedAt: org.trialStartedAt,
      endsAt: org.trialEndsAt,
      expired: org.trialExpired,
      currentPlan: org.plan,
    },
  });
}
