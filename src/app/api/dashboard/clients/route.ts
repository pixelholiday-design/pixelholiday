import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const where: any = { orgId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const clients = await prisma.crmClient.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { _count: { select: { communications: true } } },
  });

  const stats = {
    total: await prisma.crmClient.count({ where: { orgId } }),
    leads: await prisma.crmClient.count({ where: { orgId, status: "LEAD" } }),
    active: await prisma.crmClient.count({ where: { orgId, status: "ACTIVE" } }),
    vip: await prisma.crmClient.count({ where: { orgId, status: "VIP" } }),
  };

  return NextResponse.json({ ok: true, clients, stats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json().catch(() => ({}));
  const { name, email, phone, tags, notes, source, status } = body;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const client = await prisma.crmClient.create({
    data: {
      orgId,
      name,
      email: email || null,
      phone: phone || null,
      tags: tags || [],
      notes: notes || null,
      source: source || "manual",
      status: status || "ACTIVE",
    },
  });

  return NextResponse.json({ ok: true, client });
}
