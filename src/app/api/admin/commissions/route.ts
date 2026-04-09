import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const commissions = await prisma.commission.findMany({
    where: { month },
    include: { user: true, order: { select: { id: true, amount: true, status: true, galleryId: true, createdAt: true } } },
  });
  const summary = commissions.reduce((acc: Record<string, any>, c) => {
    const key = c.userId;
    if (!acc[key]) acc[key] = { user: c.user, total: 0, types: {} as any, paid: 0, unpaid: 0 };
    acc[key].total += c.amount;
    acc[key].types[c.type] = (acc[key].types[c.type] || 0) + c.amount;
    if (c.isPaid) acc[key].paid += c.amount; else acc[key].unpaid += c.amount;
    return acc;
  }, {});
  return NextResponse.json({ commissions, summary: Object.values(summary) });
}

export async function PATCH(req: NextRequest) {
  const { ids } = await req.json();
  await prisma.commission.updateMany({
    where: { id: { in: ids } },
    data: { isPaid: true, paidAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
