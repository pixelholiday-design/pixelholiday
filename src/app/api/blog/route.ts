import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// AI blog generation — placeholder generator producing SEO-tuned copy.
function aiGenerate(topic: string, photoIds: string[]) {
  const intro = `Discover the magic of ${topic} through the lens of PixelHoliday photographers.`;
  const body = [
    `Our resort photography team captured incredible moments showcasing ${topic}.`,
    `Featuring ${photoIds.length} hand-picked images, this story celebrates joy, light and unforgettable memories.`,
    `Whether you're planning a holiday or reminiscing about one, these photos will inspire you.`,
  ].join("\n\n");
  const seoKeywords = [topic, "resort photography", "holiday memories", "pixelholiday", "travel"];
  return { content: `${intro}\n\n${body}`, seoKeywords };
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const title = String(data.get("title"));
  const authorId = String(data.get("authorId"));
  const featuredPhotos = String(data.get("featuredPhotos") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const ai = aiGenerate(title, featuredPhotos);

  await prisma.blogPost.create({
    data: {
      title,
      content: ai.content,
      authorId,
      isAIGenerated: true,
      status: "DRAFT",
      seoKeywords: ai.seoKeywords,
      featuredPhotos,
    },
  });
  return NextResponse.redirect(new URL("/admin/blog", req.url));
}

export async function GET() {
  const posts = await prisma.blogPost.findMany();
  return NextResponse.json(posts);
}
