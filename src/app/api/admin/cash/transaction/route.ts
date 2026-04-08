import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recomputeRegister } from "@/lib/cash";

const schema = z.object({
  cashRegisterId: z.string().min(1),
  type: z.enum(["SALE", "CHANGE_GIVEN", "REFUND", "ADJUSTMENT", "EXPENSE"]),
  amount: z.number(),
  staffId: z.string().min(1),
  staffPin: z.string().min(4).max(8),
  orderId: z.string().optional(),
  customerName: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const staff = await prisma.user.findUnique({ where: { id: parsed.data.staffId } });
  if (!staff || staff.pin !== parsed.data.staffPin) {
    return NextResponse.json({ ok: false, error: "PIN verification failed" }, { status: 401 });
  }

  const tx = await prisma.cashTransaction.create({ data: parsed.data });
  await recomputeRegister(parsed.data.cashRegisterId);
  return NextResponse.json({ ok: true, transaction: tx });
}
