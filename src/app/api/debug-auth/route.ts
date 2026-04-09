import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "admin@fotiqo.local";

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // List all users to see what emails exist
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
        take: 20,
      });
      return NextResponse.json({
        found: false,
        message: `No user with email "${email}"`,
        availableUsers: allUsers,
      });
    }

    // Test password
    const hasPassword = !!user.password;
    const passwordLength = user.password?.length || 0;
    const looksLikeBcrypt = user.password?.startsWith("$2") || false;

    let passwordMatch = false;
    if (user.password) {
      passwordMatch = await bcrypt.compare("password123", user.password);
    }

    return NextResponse.json({
      found: true,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword,
      passwordLength,
      looksLikeBcrypt,
      passwordMatchesPassword123: passwordMatch,
      // Show first/last 4 chars of hash for debugging
      passwordHashPreview: user.password
        ? `${user.password.slice(0, 7)}...${user.password.slice(-4)}`
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
