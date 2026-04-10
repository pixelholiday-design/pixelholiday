import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  specialty: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  hourlyRate: z.number().nullable().optional(),
  bio: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

/** POST /api/marketplace/join -- Create marketplace-only photographer account */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "Email already registered. Try signing in." }, { status: 409 });

  const passwordHash = await bcrypt.hash(data.password, 10);
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Create org + user + marketplace profile in a transaction
  const org = await prisma.organization.create({
    data: { name: data.name + " Photography", type: "MARKETPLACE_ONLY", slug: slug + "-" + Date.now().toString(36) },
  });

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: "PHOTOGRAPHER",
      orgId: org.id,
    },
  });

  await prisma.marketplaceProfile.create({
    data: {
      userId: user.id,
      displayName: data.name,
      specialty: data.specialty,
      city: data.city,
      country: data.country,
      hourlyRate: data.hourlyRate,
      bio: data.bio,
      portfolioUrl: data.portfolioUrl,
    },
  });

  // Also create PhotographerProfile for /find-photographer listing
  const username = slug + "-" + Math.random().toString(36).slice(2, 6);
  try {
    await prisma.photographerProfile.create({
      data: {
        userId: user.id,
        username,
        businessName: data.name + " Photography",
        tagline: data.specialty + " photographer in " + data.city,
        bio: data.bio || "",
        city: data.city,
        country: data.country,
        specialties: [data.specialty.toLowerCase()],
        isPublicProfile: true,
      },
    });
  } catch {}

  return NextResponse.json({ ok: true, userId: user.id });
}
