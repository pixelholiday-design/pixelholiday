import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// AI blog generation — placeholder generator producing SEO-tuned copy.
function aiGenerate(topic: string, photoIds: string[]) {
  const intro = `Discover the magic of ${topic} through the lens of Pixelvo photographers.`;
  const body = [
    `Our resort photography team captured incredible moments showcasing ${topic}.`,
    `Featuring ${photoIds.length} hand-picked images, this story celebrates joy, light and unforgettable memories.`,
    `Whether you're planning a holiday or reminiscing about one, these photos will inspire you.`,
  ].join("\n\n");
  const seoKeywords = [topic, "resort photography", "holiday memories", "pixelvo", "travel"];
  return { content: `${intro}\n\n${body}`, seoKeywords };
}

async function resolveAuthor(authorId?: string) {
  if (authorId) {
    const u = await prisma.user.findUnique({ where: { id: authorId } });
    if (u) return u.id;
  }
  // Fallback: any CEO / ops manager so JSON API callers don't need to know the author id
  const fallback = await prisma.user.findFirst({ where: { role: { in: ["CEO", "OPERATIONS_MANAGER"] } } });
  return fallback?.id || null;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let title = "";
  let content: string | undefined;
  let authorIdInput: string | undefined;
  let featuredPhotos: string[] = [];

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      title = String(body.title || "");
      content = body.content ? String(body.content) : undefined;
      authorIdInput = body.authorId;
      featuredPhotos = Array.isArray(body.featuredPhotos) ? body.featuredPhotos : [];
    } else {
      const data = await req.formData();
      title = String(data.get("title") || "");
      const rawContent = data.get("content");
      content = rawContent ? String(rawContent) : undefined;
      authorIdInput = data.get("authorId") ? String(data.get("authorId")) : undefined;
      featuredPhotos = String(data.get("featuredPhotos") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const authorId = await resolveAuthor(authorIdInput);
  if (!authorId) {
    return NextResponse.json({ error: "No author available" }, { status: 400 });
  }

  const ai = content ? { content, seoKeywords: [title] } : aiGenerate(title, featuredPhotos);

  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        content: ai.content,
        authorId,
        isAIGenerated: !content,
        status: "DRAFT",
        seoKeywords: ai.seoKeywords,
        featuredPhotos,
      },
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json({ ok: true, post });
    }
    return NextResponse.redirect(new URL("/admin/blog", req.url));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status ? { status: status as any } : {};
  const posts = await prisma.blogPost.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(posts);
}
