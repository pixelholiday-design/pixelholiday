import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== "fotiqo-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update all @pixelholiday.local emails to @fotiqo.local
  const oldUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@pixelholiday.local" } },
    select: { id: true, email: true },
  });

  const updates = [];
  for (const user of oldUsers) {
    const newEmail = user.email.replace("@pixelholiday.local", "@fotiqo.local");
    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });
    updates.push({ old: user.email, new: newEmail });
  }

  return NextResponse.json({
    message: `Updated ${updates.length} emails`,
    updates,
  });
}
