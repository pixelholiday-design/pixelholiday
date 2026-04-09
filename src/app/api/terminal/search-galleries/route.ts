import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ galleries: [] });
  }

  const galleries = await prisma.gallery.findMany({
    where: {
      status: { notIn: ["EXPIRED", "PAID"] },
      OR: [
        { roomNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { id: { startsWith: q } },
      ],
    },
    include: {
      customer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    galleries: galleries.map((g) => ({
      id: g.id,
      roomNumber: g.roomNumber,
      customer: g.customer,
      totalCount: g.totalCount,
      status: g.status,
    })),
  });
}
