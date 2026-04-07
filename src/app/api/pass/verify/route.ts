import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { customerId } = await req.json();
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  return NextResponse.json({
    valid: !!customer?.hasDigitalPass,
    type: customer?.digitalPassType,
  });
}
