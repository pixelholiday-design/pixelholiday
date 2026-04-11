import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 8)
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const sessions = await prisma.miniSession.findMany({
    where: { orgId },
    orderBy: { date: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  const formatted = sessions.map((s) => ({
    ...s,
    bookedSlots: s._count.bookings,
    date: s.date.toISOString(),
  }));

  return NextResponse.json({ ok: true, sessions: formatted });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json();
  const { title, description, date, startTime, endTime, slotDuration, maxSlots, price, currency, location } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  const dateObj = new Date(date);

  const miniSession = await prisma.miniSession.create({
    data: {
      orgId,
      title,
      description: description || "",
      date: dateObj,
      startTime: startTime || "09:00",
      endTime: endTime || "17:00",
      slotDuration: slotDuration || 20,
      maxSlots: maxSlots || 12,
      bookedSlots: 0,
      price: price || 0,
      currency: currency || "EUR",
      location: location || "",
      slug: generateSlug(title),
      isPublished: false,
    },
  });

  return NextResponse.json({ ok: true, session: miniSession }, { status: 201 });
}
