"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit, Eye } from "lucide-react";
import Link from "next/link";

type Album = {
  id: string;
  name: string;
  template: string;
  status: string;
  _count: { spreads: number };
  createdAt: string;
};

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTemplate, setNewTemplate] = useState("classic");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  function loadAlbums() {
    fetch("/api/dashboard/albums")
      .then((r) => r.json())
      .then((d) => setAlbums(d.albums || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function createAlbum() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, template: newTemplate }),
      });
      if (res.ok) {
        setNewName("");
        setShowCreate(false);
        loadAlbums();
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteAlbum(id: string) {
    if (!confirm("Delete this album?")) return;
    await fetch(`/api/dashboard/albums/${id}`, { method: "DELETE" });
    loadAlbums();
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-cream-200 text-navy-600",
    READY: "bg-green-100 text-green-700",
    ORDERED: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Albums</h1>
            <p className="text-navy-500 text-sm">Design and order printed photo albums</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Album
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-navy-600 mb-1">Album Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Wedding Album — Smith Family"
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Template</label>
              <select
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="magazine">Magazine</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
          <button
            onClick={createAlbum}
            disabled={creating || !newName.trim()}
            className="px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Album"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-cream-100 rounded-xl" />)}
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 bg-cream-50 rounded-xl border border-cream-200">
          <BookOpen className="h-12 w-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-800 mb-2">No albums yet</h3>
          <p className="text-navy-500 text-sm">Create your first album to start designing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <div key={album.id} className="bg-white rounded-xl border border-cream-200 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-navy-900">{album.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[album.status] || "bg-cream-200 text-navy-600"}`}>
                    {album.status}
                  </span>
                </div>
                <div className="text-sm text-navy-500">
                  {album.template} template — {album._count.spreads} spread{album._count.spreads !== 1 ? "s" : ""} — {new Date(album.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/albums/${album.id}/designer`}
                  className="p-2 text-navy-400 hover:text-brand-600 rounded-lg hover:bg-cream-50"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="p-2 text-navy-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
