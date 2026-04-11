"use client";

import { useState } from "react";
import { Share2, Copy, Check, Link2 } from "lucide-react";

export default function ShareButton({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setOpen(!open);
    if (!shortUrl && !loading) {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery/${token}/share`, { method: "POST" });
        const data = await res.json();
        if (data.shortUrl) setShortUrl(data.shortUrl);
        else setShortUrl(`${window.location.origin}/gallery/${token}`);
      } catch {
        setShortUrl(`${window.location.origin}/gallery/${token}`);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleCopy() {
    const url = shortUrl || `${window.location.origin}/gallery/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-navy-700 shadow-sm hover:bg-white transition-colors"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-white p-4 shadow-xl border border-cream-200">
          <p className="text-xs font-semibold text-navy-700 mb-2 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            Share Link
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={loading ? "Generating..." : shortUrl || ""}
              className="input flex-1 text-xs py-1.5"
            />
            <button
              onClick={handleCopy}
              disabled={loading}
              className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
          )}
        </div>
      )}
    </div>
  );
}
