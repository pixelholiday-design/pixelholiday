import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  cashRegisterId: z.string().min(1),
  fromStaffId: z.string().min(1),
  toStaffId: z.string().min(1),
  amount: z.number().positive(),
  denomination: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const handover = await prisma.cashHandover.create({ data: parsed.data });
  return NextResponse.json({ ok: true, handover });
}

const confirmSchema = z.object({
  id: z.string().min(1),
  receiverPin: z.string().min(4).max(8),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const handover = await prisma.cashHandover.findUnique({ where: { id: parsed.data.id } });
  if (!handover) return NextResponse.json({ ok: false, error: "Handover not found" }, { status: 404 });
  const receiver = await prisma.user.findUnique({ where: { id: handover.toStaffId } });
  if (!receiver || receiver.pin !== parsed.data.receiverPin) {
    return NextResponse.json({ ok: false, error: "Receiver PIN verification failed" }, { status: 401 });
  }
  const updated = await prisma.cashHandover.update({
    where: { id: handover.id },
    data: { confirmedByReceiver: true, confirmedAt: new Date() },
  });
  return NextResponse.json({ ok: true, handover: updated });
}
