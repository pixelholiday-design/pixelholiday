import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const communications = await prisma.crmCommunication.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, communications });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { type, subject, content } = body;

  if (!content || !type) {
    return NextResponse.json({ error: "type and content required" }, { status: 400 });
  }

  const comm = await prisma.crmCommunication.create({
    data: {
      clientId: params.id,
      type,
      subject: subject || null,
      content,
    },
  });

  // Update last contact time
  await prisma.crmClient.update({
    where: { id: params.id },
    data: { lastContactAt: new Date() },
  });

  return NextResponse.json({ ok: true, communication: comm });
}
