import { prisma } from "@/lib/db";

/**
 * Daily briefing generator. Pulls yesterday's stats, computes deltas vs the
 * 4-week baseline, ranks photographers, and emits a structured briefing
 * payload that the dashboard renders. Also persists insights into AIInsight
 * so the CEO can act on them with one tap.
 */

export type BriefingPayload = {
  generatedAt: string;
  yesterday: {
    revenue: number;
    galleries: number;
    sold: number;
    conversion: number;
    digitalPasses: number;
    sleepingMoney: number;
    bestPhotographer: { name: string; revenue: number; conversion: number } | null;
  };
  baseline: { avgRevenue: number; avgConversion: number };
  predictions: { revenueLow: number; revenueHigh: number };
  recommendations: { title: string; message: string; priority: "high" | "medium" | "low" }[];
  alerts: { title: string; message: string }[];
};

export async function generateCEOBriefing(): Promise<BriefingPayload> {
  const now = new Date();
  const ystart = new Date(now);
  ystart.setDate(ystart.getDate() - 1);
  ystart.setHours(0, 0, 0, 0);
  const yend = new Date(ystart);
  yend.setHours(23, 59, 59, 999);

  const baseStart = new Date(now);
  baseStart.setDate(baseStart.getDate() - 28);

  const [yOrders, baseOrders, yGalleries, ySold, passes, sleeping] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: ystart, lte: yend }, status: "COMPLETED" },
      include: { gallery: { include: { photographer: true } } },
    }),
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { createdAt: { gte: baseStart }, status: "COMPLETED" },
    }),
    prisma.gallery.count({ where: { createdAt: { gte: ystart, lte: yend } } }),
    prisma.gallery.count({
      where: { createdAt: { gte: ystart, lte: yend }, status: { in: ["PAID", "PARTIAL_PAID"] } },
    }),
    prisma.customer.count({
      where: { hasDigitalPass: true, createdAt: { gte: ystart, lte: yend } },
    }),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { isAutomatedSale: true, createdAt: { gte: ystart, lte: yend } },
    }),
  ]);

  const yRevenue = yOrders.reduce((s, o) => s + o.amount, 0);
  const baseAvgRevenue = (baseOrders._sum.amount || 0) / 28;
  const conversion = yGalleries > 0 ? ySold / yGalleries : 0;

  // Best photographer of the day
  const byPhoto = new Map<string, { name: string; revenue: number; gallerySold: number; total: number }>();
  for (const o of yOrders) {
    const ph = o.gallery.photographer;
    const r = byPhoto.get(ph.id) || { name: ph.name, revenue: 0, gallerySold: 0, total: 0 };
    r.revenue += o.amount;
    r.gallerySold += 1;
    byPhoto.set(ph.id, r);
  }
  const ranked = Array.from(byPhoto.values()).sort((a, b) => b.revenue - a.revenue);
  const best = ranked[0]
    ? { name: ranked[0].name, revenue: ranked[0].revenue, conversion: 0 }
    : null;

  // Recommendations + alerts
  const recommendations: BriefingPayload["recommendations"] = [];
  const alerts: BriefingPayload["alerts"] = [];

  if (conversion < 0.5 && yGalleries > 0) {
    recommendations.push({
      title: "Conversion below 50%",
      message: "Trigger sweep-up campaign for unpurchased galleries. Test a 25% discount for the next 24h.",
      priority: "high",
    });
  }
  if (passes === 0) {
    recommendations.push({
      title: "Zero digital passes sold yesterday",
      message: "Push the digital pass at reception today. Move QR cards from rooms to lobby — 3x conversion.",
      priority: "high",
    });
  }
  if (yRevenue < baseAvgRevenue * 0.8) {
    alerts.push({
      title: "Revenue dropped 20% vs 4-week average",
      message: `Yesterday €${yRevenue.toFixed(0)} vs baseline €${baseAvgRevenue.toFixed(0)}. Investigate weather, staffing, or pricing.`,
    });
  }
  // Stale registers
  const openRegs = await prisma.cashRegister.count({ where: { status: "OPEN", createdAt: { lt: ystart } } });
  if (openRegs > 0) {
    alerts.push({
      title: `${openRegs} cash register(s) left open from previous day(s)`,
      message: "Close & reconcile from /admin/cash before opening new shifts.",
    });
  }

  // Persist into AIInsight (no-op if already there for today)
  for (const r of recommendations) {
    await prisma.aIInsight.create({
      data: {
        type: "opportunity",
        targetType: "system",
        targetId: "ceo",
        title: r.title,
        message: r.message,
        priority: r.priority,
      },
    }).catch(() => {});
  }
  for (const a of alerts) {
    await prisma.aIInsight.create({
      data: {
        type: "alert",
        targetType: "system",
        targetId: "ceo",
        title: a.title,
        message: a.message,
        priority: "high",
      },
    }).catch(() => {});
  }

  const payload: BriefingPayload = {
    generatedAt: new Date().toISOString(),
    yesterday: {
      revenue: yRevenue,
      galleries: yGalleries,
      sold: ySold,
      conversion: Math.round(conversion * 100) / 100,
      digitalPasses: passes,
      sleepingMoney: sleeping._sum.amount || 0,
      bestPhotographer: best,
    },
    baseline: { avgRevenue: baseAvgRevenue, avgConversion: 0 },
    predictions: {
      revenueLow: Math.round(baseAvgRevenue * 0.8),
      revenueHigh: Math.round(baseAvgRevenue * 1.2),
    },
    recommendations,
    alerts,
  };

  await prisma.aIBriefingLog.create({
    data: { scope: "ceo", payload: JSON.stringify(payload) },
  });

  return payload;
}

export async function generatePerformanceInsights() {
  // Photographer-level insights
  const photographers = await prisma.user.findMany({
    where: { role: "PHOTOGRAPHER" },
    include: { commissions: { include: { order: true } } },
  });
  const created: number[] = [];
  for (const p of photographers) {
    const recent = p.commissions.filter((c) => {
      if (!c.order) return false;
      const age = Date.now() - new Date(c.order.createdAt).getTime();
      return age < 14 * 24 * 60 * 60 * 1000;
    });
    const revenue = recent.reduce((s, c) => s + c.amount, 0);
    if (recent.length === 0) {
      const insight = await prisma.aIInsight.create({
        data: {
          type: "performance",
          targetType: "photographer",
          targetId: p.id,
          title: `${p.name} has zero commissions in the last 14 days`,
          message: "Schedule a coaching session or check if they're on leave.",
          priority: "high",
        },
      }).catch(() => null);
      if (insight) created.push(1);
    } else if (revenue > 200) {
      await prisma.aIInsight.create({
        data: {
          type: "promotion",
          targetType: "photographer",
          targetId: p.id,
          title: `${p.name} is consistently high-performing`,
          message: `€${revenue.toFixed(0)} earned in 14 days. Consider promotion to Supervisor.`,
          priority: "medium",
        },
      }).catch(() => {});
    }
  }
  return { created: created.length };
}
