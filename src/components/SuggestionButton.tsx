"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X, Send, Loader2, Star, ChevronUp, ThumbsUp } from "lucide-react";
import { usePathname } from "next/navigation";

function detectProduct(path: string): string {
  if (path.startsWith("/gallery")) return "GALLERY";
  if (path.startsWith("/dashboard")) return "DASHBOARD";
  if (path.startsWith("/admin")) return "ADMIN";
  if (path.startsWith("/kiosk")) return "KIOSK";
  if (path.startsWith("/find-photographer")) return "MARKETPLACE";
  if (path.startsWith("/p/")) return "PORTFOLIO";
  if (path.startsWith("/book")) return "BOOKING";
  if (path.startsWith("/shop")) return "SHOP";
  if (path.startsWith("/my-photos")) return "GALLERY";
  return "MARKETING";
}

type EvalResult = {
  category: string;
  impactScore: number;
  feasibilityScore: number;
  priorityScore: number;
  summary: string;
};

export default function SuggestionButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ response: string; eval?: EvalResult } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const product = detectProduct(pathname);

  // Don't show on certain paths
  if (pathname.startsWith("/api/") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }

  async function handleSubmit() {
    if (!content.trim() || content.length < 5) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          page: pathname,
          product,
          name: name || undefined,
          email: email || undefined,
        }),
      });
      const data = await res.json();
      setResult({
        response: data.responseToUser || "Thanks for your suggestion!",
        eval: data.evaluation,
      });
    } catch {
      setResult({ response: "Thanks! Your suggestion has been recorded." });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setContent("");
    setResult(null);
    setOpen(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lift transition-all duration-200 hover:scale-105"
          style={{ padding: expanded ? "10px 16px" : "10px" }}
          aria-label="Suggest an improvement"
        >
          <Lightbulb className="h-5 w-5" />
          {expanded && <span className="text-sm font-medium whitespace-nowrap">Suggest</span>}
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={reset}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-lift overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-gradient-to-r from-brand-50 to-cream-50">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-brand-500" />
                <h3 className="font-display text-lg text-navy-900">Got an idea?</h3>
              </div>
              <button onClick={reset} className="text-navy-400 hover:text-navy-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!result ? (
              /* Form */
              <div className="p-5 space-y-4">
                <div>
                  <textarea
                    className="input !h-28 resize-none"
                    placeholder="What would make this better? Describe your idea..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="text-right text-xs text-navy-400 mt-1">{content.length}/2000</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs block mb-1">Name (optional)</label>
                    <input className="input text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label-xs block mb-1">Email (optional)</label>
                    <input className="input text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                  </div>
                </div>

                <p className="text-xs text-navy-400">
                  We use AI to evaluate suggestions. Great ideas may be implemented automatically!
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || content.trim().length < 5}
                  className="btn-primary w-full !py-3"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating with AI...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit suggestion</>
                  )}
                </button>
              </div>
            ) : (
              /* Result */
              <div className="p-5 space-y-4 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 mb-3">
                    <ThumbsUp className="h-6 w-6 text-brand-600" />
                  </div>
                  <p className="text-navy-900 font-medium">{result.response}</p>
                </div>

                {result.eval && (
                  <div className="bg-cream-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">Category</span>
                      <span className="font-semibold text-navy-900">{result.eval.category.replace("_", "/")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">Impact</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < result.eval!.impactScore ? "bg-brand-400" : "bg-cream-300"}`} />
                        ))}
                        <span className="text-xs font-semibold text-navy-700 ml-1">{result.eval.impactScore}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">Feasibility</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < result.eval!.feasibilityScore ? "bg-green-400" : "bg-cream-300"}`} />
                        ))}
                        <span className="text-xs font-semibold text-navy-700 ml-1">{result.eval.feasibilityScore}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1 border-t border-cream-200">
                      <span className="text-navy-500">Priority score</span>
                      <span className="font-display text-lg text-navy-900">{result.eval.priorityScore}/100</span>
                    </div>
                  </div>
                )}

                <button onClick={reset} className="btn-secondary w-full">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
