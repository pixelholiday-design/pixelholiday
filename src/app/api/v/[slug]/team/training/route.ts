import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({ where: { id: orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const records = await prisma.trainingRecord.findMany({
    where: { companyId: org.id },
    include: {
      staffProfile: { select: { designation: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const profiles = await prisma.staffProfile.findMany({
    where: { companyId: org.id, isActive: true, needsTraining: true },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    records,
    needsTraining: profiles.map((p) => ({ id: p.id, name: p.user.name, designation: p.designation })),
  });
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (!["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({ where: { id: user.orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { staffProfileId, title, trainingType, description, status, score, dueDate, completedDate, certificateUrl } = body;

  const record = await prisma.trainingRecord.create({
    data: {
      staffProfileId,
      companyId: org.id,
      title,
      trainingType: trainingType || "ONBOARDING",
      description: description || null,
      status: status || "ASSIGNED",
      score: score ? parseFloat(score) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      completedDate: completedDate ? new Date(completedDate) : null,
      certificateUrl: certificateUrl || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
