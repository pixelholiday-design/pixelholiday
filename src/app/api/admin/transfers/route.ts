import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [transfer] = await prisma.$transaction([
    prisma.staffTransfer.create({
      data: {
        userId: body.userId,
        fromLocationId: body.fromLocationId,
        toLocationId: body.toLocationId,
        transferDate: new Date(body.transferDate || Date.now()),
        reason: body.reason,
        approvedBy: body.approvedBy,
      },
    }),
    prisma.user.update({ where: { id: body.userId }, data: { locationId: body.toLocationId } }),
  ]);
  return NextResponse.json({ transfer });
}
