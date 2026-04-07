import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recomputeRegister } from "@/lib/cash";

const schema = z.object({
  cashRegisterId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().min(1),
  staffId: z.string().min(1),
  staffPin: z.string().min(4).max(8),
  approvedBy: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const staff = await prisma.user.findUnique({ where: { id: parsed.data.staffId } });
  if (!staff || staff.pin !== parsed.data.staffPin) {
    return NextResponse.json({ ok: false, error: "PIN verification failed" }, { status: 401 });
  }
  const { staffPin, ...data } = parsed.data;
  const expense = await prisma.cashExpense.create({ data });
  await recomputeRegister(parsed.data.cashRegisterId);
  return NextResponse.json({ ok: true, expense });
}
