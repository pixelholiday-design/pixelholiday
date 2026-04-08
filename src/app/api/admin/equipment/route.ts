export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const equipment = await prisma.equipment.findMany({
    include: {
      assignments: {
        where: { returnedAt: null },
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      location: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
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
    await prisma.equipmentAssignment.update({
      where: { id: body.assignmentId },
      data: { returnedAt: new Date() },
    });
    await prisma.equipment.update({ where: { id: body.equipmentId }, data: { status: "AVAILABLE" } });
    return NextResponse.json({ ok: true });
  }

  // create new equipment
  const { type, brand, model, serialNumber, purchaseCost, locationId, notes } = body;
  if (!type || !model || !locationId) {
    return NextResponse.json({ error: "type, model, and locationId are required" }, { status: 400 });
  }
  const name = [brand, model].filter(Boolean).join(" ");
  const eq = await prisma.equipment.create({
    data: {
      name,
      type,
      serialNumber: serialNumber || null,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
      locationId,
      status: "AVAILABLE",
    },
  });
  return NextResponse.json({ equipment: eq });
}
