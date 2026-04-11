import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Eye, PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login/photographer");
  const userId = (session.user as any).id;

  const posts = await prisma.blogPost.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-navy-900">Blog</h1>
        <Link
          href="/dashboard/blog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lift hover:brightness-105"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <FileText className="mx-auto h-5 w-5 text-brand-500 mb-1" />
          <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
          <p className="text-xs text-navy-500">Total Posts</p>
        </div>
        <div className="card p-4 text-center">
          <Eye className="mx-auto h-5 w-5 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-navy-900">{stats.published}</p>
          <p className="text-xs text-navy-500">Published</p>
        </div>
        <div className="card p-4 text-center">
          <PenLine className="mx-auto h-5 w-5 text-yellow-500 mb-1" />
          <p className="text-2xl font-bold text-navy-900">{stats.drafts}</p>
          <p className="text-xs text-navy-500">Drafts</p>
        </div>
      </div>

      {/* Post list */}
      <div className="card divide-y divide-cream-200">
        {posts.length === 0 && (
          <div className="p-8 text-center text-navy-400">
            No blog posts yet. Create your first post!
          </div>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/dashboard/blog/${post.id}/edit`}
            className="flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-navy-900 truncate">{post.title}</h3>
              <p className="text-xs text-navy-400 mt-0.5">
                {new Date(post.createdAt).toLocaleDateString()}
                {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleDateString()}`}
              </p>
            </div>
            <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[post.status]}`}>
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
