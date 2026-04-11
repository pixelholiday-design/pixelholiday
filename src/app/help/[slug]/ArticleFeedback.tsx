"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

export default function ArticleFeedback({ articleId }: { articleId: string }) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  async function vote(helpful: boolean) {
    setVoted(helpful ? "yes" : "no");
    await fetch(`/api/help/articles/${articleId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful }),
    }).catch(() => {});
  }

  return (
    <div className="mt-10 pt-6 border-t border-cream-200 text-center">
      {voted ? (
        <div className="flex items-center justify-center gap-2 text-sm text-navy-500">
          <Check className="h-4 w-4 text-green-500" /> Thanks for your feedback!
        </div>
      ) : (
        <>
          <p className="text-sm text-navy-500 mb-3">Was this article helpful?</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => vote(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition text-sm font-medium">
              <ThumbsUp className="h-4 w-4" /> Yes
            </button>
            <button onClick={() => vote(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition text-sm font-medium">
              <ThumbsDown className="h-4 w-4" /> No
            </button>
          </div>
        </>
      )}
    </div>
  );
}
