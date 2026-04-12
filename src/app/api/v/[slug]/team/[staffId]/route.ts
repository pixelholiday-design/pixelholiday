import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string; staffId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({ where: { id: orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.staffProfile.findFirst({
    where: { id: params.staffId, companyId: org.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } },
      reportsTo: { select: { id: true, designation: true, user: { select: { name: true } } } },
      directReports: {
        where: { isActive: true },
        select: { id: true, designation: true, performanceScore: true, user: { select: { name: true } } },
      },
      performanceReviews: { orderBy: { createdAt: "desc" }, take: 10 },
      trainingRecords: { orderBy: { createdAt: "desc" }, take: 20 },
      staffCommissions: true,
      staffBonuses: true,
      staffPayouts: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });

  if (!profile) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

export async function PUT(req: Request, { params }: { params: { slug: string; staffId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (!["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({ where: { id: user.orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    designation, department, level, employmentType, reportsToId,
    salaryAmount, salaryCurrency, salaryType, primaryDestinationId,
    isActive, managerNotes, hrNotes, needsTraining, needsCoaching,
    onProbation, isTopPerformer, needsReplacement, phone,
    emergencyContact, emergencyPhone, address, nationality, dateOfBirth,
    skills, certifications, equipmentTrained, performanceScore,
    newBonusTarget, newTraining,
  } = body;

  // Only CEO can update hrNotes
  if (hrNotes !== undefined && user.role !== "CEO") {
    return NextResponse.json({ error: "Only CEO can edit HR notes" }, { status: 403 });
  }

  // Handle bonus target creation
  if (newBonusTarget) {
    await prisma.staffBonusTarget.create({
      data: {
        staffProfileId: params.staffId,
        companyId: org.id,
        period: newBonusTarget.period || "MONTHLY",
        metricType: newBonusTarget.metricType,
        targetValue: parseFloat(newBonusTarget.targetValue),
        bonusAmount: parseFloat(newBonusTarget.bonusAmount),
      },
    });
  }

  // Handle training assignment
  if (newTraining) {
    await prisma.trainingRecord.create({
      data: {
        staffProfileId: params.staffId,
        companyId: org.id,
        trainingType: newTraining.trainingType,
        title: newTraining.title,
        description: newTraining.description || null,
        dueDate: newTraining.dueDate ? new Date(newTraining.dueDate) : null,
      },
    });
  }

  const profileData: any = {
    ...(designation !== undefined && { designation }),
    ...(department !== undefined && { department }),
    ...(level !== undefined && { level }),
    ...(employmentType !== undefined && { employmentType }),
    ...(reportsToId !== undefined && { reportsToId: reportsToId || null }),
    ...(salaryAmount !== undefined && { salaryAmount: salaryAmount ? parseFloat(salaryAmount) : null }),
    ...(salaryCurrency !== undefined && { salaryCurrency }),
    ...(salaryType !== undefined && { salaryType }),
    ...(primaryDestinationId !== undefined && { primaryDestinationId: primaryDestinationId || null }),
    ...(isActive !== undefined && { isActive }),
    ...(managerNotes !== undefined && { managerNotes }),
    ...(hrNotes !== undefined && { hrNotes }),
    ...(needsTraining !== undefined && { needsTraining }),
    ...(needsCoaching !== undefined && { needsCoaching }),
    ...(onProbation !== undefined && { onProbation }),
    ...(isTopPerformer !== undefined && { isTopPerformer }),
    ...(needsReplacement !== undefined && { needsReplacement }),
    ...(phone !== undefined && { phone }),
    ...(emergencyContact !== undefined && { emergencyContact }),
    ...(emergencyPhone !== undefined && { emergencyPhone }),
    ...(address !== undefined && { address }),
    ...(nationality !== undefined && { nationality }),
    ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
    ...(skills !== undefined && { skills }),
    ...(certifications !== undefined && { certifications }),
    ...(equipmentTrained !== undefined && { equipmentTrained }),
    ...(performanceScore !== undefined && { performanceScore: performanceScore != null ? parseFloat(performanceScore) : null }),
  };

  let updated;
  if (Object.keys(profileData).length > 0) {
    updated = await prisma.staffProfile.update({
      where: { id: params.staffId, companyId: org.id },
      data: profileData,
    });
  }

  return NextResponse.json({ profile: updated || { id: params.staffId }, success: true });
}
