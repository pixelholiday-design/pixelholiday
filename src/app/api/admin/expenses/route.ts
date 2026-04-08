export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const category = searchParams.get("category");
    const expenses = await prisma.operatingExpense.findMany({
      where: {
        ...(locationId ? { locationId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { date: "desc" },
      take: 200,
    });
    return NextResponse.json({ expenses });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json();
    const { category, amount, date, locationId, paidBy, description, recurring, receiptUrl } = body;
    if (!category || !amount || !date) {
      return NextResponse.json({ error: "category, amount, date required" }, { status: 400 });
    }
    const exp = await prisma.operatingExpense.create({
      data: {
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        locationId: locationId || null,
        paidBy: paidBy || null,
        description: description || null,
        recurring: !!recurring,
        receiptUrl: receiptUrl || null,
        createdBy: me.id,
      },
    });
    return NextResponse.json({ expense: exp });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
