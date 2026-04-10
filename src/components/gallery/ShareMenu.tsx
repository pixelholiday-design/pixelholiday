"use client";
import { useState } from "react";
import { Share2, Link as LinkIcon, MessageCircle, Mail, Check, Smartphone } from "lucide-react";

export default function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    }
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-white border border-cream-300 text-navy-600 hover:bg-cream-100 transition"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 card p-2 z-20 animate-fade-in">
          {/* Native share (shows Instagram, etc. on mobile) */}
          {hasNativeShare && (
            <button onClick={nativeShare} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700 font-semibold">
              <Smartphone className="h-4 w-4 text-brand-600" /> Share to app...
            </button>
          )}
          <button onClick={copy} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700"
          >
            <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
          </a>
          {/* Instagram — open profile/app with link copied */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              window.open("https://www.instagram.com/", "_blank");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700"
          >
            <span className="h-4 w-4 rounded bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white text-[10px] flex items-center justify-center font-bold">&#9679;</span>
            Instagram (link copied)
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700"
          >
            <span className="h-4 w-4 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">f</span>
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cream-100 text-sm text-navy-700"
          >
            <span className="h-4 w-4 rounded bg-navy-900 text-white text-[10px] flex items-center justify-center font-bold">&#120143;</span>
            Twitter / X
          </a>
        </div>
      )}
    </div>
  );
}
