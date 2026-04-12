"use client";

import { useState } from "react";

type Photo = { id: string; s3Key_highRes: string; cloudinaryId: string | null; isPurchased: boolean; isFavorited: boolean };
type Customer = { id: string; name: string | null; email: string | null; whatsapp: string | null };
type Gallery = {
  id: string;
  magicLinkToken: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  photos: Photo[];
  customer: Customer;
  totalCount: number;
  purchasedCount: number;
};

export default function GalleryDeliveryClient({ galleries, username }: { galleries: Gallery[]; username: string | null }) {
  const [filter, setFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = filter === "all" ? galleries : galleries.filter(g => g.status === filter);

  function copyLink(gallery: Gallery) {
    const link = username
      ? `${window.location.origin}/p/${username}/gallery/${gallery.magicLinkToken}`
      : `${window.location.origin}/gallery/${gallery.magicLinkToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(gallery.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const statusColors: Record<string, string> = {
    HOOK_ONLY: "bg-amber-100 text-amber-700",
    PREVIEW_ECOM: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    PARTIAL_PAID: "bg-purple-100 text-purple-700",
    DIGITAL_PASS: "bg-cyan-100 text-cyan-700",
    EXPIRED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">&larr; Dashboard</a>
            <h1 className="text-lg font-bold text-slate-900">Client Galleries</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/upload" className="px-4 py-2 bg-coral-500 text-white rounded-lg text-sm font-semibold hover:bg-coral-600">
              + New Gallery
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "PREVIEW_ECOM", "PAID", "PARTIAL_PAID", "HOOK_ONLY", "EXPIRED"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {f === "all" ? `All (${galleries.length})` : `${f.replace("_", " ")} (${galleries.filter(g => g.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Gallery list */}
        <div className="space-y-3">
          {filtered.map(gallery => (
            <div key={gallery.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-4">
                {/* Thumbnails */}
                <div className="flex -space-x-2 shrink-0">
                  {gallery.photos.slice(0, 3).map(p => (
                    <div key={p.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white">
                      <img src={p.s3Key_highRes} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {gallery.photos.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">
                      +{gallery.photos.length - 3}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">
                      {gallery.customer.name || gallery.customer.email || "Unknown client"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[gallery.status] || "bg-slate-100 text-slate-500"}`}>
                      {gallery.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-x-3">
                    <span>{gallery.photos.length} photos</span>
                    {gallery.purchasedCount > 0 && <span>{gallery.purchasedCount} purchased</span>}
                    <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
                    {gallery.customer.email && <span>{gallery.customer.email}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => copyLink(gallery)} className={`px-3 py-1.5 rounded-lg text-sm border transition ${copiedId === gallery.id ? "bg-green-50 border-green-200 text-green-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {copiedId === gallery.id ? "Copied!" : "Copy Link"}
                  </button>
                  <a href={`/gallery/${gallery.magicLinkToken}`} target="_blank" className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg mb-2">No galleries yet</p>
              <p className="text-sm">Upload photos to create your first client gallery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
