import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, project });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.eventDate !== undefined ? { eventDate: body.eventDate ? new Date(body.eventDate) : null } : {}),
      ...(body.eventType !== undefined ? { eventType: body.eventType } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.clientId !== undefined ? { clientId: body.clientId } : {}),
    },
  });

  return NextResponse.json({ ok: true, project });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
