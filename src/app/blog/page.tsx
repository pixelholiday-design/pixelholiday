import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | PixelHoliday",
  description: "Stories, tips, and holiday memories from the PixelHoliday photography team.",
};

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/blog?status=PUBLISHED`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await getPosts();
  const published = posts.filter((p: any) => p.status === "PUBLISHED");

  return (
    <main className="min-h-screen bg-cream-50">
      <section className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">PixelHoliday Journal</p>
          <h1 className="font-display text-5xl text-navy-900 mb-3">Stories &amp; Memories</h1>
          <p className="text-navy-500 text-lg max-w-xl mx-auto">
            Behind-the-scenes stories, photography tips, and holiday highlights from our team.
          </p>
        </header>

        {published.length === 0 ? (
          <div className="text-center py-20 text-navy-400">
            <p className="text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {published.map((post: any) => {
              const excerpt = post.content
                ? post.content.replace(/\n/g, " ").slice(0, 200) + (post.content.length > 200 ? "…" : "")
                : "";
              const date = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group bg-white rounded-2xl shadow-card ring-1 ring-cream-300 overflow-hidden hover:shadow-lift transition-shadow"
                >
                  {post.featuredPhotos && post.featuredPhotos.length > 0 && (
                    <div className="h-48 bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                      <span className="text-white/60 text-sm">Photo</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.seoKeywords && post.seoKeywords[0] && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                          {post.seoKeywords[0]}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-xl text-navy-900 mb-2 group-hover:text-brand-700 transition-colors">
                      {post.title}
                    </h2>
                    {excerpt && (
                      <p className="text-navy-500 text-sm leading-relaxed mb-4">{excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-navy-400">
                      <span>{post.author?.name || "PixelHoliday Team"}</span>
                      <span>{date}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
