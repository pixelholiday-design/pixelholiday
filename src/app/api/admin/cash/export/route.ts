import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const txs = await prisma.cashTransaction.findMany({
      where: { createdAt: { gte: since } },
      include: { cashRegister: { include: { location: true } } },
      orderBy: { createdAt: "desc" },
    });

    const lines = ["date,location,type,amount,staff_id,order_id,description"];
    for (const t of txs) {
      lines.push(
        [
          new Date(t.createdAt).toISOString(),
          t.cashRegister.location.name,
          t.type,
          t.amount.toFixed(2),
          t.staffId,
          t.orderId || "",
          (t.description || "").replace(/[",\n]/g, " "),
        ].join(",")
      );
    }
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cash-report-${days}d.csv"`,
      },
    });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
