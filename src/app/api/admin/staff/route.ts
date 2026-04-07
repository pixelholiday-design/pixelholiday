import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const locationId = searchParams.get("locationId");
  const q = searchParams.get("q");

  const staff = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as any } : {}),
      ...(locationId ? { locationId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { location: true, housing: true, equipmentAssignments: { include: { equipment: true } }, galleries: true, commissions: true },
  });
  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.create({ data: body });
  return NextResponse.json({ user });
}
