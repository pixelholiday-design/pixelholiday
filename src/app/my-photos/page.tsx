"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Hash, Camera, ArrowRight, Loader2, Image, ExternalLink } from "lucide-react";

type GalleryResult = {
  magicLinkToken: string;
  location: string;
  photographer: string;
  photoCount: number;
  status: string;
  createdAt: string;
};

export default function MyPhotosPage() {
  const [mode, setMode] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GalleryResult[] | null>(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function searchByEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErr("");
    setResults(null);
    setSent(false);

    try {
      const res = await fetch("/api/customer/find-galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.galleries && data.galleries.length > 0) {
        setResults(data.galleries);
      } else if (data.sent) {
        setSent(true);
      } else {
        setErr("No photos found for this email. Try a different email or ask for your gallery link at the front desk.");
      }
    } catch {
      setErr("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function searchByCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    // Gallery codes are magic link tokens — redirect directly
    window.location.href = `/gallery/${code.trim()}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-white to-cream-100">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
          <span className="font-display text-xl text-navy-900">Fotiqo</span>
        </Link>
        <Link href="/login" className="text-sm text-navy-400 hover:text-brand-500 transition">
          Sign in
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 mb-4">
            <Camera className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="font-display text-4xl text-navy-900 mb-2">Find your photos</h1>
          <p className="text-navy-500">Access the photos taken during your visit</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 bg-cream-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("email"); setErr(""); setResults(null); setSent(false); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              mode === "email" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
            }`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button
            onClick={() => { setMode("code"); setErr(""); setResults(null); setSent(false); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              mode === "code" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
            }`}
          >
            <Hash className="h-4 w-4" /> Gallery code
          </button>
        </div>

        {/* Email search */}
        {mode === "email" && (
          <form onSubmit={searchByEmail} className="space-y-4 animate-fade-in">
            <div>
              <label className="label-xs block mb-1.5">Your email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email you gave at check-in"
                  required
                />
              </div>
              <p className="text-xs text-navy-400 mt-1.5">We'll look up all galleries linked to this email</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</> : <><Search className="h-4 w-4" /> Find my photos</>}
            </button>
          </form>
        )}

        {/* Code search */}
        {mode === "code" && (
          <form onSubmit={searchByCode} className="space-y-4 animate-fade-in">
            <div>
              <label className="label-xs block mb-1.5">Gallery code</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10 font-mono"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the code from your card"
                  required
                />
              </div>
              <p className="text-xs text-navy-400 mt-1.5">Found on the printed card from your photographer</p>
            </div>
            <button type="submit" className="btn-primary w-full !py-3">
              <ArrowRight className="h-4 w-4" /> Go to gallery
            </button>
          </form>
        )}

        {/* Error */}
        {err && (
          <div className="mt-4 rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700 animate-fade-in">
            {err}
          </div>
        )}

        {/* Email sent confirmation */}
        {sent && (
          <div className="mt-6 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-display text-xl text-navy-900 mb-1">Check your inbox!</h3>
            <p className="text-sm text-navy-500">We sent gallery links to <strong>{email}</strong></p>
          </div>
        )}

        {/* Gallery results */}
        {results && results.length > 0 && (
          <div className="mt-6 space-y-3 animate-slide-up">
            <h3 className="font-semibold text-navy-900">Your galleries ({results.length})</h3>
            {results.map((g) => (
              <Link
                key={g.magicLinkToken}
                href={`/gallery/${g.magicLinkToken}`}
                className="block bg-white rounded-2xl border border-cream-300 p-4 hover:shadow-card hover:border-brand-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
                      <Image className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900 text-sm">{g.location}</div>
                      <div className="text-xs text-navy-400">
                        by {g.photographer} · {g.photoCount} photos · {new Date(g.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-navy-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Help text */}
        <div className="mt-10 text-center text-xs text-navy-400 space-y-2">
          <p>Can't find your photos? Ask at the front desk or your photographer for a gallery link.</p>
          <p>
            <Link href="/find-photographer" className="text-brand-500 hover:text-brand-700">
              Looking to book a photographer?
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
