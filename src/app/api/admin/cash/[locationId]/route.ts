import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";
import { closeRegister, recomputeRegister } from "@/lib/cash";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { locationId: string } }) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reg = await prisma.cashRegister.findUnique({
      where: { locationId_date: { locationId: params.locationId, date: today } },
      include: {
        location: true,
        transactions: { orderBy: { createdAt: "desc" } },
        handovers: { orderBy: { createdAt: "desc" } },
        expenses: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!reg) return NextResponse.json({ register: null });
    await recomputeRegister(reg.id);
    const fresh = await prisma.cashRegister.findUnique({
      where: { id: reg.id },
      include: {
        location: true,
        transactions: { orderBy: { createdAt: "desc" } },
        handovers: { orderBy: { createdAt: "desc" } },
        expenses: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json({ register: fresh });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const closeSchema = z.object({
  registerId: z.string().min(1),
  actualBalance: z.number().nonnegative(),
});

export async function PATCH(req: Request) {
  try {
    const u = await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const body = await req.json().catch(() => ({}));
    const parsed = closeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const reg = await closeRegister(parsed.data.registerId, {
      actualBalance: parsed.data.actualBalance,
      closedBy: u.email,
    });
    return NextResponse.json({ ok: true, register: reg });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
