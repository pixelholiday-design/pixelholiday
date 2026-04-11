import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, orgId },
    include: { items: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, invoice });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const existing = await prisma.invoice.findFirst({ where: { id: params.id, orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { clientName, clientEmail, clientAddress, items, taxRate, notes, dueDate, status } = body;

  // Recalculate totals if items provided
  let updateData: any = {};
  if (clientName !== undefined) updateData.clientName = clientName;
  if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
  if (clientAddress !== undefined) updateData.clientAddress = clientAddress;
  if (notes !== undefined) updateData.notes = notes;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (status !== undefined) updateData.status = status;

  if (items && Array.isArray(items)) {
    const rate = taxRate ?? existing.taxRate;
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0);
    const taxAmount = subtotal * rate;
    updateData = { ...updateData, subtotal, taxRate: rate, taxAmount, total: subtotal + taxAmount };

    // Delete old items and create new ones
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
    await prisma.invoiceItem.createMany({
      data: items.map((i: any) => ({
        invoiceId: params.id,
        description: i.description,
        quantity: i.quantity || 1,
        unitPrice: i.unitPrice,
        total: (i.quantity || 1) * i.unitPrice,
      })),
    });
  }

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: updateData,
    include: { items: true },
  });

  return NextResponse.json({ ok: true, invoice });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const existing = await prisma.invoice.findFirst({ where: { id: params.id, orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
