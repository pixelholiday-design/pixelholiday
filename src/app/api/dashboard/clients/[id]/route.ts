import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const client = await prisma.crmClient.findFirst({
    where: { id: params.id, orgId },
    include: {
      communications: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, client });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const existing = await prisma.crmClient.findFirst({ where: { id: params.id, orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, email, phone, tags, notes, status } = body;

  const client = await prisma.crmClient.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(tags !== undefined && { tags }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
      lastContactAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, client });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const existing = await prisma.crmClient.findFirst({ where: { id: params.id, orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.crmClient.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
