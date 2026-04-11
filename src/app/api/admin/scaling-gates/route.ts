export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sessionOrgId = (session.user as any).orgId;
  const orgId = sessionOrgId || req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const gates = await prisma.scalingGate.findMany({
    where: { orgId },
    orderBy: { gateNumber: "asc" },
  });
  return NextResponse.json({ gates });
}
