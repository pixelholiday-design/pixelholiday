import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, customerId } = await req.json();
  const qr = await prisma.qRCode.update({
    where: { code },
    data: { scanCount: { increment: 1 } },
  });
  if (customerId) {
    await prisma.customer.update({ where: { id: customerId }, data: { wristbandCode: code } });
  }
  return NextResponse.json({ qr });
}
