import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const albums = await prisma.album.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { spreads: true } } },
  });

  return NextResponse.json({ ok: true, albums });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json();
  const { name, template } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const album = await prisma.album.create({
    data: {
      orgId,
      name: name.trim(),
      template: template || "classic",
      status: "DRAFT",
    },
  });

  return NextResponse.json({ ok: true, album }, { status: 201 });
}
