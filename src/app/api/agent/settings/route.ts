import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  try {
    let settings = await prisma.agentSettings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings) {
      settings = await prisma.agentSettings.create({
        data: { organizationId: orgId },
      });
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("[Agent] Settings GET error:", err);
    return NextResponse.json({ settings: null, error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const body = await req.json();
  const allowedFields = [
    "isEnabled", "autoPost", "autoReply", "autoEnhance",
    "dailyBriefing", "weeklyReport", "socialAccounts",
    "brandVoice", "targetAudience",
  ];

  const updateData: any = {};
  for (const key of allowedFields) {
    if (key in body) updateData[key] = body[key];
  }

  try {
    const settings = await prisma.agentSettings.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, ...updateData },
      update: updateData,
    });

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("[Agent] Settings POST error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
