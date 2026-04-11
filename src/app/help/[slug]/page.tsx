import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import ArticleFeedback from "./ArticleFeedback";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.helpArticle.findUnique({ where: { slug: params.slug }, select: { title: true, summary: true } });
  if (!article) return { title: "Article Not Found" };
  return { title: `${article.title} — Fotiqo Help`, description: article.summary };
}

export default async function HelpArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.helpArticle.findUnique({ where: { slug: params.slug } });
  if (!article) return notFound();

  // Increment view count
  await prisma.helpArticle.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // Parse related articles from content
  const relatedMatch = article.content.match(/## Related Articles\n([\s\S]*?)$/);
  const mainContent = article.content.replace(/## Related Articles\n[\s\S]*?$/, "").trim();

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/help" className="text-brand-500 hover:text-brand-700 flex items-center gap-1 text-sm">
            <ChevronLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="text-navy-300">/</span>
          <span className="text-xs text-navy-400 uppercase tracking-wide">
            {article.category.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-navy-900 mb-3">{article.title}</h1>
        <p className="text-navy-500 text-lg mb-8">{article.summary}</p>

        {/* Article content */}
        <div className="prose prose-navy max-w-none">
          {mainContent.split("\n\n").map((block, i) => {
            if (block.startsWith("## ")) {
              return <h2 key={i} className="font-display text-xl text-navy-900 mt-8 mb-4">{block.replace("## ", "")}</h2>;
            }
            if (block.startsWith("**Q:")) {
              const [q, ...aParts] = block.split("\n");
              return (
                <div key={i} className="mb-4">
                  <div className="font-semibold text-navy-900 text-sm">{q.replace(/\*\*/g, "")}</div>
                  <div className="text-sm text-navy-600 mt-1">{aParts.join("\n").replace(/^A:\s*/, "")}</div>
                </div>
              );
            }
            if (block.match(/^\d+\./)) {
              return (
                <ol key={i} className="list-decimal list-inside space-y-2 mb-4 text-sm text-navy-700">
                  {block.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j}>{line.replace(/^\d+\.\s*/, "")}</li>
                  ))}
                </ol>
              );
            }
            if (block.includes("Tip:") || block.includes("💡")) {
              return (
                <div key={i} className="bg-brand-50 border border-brand-200 rounded-xl p-4 my-4 text-sm text-navy-700">
                  {block.replace(/\*\*/g, "")}
                </div>
              );
            }
            return <p key={i} className="text-sm text-navy-600 leading-relaxed mb-3">{block.replace(/\*\*/g, "")}</p>;
          })}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-cream-200">
            {article.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-cream-100 text-navy-400 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Feedback */}
        <ArticleFeedback articleId={article.id} />
      </main>
    </div>
  );
}
