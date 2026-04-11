import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const body = await req.json();
  const { sessionId, slotTime, clientName, clientEmail, clientPhone } = body;

  if (!sessionId || !slotTime || !clientName || !clientEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const miniSession = await prisma.miniSession.findFirst({
    where: { slug: params.slug, isPublished: true },
    include: { _count: { select: { bookings: true } } },
  });

  if (!miniSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (miniSession._count.bookings >= miniSession.maxSlots) {
    return NextResponse.json({ error: "Session is fully booked" }, { status: 409 });
  }

  // Check if slot is already taken
  const existing = await prisma.miniSessionBooking.findFirst({
    where: { sessionId, slotTime: String(slotTime) },
  });

  if (existing) {
    return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
  }

  const booking = await prisma.miniSessionBooking.create({
    data: {
      sessionId,
      slotTime: String(slotTime),
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      isPaid: false,
    },
  });

  // Update booked slots count
  await prisma.miniSession.update({
    where: { id: sessionId },
    data: { bookedSlots: { increment: 1 } },
  });

  return NextResponse.json({ ok: true, booking }, { status: 201 });
}
