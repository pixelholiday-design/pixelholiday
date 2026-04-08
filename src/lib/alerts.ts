import { prisma } from "@/lib/db";

export type Alert = {
  id: string;
  severity: "RED" | "YELLOW" | "GREEN";
  title: string;
  body: string;
  category: "REVENUE" | "STAFF" | "CASH" | "TRAINING" | "OPPORTUNITY" | "CONTRACT" | "ROTATION" | "OPS";
  locationId?: string | null;
  actionHref?: string;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysAhead(n: number) {
  return new Date(Date.now() + n * 24 * 3600 * 1000);
}
function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Compute pain-point alerts for a given scope (all locations or one).
 * Returns up to ~15 alerts sorted by severity.
 */
export async function computeAlerts({ locationId }: { locationId?: string } = {}): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const todayStart = startOfToday();
  const weekStart = startOfWeek();

  const locWhere = locationId ? { id: locationId } : { isActive: true };
  const locations = await prisma.location.findMany({ where: locWhere });

  // ── REVENUE: today's revenue vs target per location ─────────────
  for (const loc of locations) {
    if (!loc.targetDailyRevenue) continue;
    const ordersAgg = await prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: todayStart },
        gallery: { locationId: loc.id },
      },
    });
    const todayRev = ordersAgg._sum.amount ?? 0;
    const pct = loc.targetDailyRevenue > 0 ? todayRev / loc.targetDailyRevenue : 1;
    if (pct < 0.6) {
      alerts.push({
        id: `rev-${loc.id}`,
        severity: "RED",
        title: `${loc.name} revenue is ${(pct * 100).toFixed(0)}% of target`,
        body: `€${todayRev.toFixed(0)} booked vs €${loc.targetDailyRevenue.toFixed(0)} target — capture rate likely dropped.`,
        category: "REVENUE",
        locationId: loc.id,
        actionHref: "/admin/dashboard",
      });
    }
  }

  // ── STAFF: photographers with conversion < 50% this week ──────
  const photogs = await prisma.user.findMany({
    where: { role: "PHOTOGRAPHER", ...(locationId ? { locationId } : {}) },
    include: {
      galleries: {
        where: { createdAt: { gte: weekStart } },
        select: { purchasedCount: true },
      },
    },
  });
  const lowPerf = photogs
    .map((p) => {
      const uploaded = p.galleries.length;
      const sold = p.galleries.filter((g) => g.purchasedCount > 0).length;
      return { name: p.name, uploaded, rate: uploaded ? sold / uploaded : 1 };
    })
    .filter((p) => p.uploaded > 0 && p.rate < 0.5);
  if (lowPerf.length) {
    alerts.push({
      id: "staff-lowconv",
      severity: "YELLOW",
      title: `${lowPerf.length} photographer${lowPerf.length === 1 ? "" : "s"} below 50% conversion this week`,
      body: lowPerf
        .slice(0, 3)
        .map((p) => `${p.name} (${(p.rate * 100).toFixed(0)}%)`)
        .join(", "),
      category: "STAFF",
      actionHref: "/admin/staff",
    });
  }

  // ── CASH: unresolved discrepancies ─────────────────────────────
  const discreps = await prisma.cashRegister.findMany({
    where: {
      ...(locationId ? { locationId } : {}),
      status: "DISCREPANCY",
    },
    include: { location: true },
    take: 5,
  });
  for (const d of discreps) {
    alerts.push({
      id: `cash-${d.id}`,
      severity: "RED",
      title: `${d.location.name} cash register has €${d.discrepancy?.toFixed(0) ?? "?"} discrepancy`,
      body: `Unresolved since ${new Date(d.updatedAt).toLocaleDateString()} — reconcile before next shift.`,
      category: "CASH",
      locationId: d.locationId,
      actionHref: "/admin/cash",
    });
  }

  // ── TRAINING: overdue assignments ──────────────────────────────
  const overdue = await prisma.trainingAssignment.count({
    where: {
      status: { not: "completed" },
      dueDate: { lt: new Date() },
      ...(locationId ? { user: { locationId } } : {}),
    },
  });
  if (overdue > 0) {
    alerts.push({
      id: "train-overdue",
      severity: "YELLOW",
      title: `${overdue} overdue training module${overdue === 1 ? "" : "s"}`,
      body: "Staff have passed the due date without completing assigned training.",
      category: "TRAINING",
      actionHref: "/admin/academy",
    });
  }

  // ── ROTATION: active zone assignments exceeding rotationHours ──
  const zones = await prisma.zoneAssignment.findMany({
    where: { endedAt: null, ...(locationId ? { locationId } : {}) },
    include: { photographer: { select: { name: true } } },
  });
  for (const z of zones) {
    const loc = locations.find((l) => l.id === z.locationId);
    const rotHours = loc?.rotationHours ?? 3;
    const elapsedH = (Date.now() - new Date(z.startedAt).getTime()) / 3600000;
    if (elapsedH > rotHours) {
      alerts.push({
        id: `rot-${z.id}`,
        severity: "YELLOW",
        title: `${z.photographer.name} at ${z.zoneName} for ${elapsedH.toFixed(1)}h — rotate now`,
        body: `Rotation policy: ${rotHours}h max. Move staff before fatigue/heat impacts sales.`,
        category: "ROTATION",
        locationId: z.locationId,
        actionHref: "/admin/zones",
      });
    }
  }

  // ── CONTRACTS: expiring within 60 days ─────────────────────────
  const expiring = locations.filter(
    (l) => l.contractEndDate && new Date(l.contractEndDate).getTime() < daysAhead(60).getTime()
  );
  for (const l of expiring) {
    const daysLeft = Math.ceil((new Date(l.contractEndDate!).getTime() - Date.now()) / (24 * 3600 * 1000));
    alerts.push({
      id: `contract-${l.id}`,
      severity: daysLeft < 30 ? "RED" : "YELLOW",
      title: `${l.name} contract expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      body: "Schedule a renewal meeting with the partner.",
      category: "CONTRACT",
      locationId: l.id,
      actionHref: "/admin/franchise",
    });
  }

  // ── OPPORTUNITY: high-converting locations → scale up ──────────
  for (const loc of locations) {
    const weekGalls = await prisma.gallery.findMany({
      where: { locationId: loc.id, createdAt: { gte: weekStart } },
      select: { purchasedCount: true },
    });
    if (weekGalls.length >= 10) {
      const sold = weekGalls.filter((g) => g.purchasedCount > 0).length;
      const rate = sold / weekGalls.length;
      if (rate >= 0.9) {
        alerts.push({
          id: `opp-${loc.id}`,
          severity: "GREEN",
          title: `${loc.name} converting at ${(rate * 100).toFixed(0)}% this week`,
          body: "Strong demand — consider adding a second photographer or extending hours.",
          category: "OPPORTUNITY",
          locationId: loc.id,
        });
      }
    }
  }

  // sort RED → YELLOW → GREEN
  const order = { RED: 0, YELLOW: 1, GREEN: 2 } as const;
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  return alerts.slice(0, 15);
}
