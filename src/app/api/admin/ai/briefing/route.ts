import { NextResponse } from "next/server";
import { generateCEOBriefing, generatePerformanceInsights } from "@/lib/ai/briefing";
import { requireRole, handleGuardError } from "@/lib/guards";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const last = await prisma.aIBriefingLog.findFirst({
      where: { scope: "ceo" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      briefing: last ? JSON.parse(last.payload) : null,
      generatedAt: last?.createdAt || null,
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const briefing = await generateCEOBriefing();
    const perf = await generatePerformanceInsights();
    return NextResponse.json({ ok: true, briefing, performanceInsights: perf });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
