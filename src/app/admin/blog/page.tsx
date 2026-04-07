import { prisma } from "@/lib/db";

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Blog Manager</h1>
      <form action="/api/blog" method="POST" className="space-y-2 max-w-xl mb-8 p-4 border rounded">
        <input name="title" placeholder="Topic / title" className="border p-2 w-full" required />
        <input name="featuredPhotos" placeholder="Featured photo IDs (comma)" className="border p-2 w-full" />
        <input name="authorId" placeholder="Author ID" className="border p-2 w-full" required />
        <button className="bg-black text-white p-2">Generate AI Blog Post</button>
      </form>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <div className="font-bold">{p.title}</div>
            <div className="text-xs text-gray-500">{p.status} · SEO: {p.seoKeywords.join(", ")}</div>
            <p className="text-sm mt-1">{p.content.slice(0, 200)}…</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
