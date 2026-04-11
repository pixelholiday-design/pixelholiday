import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Find photographer and their organization
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { user: { select: { orgId: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Photographer not found" }, { status: 404 });
  }

  const orgId = profile.user.orgId;

  // Check if client account already exists for this org + email
  const existing = await prisma.clientAccount.findUnique({
    where: { organizationId_email: { organizationId: orgId, email: email.toLowerCase() } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const account = await prisma.clientAccount.create({
    data: {
      organizationId: orgId,
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  return NextResponse.json({
    success: true,
    id: account.id,
    name: account.name,
    email: account.email,
  });
}
