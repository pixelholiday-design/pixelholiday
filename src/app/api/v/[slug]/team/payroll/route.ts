import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (!["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({ where: { id: user.orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profiles = await prisma.staffProfile.findMany({
    where: { companyId: org.id, isActive: true },
    include: {
      user: { select: { name: true, role: true } },
      staffPayouts: { orderBy: { createdAt: "desc" }, take: 3 },
      staffCommissions: true,
      staffBonuses: true,
    },
  });

  const payroll = profiles.map((p) => ({
    id: p.id,
    name: p.user.name,
    role: p.user.role,
    designation: p.designation,
    salaryType: p.salaryType,
    salaryAmount: p.salaryAmount,
    salaryCurrency: p.salaryCurrency,
    commissionRate: p.commissionRate,
    recentPayouts: p.staffPayouts,
    commissionConfigs: p.staffCommissions,
    bonusTargets: p.staffBonuses,
  }));

  const totalMonthlySalary = profiles.reduce((sum, p) => sum + (p.salaryAmount || 0), 0);

  return NextResponse.json({
    payroll,
    stats: { totalStaff: profiles.length, totalMonthlySalary, currency: profiles[0]?.salaryCurrency || "EUR" },
  });
}
