import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  return { title: profile ? `Blog — ${profile.businessName || username}` : "Blog" };
}

export default async function PhotographerBlogPage({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { userId: true, businessName: true, primaryColor: true, websiteTheme: true, username: true, logoUrl: true },
  });
  if (!profile) notFound();

  const posts = await prisma.blogPost.findMany({
    where: { authorId: profile.userId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const isDark = profile.websiteTheme === "dark" || profile.websiteTheme === "bold";
  const color = profile.primaryColor || "#29ABE2";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"}`}>
      <header className={`border-b sticky top-0 z-40 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/p/${username}`} className="flex items-center gap-2">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-6 w-auto" />}
            <span className="font-bold">{profile.businessName || username}</span>
          </Link>
          <Link href={`/p/${username}`} className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>&larr; Back to site</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-10">Blog</h1>
        <div className="space-y-8">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <article className={`p-6 rounded-xl border transition ${isDark ? "border-zinc-800 hover:border-zinc-700" : "border-gray-100 hover:border-gray-200"}`}>
                <h2 className="text-xl font-bold mb-2 group-hover:opacity-80">{post.title}</h2>
                <p className={`text-sm line-clamp-2 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  {post.content.replace(/<[^>]+>/g, "").slice(0, 200)}...
                </p>
                {post.publishedAt && (
                  <time className={`text-xs mt-3 block ${isDark ? "text-zinc-600" : "text-gray-400"}`}>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                )}
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className={`text-center py-20 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>No blog posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
