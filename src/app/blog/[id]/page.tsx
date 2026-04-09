import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { name: true, email: true } } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) return { title: "Post not found | Pixelvo" };
  const description = post.content.replace(/\n/g, " ").slice(0, 160);
  return {
    title: `${post.title} | Pixelvo Blog`,
    description,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author?.name || "Pixelvo"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post || post.status !== "PUBLISHED") return notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-cream-50">
      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 mb-8 transition-colors">
          ← Back to Blog
        </Link>

        {/* Keywords / tags */}
        {post.seoKeywords && post.seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.seoKeywords.map((kw) => (
              <span key={kw} className="text-[11px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display text-4xl sm:text-5xl text-navy-900 mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8 text-sm text-navy-400 border-b border-cream-300 pb-6">
          <span>By {post.author?.name || "Pixelvo Team"}</span>
          <span>·</span>
          <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>{date}</time>
          {post.isAIGenerated && (
            <>
              <span>·</span>
              <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">AI-assisted</span>
            </>
          )}
        </div>

        {/* Featured photos placeholder */}
        {post.featuredPhotos && post.featuredPhotos.length > 0 && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {post.featuredPhotos.slice(0, 6).map((photoId) => (
              <div key={photoId} className="aspect-square rounded-xl bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white/50 text-xs">
                Photo
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-navy max-w-none">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-navy-700 leading-relaxed mb-5">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-cream-300 text-center">
          <p className="text-navy-500 text-sm mb-4">Loved this story? Share your own holiday memories.</p>
          <Link href="/" className="btn-primary inline-flex">
            Book a session
          </Link>
        </div>
      </article>
    </main>
  );
}
