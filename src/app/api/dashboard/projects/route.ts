import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const projects = await prisma.project.findMany({
    where: { orgId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json();
  const { title, clientId, eventDate, eventType, notes, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      orgId,
      title: title.trim(),
      status: status || "INQUIRY",
      clientId: clientId || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventType: eventType || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ ok: true, project }, { status: 201 });
}
