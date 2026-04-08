export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const housing = await prisma.staffHousing.findMany({
    include: {
      user: { select: { id: true, name: true, role: true, location: { select: { name: true } } } },
      expenses: { orderBy: { date: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ housing });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "expense") {
    const exp = await prisma.housingExpense.create({
      data: {
        housingId: body.housingId,
        type: body.type,
        amount: parseFloat(body.amount),
        date: body.date ? new Date(body.date) : new Date(),
        paidBy: body.paidBy || "COMPANY",
        receipt: body.receipt || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json({ expense: exp });
  }

  const {
    userId,
    propertyName,
    address,
    type,
    capacity,
    monthlyCost,
    deposit,
    utilitiesIncluded,
    wifiIncluded,
    distanceToResort,
    contractStart,
    contractEnd,
    notes,
    documentation,
  } = body;

  if (!userId || !address || monthlyCost == null) {
    return NextResponse.json({ error: "userId, address, and monthlyCost are required" }, { status: 400 });
  }

  const h = await prisma.staffHousing.upsert({
    where: { userId },
    update: {
      propertyName: propertyName || null,
      address,
      type: type || null,
      capacity: capacity ? parseInt(capacity) : 1,
      monthlyCost: parseFloat(monthlyCost),
      deposit: deposit ? parseFloat(deposit) : null,
      utilitiesIncluded: !!utilitiesIncluded,
      wifiIncluded: !!wifiIncluded,
      distanceToResort: distanceToResort || null,
      contractStart: contractStart ? new Date(contractStart) : null,
      contractEnd: contractEnd ? new Date(contractEnd) : null,
      notes: notes || null,
      documentation: documentation || null,
    },
    create: {
      userId,
      propertyName: propertyName || null,
      address,
      type: type || null,
      capacity: capacity ? parseInt(capacity) : 1,
      monthlyCost: parseFloat(monthlyCost),
      deposit: deposit ? parseFloat(deposit) : null,
      utilitiesIncluded: !!utilitiesIncluded,
      wifiIncluded: !!wifiIncluded,
      distanceToResort: distanceToResort || null,
      contractStart: contractStart ? new Date(contractStart) : null,
      contractEnd: contractEnd ? new Date(contractEnd) : null,
      notes: notes || null,
      documentation: documentation || null,
    },
  });
  return NextResponse.json({ housing: h });
}
