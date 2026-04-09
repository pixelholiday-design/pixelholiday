import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

type AlertSeverity = "HIGH" | "MEDIUM" | "LOW";
type AlertType =
  | "CASH_DISCREPANCY"
  | "NO_SHOW_STAFF"
  | "POS_ANOMALY"
  | "EXCESSIVE_REFUNDS"
  | "OFF_HOURS_ACTIVITY";

interface FraudAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  locationId?: string;
  staffId?: string;
}

function makeId(type: string, suffix: string) {
  return `${type}_${suffix}_${Date.now()}`;
}

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }

  const alerts: FraudAlert[] = [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // ── 1. CASH DISCREPANCIES ─────────────────────────────────────────────────
  // Compare CashSession expected vs. actual handover amounts (>5% diff = flag)
  try {
    const cashSessions = await (prisma as any).cashSession?.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
      include: { location: { select: { id: true, name: true } } },
    });
    if (cashSessions?.length) {
      for (const session of cashSessions) {
        const expected = session.expectedAmount ?? session.totalCash ?? 0;
        const actual = session.handoverAmount ?? session.actualAmount ?? expected;
        if (expected > 0) {
          const diffPct = Math.abs(actual - expected) / expected;
          if (diffPct > 0.05) {
            alerts.push({
              id: makeId("CASH_DISCREPANCY", session.id),
              type: "CASH_DISCREPANCY",
              severity: diffPct > 0.15 ? "HIGH" : "MEDIUM",
              title: `Cash discrepancy at ${session.location?.name ?? session.locationId}`,
              description: `Expected €${expected.toFixed(2)}, received €${actual.toFixed(2)} (${(diffPct * 100).toFixed(1)}% difference).`,
              locationId: session.locationId,
              staffId: session.staffId,
            });
          }
        }
      }
    }
  } catch {}

  // Fallback: inspect Order cash totals vs. declared handover via CashHandover model
  try {
    const handovers = await (prisma as any).cashHandover?.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    });
    if (handovers?.length) {
      for (const h of handovers) {
        const expected = h.expectedAmount ?? 0;
        const actual = h.amount ?? h.actualAmount ?? expected;
        if (expected > 0) {
          const diffPct = Math.abs(actual - expected) / expected;
          if (diffPct > 0.05) {
            alerts.push({
              id: makeId("CASH_DISCREPANCY", h.id),
              type: "CASH_DISCREPANCY",
              severity: diffPct > 0.15 ? "HIGH" : "MEDIUM",
              title: `Cash handover discrepancy`,
              description: `Expected €${expected.toFixed(2)}, handed over €${actual.toFixed(2)} (${(diffPct * 100).toFixed(1)}% difference).`,
              locationId: h.locationId,
              staffId: h.staffId,
            });
          }
        }
      }
    }
  } catch {}

  // ── 2. NO-SHOW STAFF ──────────────────────────────────────────────────────
  // Staff with shifts today but no gallery uploads and no kiosk orders
  try {
    const shifts = await prisma.shift.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    for (const shift of shifts) {
      if (!["PHOTOGRAPHER", "SALES_STAFF"].includes(shift.user.role)) continue;
      try {
        const [galleryCount, orderCount] = await Promise.all([
          prisma.gallery.count({
            where: { photographerId: shift.userId, createdAt: { gte: todayStart, lte: todayEnd } },
          }),
          prisma.order.count({
            where: {
              createdAt: { gte: todayStart, lte: todayEnd },
              // SaleOrder / Order model — check via gallery photographer
              gallery: { photographerId: shift.userId },
            },
          }).catch(() => 0),
        ]);

        if (galleryCount === 0 && orderCount === 0) {
          alerts.push({
            id: makeId("NO_SHOW_STAFF", shift.userId),
            type: "NO_SHOW_STAFF",
            severity: "MEDIUM",
            title: `No activity from ${shift.user.name}`,
            description: `${shift.user.name} has a shift today but has no gallery uploads or sales recorded.`,
            locationId: shift.locationId,
            staffId: shift.userId,
          });
        }
      } catch {}
    }
  } catch {}

  // ── 3. POS ANOMALIES (high cash ratio) ───────────────────────────────────
  // >70% cash at a single location today → possible skimming
  try {
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd }, status: "COMPLETED" },
      select: { paymentMethod: true, gallery: { select: { locationId: true } } },
    });

    const locationMap = new Map<string, { cash: number; total: number }>();
    for (const o of orders) {
      const locId = o.gallery?.locationId;
      if (!locId) continue;
      if (!locationMap.has(locId)) locationMap.set(locId, { cash: 0, total: 0 });
      const entry = locationMap.get(locId)!;
      entry.total++;
      if (o.paymentMethod === "CASH") entry.cash++;
    }

    for (const [locId, counts] of Array.from(locationMap.entries())) {
      if (counts.total >= 5) {
        const ratio = counts.cash / counts.total;
        if (ratio > 0.7) {
          alerts.push({
            id: makeId("POS_ANOMALY", locId),
            type: "POS_ANOMALY",
            severity: ratio > 0.9 ? "HIGH" : "MEDIUM",
            title: `High cash ratio at location`,
            description: `${(ratio * 100).toFixed(0)}% of today's ${counts.total} transactions were cash (threshold: 70%). Possible skimming risk.`,
            locationId: locId,
          });
        }
      }
    }
  } catch {}

  // ── 4. EXCESSIVE REFUNDS ──────────────────────────────────────────────────
  // Staff who processed >3 refunds in a day
  try {
    const refunds = await prisma.order.findMany({
      where: { status: "REFUNDED", createdAt: { gte: todayStart, lte: todayEnd } },
      select: { id: true, gallery: { select: { photographerId: true, locationId: true } } },
    });

    const refundsByStaff = new Map<string, { count: number; locationId?: string }>();
    for (const r of refunds) {
      const staffId = r.gallery?.photographerId;
      if (!staffId) continue;
      if (!refundsByStaff.has(staffId)) {
        refundsByStaff.set(staffId, { count: 0, locationId: r.gallery?.locationId });
      }
      refundsByStaff.get(staffId)!.count++;
    }

    for (const [staffId, { count, locationId }] of Array.from(refundsByStaff.entries())) {
      if (count > 3) {
        alerts.push({
          id: makeId("EXCESSIVE_REFUNDS", staffId),
          type: "EXCESSIVE_REFUNDS",
          severity: count > 6 ? "HIGH" : "MEDIUM",
          title: `${count} refunds processed today`,
          description: `Staff member processed ${count} refunds today. This is above the 3-per-day threshold.`,
          locationId,
          staffId,
        });
      }
    }
  } catch {}

  // ── 5. OFF-HOURS ACTIVITY ─────────────────────────────────────────────────
  // Orders or gallery uploads created outside any shift hours for that staff member
  try {
    const recentGalleries = await prisma.gallery.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
      select: { id: true, photographerId: true, locationId: true, createdAt: true },
    });

    const shiftsToday = await prisma.shift.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
      select: { userId: true, startTime: true, endTime: true },
    });

    const shiftMap = new Map<string, { start: Date; end: Date }[]>();
    for (const s of shiftsToday) {
      if (!shiftMap.has(s.userId)) shiftMap.set(s.userId, []);
      shiftMap.get(s.userId)!.push({ start: s.startTime, end: s.endTime });
    }

    const flaggedStaff = new Set<string>();
    for (const g of recentGalleries) {
      const staffShifts = shiftMap.get(g.photographerId);
      if (!staffShifts || staffShifts.length === 0) continue; // no shift = don't flag (may be off day)
      const uploadTime = g.createdAt.getTime();
      const inShift = staffShifts.some(
        (s) => uploadTime >= s.start.getTime() && uploadTime <= s.end.getTime()
      );
      if (!inShift && !flaggedStaff.has(g.photographerId)) {
        flaggedStaff.add(g.photographerId);
        alerts.push({
          id: makeId("OFF_HOURS_ACTIVITY", g.photographerId),
          type: "OFF_HOURS_ACTIVITY",
          severity: "LOW",
          title: `Off-hours gallery upload detected`,
          description: `A gallery was uploaded at ${g.createdAt.toLocaleTimeString()} outside the staff member's scheduled shift hours.`,
          locationId: g.locationId,
          staffId: g.photographerId,
        });
      }
    }
  } catch {}

  // Sort by severity: HIGH → MEDIUM → LOW
  const severityOrder: Record<AlertSeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return NextResponse.json({ alerts });
}
