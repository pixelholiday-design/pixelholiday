import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const equipment = await prisma.equipment.findMany({
    include: { assignments: { where: { returnedAt: null }, include: { user: true } }, location: true },
  });
  return NextResponse.json({ equipment });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "assign") {
    const a = await prisma.equipmentAssignment.create({
      data: { equipmentId: body.equipmentId, userId: body.userId },
    });
    await prisma.equipment.update({ where: { id: body.equipmentId }, data: { status: "ASSIGNED" } });
    return NextResponse.json({ assignment: a });
  }
  if (body.action === "return") {
    await prisma.equipmentAssignment.update({ where: { id: body.assignmentId }, data: { returnedAt: new Date() } });
    await prisma.equipment.update({ where: { id: body.equipmentId }, data: { status: "AVAILABLE" } });
    return NextResponse.json({ ok: true });
  }
  const eq = await prisma.equipment.create({ data: body });
  return NextResponse.json({ equipment: eq });
}
