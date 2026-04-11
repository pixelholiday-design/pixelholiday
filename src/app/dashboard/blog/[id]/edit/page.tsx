"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          setTitle(d.post.title);
          setContent(d.post.content);
          setStatus(d.post.status);
          setSeoKeywords((d.post.seoKeywords || []).join(", "));
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          status,
          seoKeywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      router.push("/dashboard/blog");
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blog/${postId}`, { method: "DELETE" });
    router.push("/dashboard/blog");
  }

  if (loading) return <div className="p-8 text-center text-navy-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blog" className="rounded-lg p-2 hover:bg-cream-100">
          <ArrowLeft className="h-5 w-5 text-navy-500" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy-900 flex-1">Edit Post</h1>
        <button onClick={handleDelete} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </button>
        <select
          className="input py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label-xs block mb-1.5">Title</label>
          <input
            className="input w-full text-lg font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label-xs block mb-1.5">Content</label>
          <textarea
            className="input w-full min-h-[400px] font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="label-xs block mb-1.5">SEO Keywords (comma-separated)</label>
          <input
            className="input w-full"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
