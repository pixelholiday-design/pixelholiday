import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const url = new URL(req.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const commissions = await prisma.commission.findMany({
      where: { month },
      include: { user: true, order: true },
    });

    type Row = {
      userId: string;
      name: string;
      email: string;
      totalSales: number;
      commission: number;
      paidCommission: number;
      unpaidCommission: number;
      rows: number;
    };
    const map = new Map<string, Row>();
    for (const c of commissions) {
      const r =
        map.get(c.userId) ||
        ({
          userId: c.userId,
          name: c.user.name,
          email: c.user.email,
          totalSales: 0,
          commission: 0,
          paidCommission: 0,
          unpaidCommission: 0,
          rows: 0,
        } as Row);
      r.totalSales += c.order?.amount ?? 0;
      r.commission += c.amount;
      if (c.isPaid) r.paidCommission += c.amount;
      else r.unpaidCommission += c.amount;
      r.rows += 1;
      map.set(c.userId, r);
    }
    const rows = Array.from(map.values()).sort((a, b) => b.commission - a.commission);

    const summary = {
      totalOwed: rows.reduce((s, r) => s + r.unpaidCommission, 0),
      totalPaidThisMonth: rows.reduce((s, r) => s + r.paidCommission, 0),
      highestEarner: rows[0] || null,
      lowestEarner: rows[rows.length - 1] || null,
    };

    // Year-to-date paid total
    const ytdYear = month.slice(0, 4);
    const ytdAgg = await prisma.commission.aggregate({
      _sum: { amount: true },
      where: { isPaid: true, month: { startsWith: ytdYear } },
    });

    return NextResponse.json({
      month,
      rows,
      summary: { ...summary, ytdPaid: ytdAgg._sum.amount || 0 },
    });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const markSchema = z.object({
  month: z.string().min(7),
  userId: z.string().optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = markSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const where: any = { month: parsed.data.month, isPaid: false };
    if (parsed.data.userId && !parsed.data.all) where.userId = parsed.data.userId;

    const result = await prisma.commission.updateMany({
      where,
      data: { isPaid: true, paidAt: new Date() },
    });
    return NextResponse.json({ ok: true, marked: result.count, by: user.email });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
