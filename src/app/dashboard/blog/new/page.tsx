"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          status,
          seoKeywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          isAIGenerated: false,
        }),
      });
      const data = await res.json();
      if (data.ok || data.id) {
        router.push("/dashboard/blog");
      }
    } catch {
      // Error handling
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blog" className="rounded-lg p-2 hover:bg-cream-100">
          <ArrowLeft className="h-5 w-5 text-navy-500" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy-900 flex-1">New Blog Post</h1>
        <button
          onClick={() => handleSave("DRAFT")}
          disabled={saving || !title.trim()}
          className="rounded-xl border border-cream-300 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-cream-50 disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave("PUBLISHED")}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Publish
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label-xs block mb-1.5">Title</label>
          <input
            className="input w-full text-lg font-semibold"
            placeholder="Your blog post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label-xs block mb-1.5">Content</label>
          <textarea
            className="input w-full min-h-[400px] font-mono text-sm"
            placeholder="Write your blog post here... (HTML supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="label-xs block mb-1.5">SEO Keywords (comma-separated)</label>
          <input
            className="input w-full"
            placeholder="photography, wedding, portrait"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
