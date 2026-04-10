import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** PUT /api/website/blocks/[id] — Update a block */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { content, settings, isVisible } = body;

  const data: any = {};
  if (content !== undefined) data.content = content;
  if (settings !== undefined) data.settings = settings;
  if (isVisible !== undefined) data.isVisible = isVisible;

  const block = await prisma.websiteBlock.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, block });
}

/** DELETE /api/website/blocks/[id] — Delete a block */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.websiteBlock.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
