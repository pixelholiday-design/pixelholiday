import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { hookId, success } = await req.json();
  if (!hookId) return NextResponse.json({ error: "hookId required" }, { status: 400 });
  const h = await prisma.approachHook.update({
    where: { id: hookId },
    data: { timesUsed: { increment: 1 } },
  });
  if (success) {
    const newRate = (h.successRate * (h.timesUsed - 1) + 1) / h.timesUsed;
    await prisma.approachHook.update({ where: { id: hookId }, data: { successRate: newRate } });
  }
  return NextResponse.json({ ok: true });
}
