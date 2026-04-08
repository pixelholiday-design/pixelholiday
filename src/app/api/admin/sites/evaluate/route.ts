import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const b = await req.json();
  const totalScore =
    (b.trafficScore ?? 0) +
    (b.affluenceScore ?? 0) +
    (b.spaceScore ?? 0) +
    (b.partnerScore ?? 0) +
    (b.competitionScore ?? 0);
  const monthlyGross = (b.expectedTraffic ?? 0) * (b.expectedAOV ?? 0);
  const rentCeiling = monthlyGross * 0.2;
  const passed = totalScore >= 18;

  const evaluation = await prisma.siteEvaluation.create({
    data: {
      locationId: b.locationId ?? null,
      locationName: b.locationName ?? "Unnamed",
      evaluatedBy: b.evaluatedBy ?? null,
      trafficScore: b.trafficScore ?? 0,
      affluenceScore: b.affluenceScore ?? 0,
      spaceScore: b.spaceScore ?? 0,
      partnerScore: b.partnerScore ?? 0,
      competitionScore: b.competitionScore ?? 0,
      totalScore,
      passed,
      expectedTraffic: b.expectedTraffic ?? null,
      expectedAOV: b.expectedAOV ?? null,
      monthlyGross,
      rentCeiling,
      proposedRent: b.proposedRent ?? null,
      status: passed && (b.proposedRent ?? 0) <= rentCeiling ? "APPROVED" : "REVIEW",
    },
  });
  return NextResponse.json({ evaluation });
}
