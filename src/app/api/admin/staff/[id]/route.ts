import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      location: true, housing: true, shifts: true,
      equipmentAssignments: { include: { equipment: true } },
      commissions: { include: { order: true } },
      galleries: { include: { order: true } },
    },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const user = await prisma.user.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
