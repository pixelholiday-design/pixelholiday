import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({
    where: { id: orgId, slug: params.slug },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const staffProfiles = await prisma.staffProfile.findMany({
    where: { companyId: org.id, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      reportsTo: { select: { id: true, userId: true, designation: true, user: { select: { name: true } } } },
      directReports: { select: { id: true, userId: true, designation: true, user: { select: { name: true } } } },
    },
    orderBy: [{ level: "asc" }, { designation: "asc" }],
  });

  const destinations = await prisma.destination.findMany({
    where: { organizationId: org.id, isActive: true },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ team: staffProfiles, destinations, org: { id: org.id, name: org.name, brandPrimaryColor: org.brandPrimaryColor } });
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (!["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findFirst({ where: { id: user.orgId, slug: params.slug } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, email, phone, role, designation, department, level, employmentType, reportsToId, salaryAmount, salaryCurrency, salaryType, primaryDestinationId } = body;

  if (!name || !email || !designation) {
    return NextResponse.json({ error: "Name, email, and designation are required" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || "PHOTOGRAPHER",
        orgId: org.id,
      },
    });

    const profile = await tx.staffProfile.create({
      data: {
        userId: newUser.id,
        companyId: org.id,
        designation,
        department: department || null,
        level: level || "STAFF",
        employmentType: employmentType || "FULL_TIME",
        reportsToId: reportsToId || null,
        salaryAmount: salaryAmount ? parseFloat(salaryAmount) : null,
        salaryCurrency: salaryCurrency || "EUR",
        salaryType: salaryType || "MONTHLY",
        primaryDestinationId: primaryDestinationId || null,
      },
    });

    if (primaryDestinationId) {
      await tx.destinationStaff.create({
        data: { userId: newUser.id, destinationId: primaryDestinationId, role: role || "PHOTOGRAPHER" },
      });
    }

    return { user: newUser, profile };
  });

  return NextResponse.json(result, { status: 201 });
}
