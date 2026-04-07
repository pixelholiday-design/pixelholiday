import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";
import { openRegister } from "@/lib/cash";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registers = await prisma.cashRegister.findMany({
      where: { date: today },
      include: { location: true, transactions: { take: 5, orderBy: { createdAt: "desc" } }, handovers: true },
    });

    const allRegisters = await prisma.cashRegister.findMany({
      include: { location: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const totalCashIn = registers.reduce((s, r) => s + r.totalCashIn, 0);
    const totalCashOut = registers.reduce((s, r) => s + r.totalCashOut, 0);
    const totalExpenses = registers.reduce((s, r) => s + r.totalExpenses, 0);
    const pendingHandovers = await prisma.cashHandover.count({ where: { confirmedByReceiver: false } });

    // Cash vs Card vs Online breakdown (today)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const breakdown = await prisma.order.groupBy({
      by: ["paymentMethod"],
      where: { createdAt: { gte: monthStart }, status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    });

    const recent = await prisma.cashTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { cashRegister: { include: { location: true } } },
    });

    return NextResponse.json({
      todayRegisters: registers,
      summary: {
        totalCashIn,
        totalCashOut,
        netCash: totalCashIn - totalCashOut - totalExpenses,
        totalExpenses,
        pendingHandovers,
      },
      breakdown,
      recent,
      historic: allRegisters,
    });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const openSchema = z.object({
  locationId: z.string().min(1),
  openingBalance: z.number().nonnegative(),
});

export async function POST(req: Request) {
  try {
    const u = await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const body = await req.json().catch(() => ({}));
    const parsed = openSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const reg = await openRegister({ ...parsed.data, openedBy: u.email });
    return NextResponse.json({ ok: true, register: reg });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
