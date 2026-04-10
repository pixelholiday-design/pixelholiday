import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/fonts — List custom fonts for current organization */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const fonts = await prisma.customFont.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ fonts });
}

/** POST /api/fonts — Create a custom font record (file upload handled separately via R2) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  // Check limit
  const count = await prisma.customFont.count({ where: { organizationId: orgId } });
  if (count >= 10) return NextResponse.json({ error: "Maximum 10 custom fonts allowed" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, family, fileUrl, format = "woff2", weight = "400", style = "normal" } = body;

  if (!name || !fileUrl) return NextResponse.json({ error: "name and fileUrl required" }, { status: 400 });

  const font = await prisma.customFont.create({
    data: { organizationId: orgId, name, family: family || name.replace(/\s+/g, ""), fileUrl, format, weight, style },
  });

  return NextResponse.json({ ok: true, font });
}
