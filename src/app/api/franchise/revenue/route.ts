import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get("orgId");
    const where = orgId ? { type: "FRANCHISE" as const, id: orgId } : { type: "FRANCHISE" as const };
    const orgs = await prisma.organization.findMany({ where });
    const summary = await Promise.all(
      orgs.map(async (o) => {
        const orders = await prisma.order.findMany({
          where: { gallery: { location: { orgId: o.id } }, status: "COMPLETED" },
        });
        const total = orders.reduce((s, x) => s + x.amount, 0);
        const sleeping = orders.filter((x) => x.isAutomatedSale).reduce((s, x) => s + x.amount, 0);
        return {
          orgId: o.id,
          name: o.name,
          totalRevenue: total,
          saasCommission: total * o.saasCommissionRate,
          sleepingMoneyShare: sleeping * o.sleepingMoneyShare,
          totalOwed: total * o.saasCommissionRate + sleeping * o.sleepingMoneyShare,
        };
      })
    );
    return NextResponse.json(summary);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
