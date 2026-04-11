import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const existing = await prisma.invoice.findFirst({ where: { id: params.id, orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { paymentMethod, paidAmount } = body;

  await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paidAmount: paidAmount ?? existing.total,
      paymentMethod: paymentMethod || "manual",
    },
  });

  return NextResponse.json({ ok: true });
}
