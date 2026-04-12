import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== "fotiqo-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Legacy migration endpoint — originally migrated old brand emails to @fotiqo.local.
  // This migration has already been applied. Endpoint kept for reference.
  const remainingUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@fotiqo.local" } },
    select: { id: true, email: true },
  });

  return NextResponse.json({
    message: `Migration complete. ${remainingUsers.length} users with @fotiqo.local emails.`,
    users: remainingUsers.map((u) => u.email),
  });
}
