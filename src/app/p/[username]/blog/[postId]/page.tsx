import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string; postId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: postId }, select: { title: true } });
  return { title: post?.title || "Blog Post" };
}

export default async function BlogPostPage({ params }: Props) {
  const { username, postId } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { userId: true, businessName: true, primaryColor: true, websiteTheme: true, username: true, logoUrl: true },
  });
  if (!profile) notFound();

  const post = await prisma.blogPost.findFirst({
    where: { id: postId, authorId: profile.userId, status: "PUBLISHED" },
  });
  if (!post) notFound();

  const isDark = profile.websiteTheme === "dark" || profile.websiteTheme === "bold";
  const color = profile.primaryColor || "#0EA5A5";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"}`}>
      <header className={`border-b sticky top-0 z-40 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/p/${username}`} className="flex items-center gap-2">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-6 w-auto" />}
            <span className="font-bold">{profile.businessName || username}</span>
          </Link>
          <Link href={`/p/${username}/blog`} className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>&larr; Back to blog</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        {post.publishedAt && (
          <time className={`text-sm block mb-8 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        )}
        <div
          className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
