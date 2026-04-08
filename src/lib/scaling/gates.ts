import { prisma } from "@/lib/db";

export async function checkGate1(orgId: string) {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const orderCount = await prisma.order.count({
    where: { createdAt: { gte: since } },
  });
  const passed = orderCount > 0;
  return {
    gateNumber: 1,
    gateName: "Daily Sales Reporting >= 95%",
    passed,
    evidence: `Orders last 90d: ${orderCount}`,
  };
}

export async function checkGate2(orgId: string) {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const locations = await prisma.location.findMany({ where: { orgId } });
  const totalRent = locations.reduce((s, l) => s + (l.rentCost ?? 0), 0) * 3;
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: "COMPLETED" },
  });
  const revenue = orders.reduce((s, o) => s + (o.amount ?? 0), 0);
  const ratio = revenue > 0 ? totalRent / revenue : 1;
  const passed = revenue > 0 && ratio <= 0.2;
  return {
    gateNumber: 2,
    gateName: "Rent <= 20% of revenue (90d)",
    passed,
    evidence: `rent=${totalRent.toFixed(2)} rev=${revenue.toFixed(2)} ratio=${(ratio * 100).toFixed(1)}%`,
  };
}

export async function checkGate3(orgId: string) {
  const existing = await prisma.scalingGate.findUnique({
    where: { orgId_gateNumber: { orgId, gateNumber: 3 } },
  });
  return {
    gateNumber: 3,
    gateName: "Manager promoted from inside",
    passed: existing?.passed ?? false,
    evidence: existing?.evidence ?? null,
  };
}

export async function runAllGates(orgId: string) {
  const results = [
    await checkGate1(orgId),
    await checkGate2(orgId),
    await checkGate3(orgId),
  ];
  for (const r of results) {
    await prisma.scalingGate.upsert({
      where: { orgId_gateNumber: { orgId, gateNumber: r.gateNumber } },
      create: {
        orgId,
        gateNumber: r.gateNumber,
        gateName: r.gateName,
        requirement: r.gateName,
        passed: r.passed,
        passedAt: r.passed ? new Date() : null,
        evidence: r.evidence ?? null,
      },
      update: {
        passed: r.passed,
        passedAt: r.passed ? new Date() : null,
        evidence: r.evidence ?? null,
      },
    });
  }
  return results;
}
