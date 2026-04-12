import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const { taskId, action } = await req.json();
  if (!taskId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "taskId and action (approve|reject) are required" }, { status: 400 });
  }

  try {
    // Verify task belongs to this org
    const existing = await prisma.agentTask.findFirst({
      where: { id: taskId, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        ...(action === "approve" ? { executedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ task });
  } catch (err: any) {
    console.error("[Agent] Execute task error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
