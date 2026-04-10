import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  templateId: z.string().optional(),
  bookingId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const contract = await prisma.contract.create({
    data: {
      organizationId: user.orgId,
      title: parsed.data.title,
      content: parsed.data.content,
      photographerName: user.name || "Photographer",
      photographerEmail: user.email || "",
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      templateId: parsed.data.templateId,
      bookingId: parsed.data.bookingId,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ ok: true, contract });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const contracts = await prisma.contract.findMany({
    where: { organizationId: user.orgId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: contracts.length,
    draft: contracts.filter((c) => c.status === "DRAFT").length,
    sent: contracts.filter((c) => c.status === "SENT").length,
    signed: contracts.filter((c) => c.status === "FULLY_SIGNED").length,
  };

  return NextResponse.json({ contracts, stats });
}
