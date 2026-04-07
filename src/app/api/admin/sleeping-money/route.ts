import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

const DEFAULT_CAMPAIGNS = [
  { type: "ABANDONED_CART_3D", name: "Abandoned cart — day 3", discountPct: 0.15, delayDays: 3, template: "Missing the sun? Get your memories now at 15% off." },
  { type: "SWEEP_UP_7D", name: "Partial-paid sweep — day 7", discountPct: 0.5, delayDays: 7, template: "Unlock the rest of your gallery for 50% off — last chance." },
];

async function ensureDefaultCampaigns() {
  const existing = await prisma.campaign.count();
  if (existing === 0) {
    for (const c of DEFAULT_CAMPAIGNS) await prisma.campaign.create({ data: c });
  }
}

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    await ensureDefaultCampaigns();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [allAuto, monthAuto, campaigns, recentAuto, abandonedCount] = await Promise.all([
      prisma.order.aggregate({ _sum: { amount: true }, _count: true, where: { isAutomatedSale: true } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { isAutomatedSale: true, createdAt: { gte: monthStart } } }),
      prisma.campaign.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.order.findMany({
        where: { isAutomatedSale: true },
        include: { customer: true, gallery: true },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.customer.count({ where: { cartAbandoned: true } }),
    ]);

    const conversionRate = allAuto._count > 0 ? 1 : 0; // simple proxy
    return NextResponse.json({
      summary: {
        totalRevenue: allAuto._sum.amount || 0,
        salesCount: allAuto._count,
        revenueThisMonth: monthAuto._sum.amount || 0,
        activeCampaigns: campaigns.filter((c) => c.enabled).length,
        pendingFollowups: abandonedCount,
        conversionRate,
      },
      campaigns,
      recent: recentAuto.map((o) => ({
        id: o.id,
        customer: o.customer.name,
        amount: o.amount,
        discountApplied: o.discountApplied,
        createdAt: o.createdAt,
        galleryToken: o.gallery.magicLinkToken,
      })),
    });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean().optional(),
  discountPct: z.number().min(0).max(1).optional(),
  delayDays: z.number().int().min(0).max(365).optional(),
  template: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { id, ...rest } = parsed.data;
    const updated = await prisma.campaign.update({ where: { id }, data: rest });
    return NextResponse.json({ ok: true, campaign: updated });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
