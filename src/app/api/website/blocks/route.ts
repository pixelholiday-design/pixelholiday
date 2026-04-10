import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/website/blocks?page=home — Get blocks for a page */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findFirst({ where: { userId }, select: { id: true } });
  if (!profile) return NextResponse.json({ blocks: [] });

  const { searchParams } = new URL(req.url);
  const pageSlug = searchParams.get("page") || "home";

  const blocks = await prisma.websiteBlock.findMany({
    where: { profileId: profile.id, pageSlug },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ blocks });
}

/** POST /api/website/blocks — Create a new block */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findFirst({ where: { userId }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { type, pageSlug = "home", content = {}, settings = {} } = body;

  const maxOrder = await prisma.websiteBlock.findFirst({
    where: { profileId: profile.id, pageSlug },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const block = await prisma.websiteBlock.create({
    data: {
      profileId: profile.id,
      pageSlug,
      type: type as any,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      content,
      settings,
    },
  });

  return NextResponse.json({ ok: true, block });
}
