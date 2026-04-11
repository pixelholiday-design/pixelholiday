import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, post });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only author or admin can edit
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (post.authorId !== userId && role !== "CEO" && role !== "OPERATIONS_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, content, status, seoKeywords, featuredPhotos } = body;

  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(status !== undefined && { status }),
      ...(seoKeywords !== undefined && { seoKeywords }),
      ...(featuredPhotos !== undefined && { featuredPhotos }),
      ...(status === "PUBLISHED" && !post.publishedAt && { publishedAt: new Date() }),
    },
  });

  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
