import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") || undefined;
  const shifts = await prisma.shift.findMany({
    where: locationId ? { locationId } : {},
    include: { user: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ shifts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const shift = await prisma.shift.create({
    data: {
      userId: body.userId,
      locationId: body.locationId,
      date: new Date(body.date),
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    },
  });
  return NextResponse.json({ shift });
}
