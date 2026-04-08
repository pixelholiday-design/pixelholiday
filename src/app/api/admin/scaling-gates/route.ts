export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const gates = await prisma.scalingGate.findMany({
    where: { orgId },
    orderBy: { gateNumber: "asc" },
  });
  return NextResponse.json({ gates });
}
