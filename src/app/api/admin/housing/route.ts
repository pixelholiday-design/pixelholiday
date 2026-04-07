import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const housing = await prisma.staffHousing.findMany({ include: { user: true } });
  return NextResponse.json({ housing });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const h = await prisma.staffHousing.upsert({
    where: { userId: body.userId },
    update: { address: body.address, monthlyCost: body.monthlyCost, documentation: body.documentation },
    create: body,
  });
  return NextResponse.json({ housing: h });
}
