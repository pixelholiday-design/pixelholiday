import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { scriptId, worked } = await req.json();
  if (!scriptId) return NextResponse.json({ error: "scriptId required" }, { status: 400 });
  const data: any = {};
  if (worked) data.timesConverted = { increment: 1 };
  const updated = await prisma.upsellScript.update({ where: { id: scriptId }, data });
  const rate = updated.timesShown > 0 ? updated.timesConverted / updated.timesShown : 0;
  await prisma.upsellScript.update({ where: { id: scriptId }, data: { conversionRate: rate } });
  return NextResponse.json({ ok: true });
}
