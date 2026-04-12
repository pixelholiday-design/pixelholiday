import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({ where: { id: orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profiles = await prisma.staffProfile.findMany({
    where: { companyId: org.id, isActive: true },
    include: {
      user: { select: { name: true, role: true } },
      performanceReviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { performanceScore: "desc" },
  });

  const leaderboard = profiles.map((p) => ({
    id: p.id,
    name: p.user.name,
    role: p.user.role,
    designation: p.designation,
    level: p.level,
    performanceScore: p.performanceScore,
    isTopPerformer: p.isTopPerformer,
    needsTraining: p.needsTraining,
    needsCoaching: p.needsCoaching,
    onProbation: p.onProbation,
    lastReview: p.performanceReviews[0] || null,
  }));

  const topPerformers = leaderboard.filter((p) => p.performanceScore && p.performanceScore >= 80).length;
  const needsAttention = leaderboard.filter((p) => p.needsTraining || p.needsCoaching || p.onProbation).length;
  const avgScore = leaderboard.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / (leaderboard.length || 1);

  return NextResponse.json({
    leaderboard,
    stats: { total: leaderboard.length, topPerformers, needsAttention, avgScore: Math.round(avgScore) },
  });
}
