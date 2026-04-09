import { prisma } from "@/lib/db";
import { FileText, Sparkles } from "lucide-react";

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Module 18</div>
        <h1 className="heading text-4xl mt-1">Blog Manager</h1>
        <p className="text-navy-400 mt-1">AI-generated professional blog posts showcasing your best photography work.</p>
      </header>

      <form action="/api/blog" method="POST" className="card p-6 space-y-4 max-w-2xl">
        <h2 className="heading text-xl flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate Post</h2>
        <input name="title" placeholder="Topic / title" className="input" required />
        <input name="featuredPhotos" placeholder="Featured photo IDs (comma)" className="input" />
        <input name="authorId" placeholder="Author ID" className="input" required />
        <button className="btn-primary">
          <Sparkles className="h-4 w-4" /> Generate AI Blog Post
        </button>
      </form>

      {posts.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText className="h-8 w-8 mx-auto text-navy-300 mb-3" />
          <div className="text-navy-500">No blog posts yet. Generate your first one above.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-navy-900">{p.title}</div>
                  <div className="text-xs text-navy-400 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      p.status === "PUBLISHED" ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-500"
                    }`}>{p.status}</span>
                    {p.seoKeywords.length > 0 && <span className="ml-2">SEO: {p.seoKeywords.join(", ")}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-navy-500 mt-3 leading-relaxed">{p.content.slice(0, 200)}…</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
