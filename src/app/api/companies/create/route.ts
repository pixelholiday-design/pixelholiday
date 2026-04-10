import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  companyName: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  ceoName: z.string().min(1),
  ceoEmail: z.string().email(),
  ceoPassword: z.string().min(8),
  country: z.string().optional(),
  city: z.string().optional(),
  commissionRate: z.number().min(0.01).max(0.20).optional(),
  brandName: z.string().optional(),
  brandPrimaryColor: z.string().optional(),
});

/** POST /api/companies/create -- Admin: create a new venue company + CEO user */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  // Check slug uniqueness
  const existing = await prisma.organization.findFirst({ where: { slug: data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  const passwordHash = await bcrypt.hash(data.ceoPassword, 10);

  const org = await prisma.organization.create({
    data: {
      name: data.companyName,
      slug: data.slug,
      type: "VENUE_COMPANY",
      brandName: data.brandName || data.companyName,
      brandPrimaryColor: data.brandPrimaryColor,
      country: data.country,
      city: data.city,
      commissionRate: data.commissionRate,
      contractStartDate: new Date(),
    },
  });

  const user = await prisma.user.create({
    data: {
      name: data.ceoName,
      email: data.ceoEmail,
      password: passwordHash,
      role: "CEO",
      orgId: org.id,
    },
  });

  return NextResponse.json({ ok: true, organization: org, ceoUser: { id: user.id, email: user.email }, portalUrl: `/v/${data.slug}` });
}
