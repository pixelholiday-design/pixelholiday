export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { computeAlerts } from "@/lib/alerts";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireStaff();
    const { searchParams } = new URL(req.url);
    let locationId = searchParams.get("locationId") || undefined;

    // Non-CEO/OPS users can only see alerts for their own location
    if (!["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
      const me = await prisma.user.findUnique({ where: { id: user.id }, select: { locationId: true } });
      locationId = me?.locationId ?? undefined;
    }

    const alerts = await computeAlerts({ locationId });
    return NextResponse.json({ alerts });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
