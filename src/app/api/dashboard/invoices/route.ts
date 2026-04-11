import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePlan } from "@/lib/plan-guard";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";

  const where: any = { orgId };
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  const stats = {
    total: await prisma.invoice.count({ where: { orgId } }),
    draft: await prisma.invoice.count({ where: { orgId, status: "DRAFT" } }),
    sent: await prisma.invoice.count({ where: { orgId, status: "SENT" } }),
    paid: await prisma.invoice.count({ where: { orgId, status: "PAID" } }),
    overdue: await prisma.invoice.count({ where: { orgId, status: "OVERDUE" } }),
    totalRevenue: (await prisma.invoice.aggregate({ where: { orgId, status: "PAID" }, _sum: { total: true } }))._sum.total || 0,
    totalPending: (await prisma.invoice.aggregate({ where: { orgId, status: { in: ["SENT", "VIEWED"] } }, _sum: { total: true } }))._sum.total || 0,
  };

  return NextResponse.json({ ok: true, invoices, stats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  try {
    await requirePlan(orgId, "invoicing");
  } catch {
    return NextResponse.json({ error: "Invoicing requires a PRO or STUDIO plan" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { clientName, clientEmail, clientAddress, items, taxRate, notes, dueDate, currency } = body;

  if (!clientName || !clientEmail || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "clientName, clientEmail, and items required" }, { status: 400 });
  }

  if (!dueDate) return NextResponse.json({ error: "dueDate required" }, { status: 400 });

  // Generate invoice number
  const count = await prisma.invoice.count({ where: { orgId } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

  // Calculate totals
  const rate = taxRate || 0;
  const subtotal = items.reduce((sum: number, i: any) => sum + ((i.quantity || 1) * i.unitPrice), 0);
  const taxAmount = subtotal * rate;
  const total = subtotal + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orgId,
      clientName,
      clientEmail,
      clientAddress: clientAddress || null,
      subtotal,
      taxRate: rate,
      taxAmount,
      total,
      currency: currency || "EUR",
      dueDate: new Date(dueDate),
      notes: notes || null,
      items: {
        create: items.map((i: any) => ({
          description: i.description,
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice,
          total: (i.quantity || 1) * i.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, invoice });
}
