import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const list = await prisma.organization.findMany({ where: { type: "FRANCHISE" } });
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await req.json() : Object.fromEntries(await req.formData());
    const { name, parentOrgId, saasCommissionRate, sleepingMoneyShare } = body as any;
    if (!name || !parentOrgId) return NextResponse.json({ error: "name and parentOrgId required" }, { status: 400 });
    const org = await prisma.organization.create({
      data: {
        name,
        type: "FRANCHISE",
        parentOrgId,
        saasCommissionRate: saasCommissionRate ? Number(saasCommissionRate) : 0.02,
        sleepingMoneyShare: sleepingMoneyShare ? Number(sleepingMoneyShare) : 0.5,
      },
    });
    return NextResponse.json(org);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
