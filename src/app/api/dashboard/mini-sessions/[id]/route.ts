import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const miniSession = await prisma.miniSession.findUnique({
    where: { id: params.id },
    include: { bookings: { orderBy: { slotTime: "asc" } } },
  });

  if (!miniSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, session: miniSession });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.miniSession.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ ok: true, session: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.miniSessionBooking.deleteMany({ where: { sessionId: params.id } });
  await prisma.miniSession.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
