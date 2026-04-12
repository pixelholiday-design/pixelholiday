"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Camera, Image, Check, X, Star } from "lucide-react";

type OrgInfo = {
  id: string;
  name: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
};

type FileItem = {
  file: File;
  preview: string;
  isHook: boolean;
  status: "pending" | "uploading" | "done" | "error";
  key?: string;
};

export default function DestinationUploadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [galleryLink, setGalleryLink] = useState("");

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/v/${slug}/dashboard`);
        if (!res.ok) { router.push(`/v/${slug}`); return; }
        const data = await res.json();
        setOrg(data.org);
        const dest = (data.destinations || []).find(
          (d: Destination) => d.slug === destSlug
        );
        setDestination(dest || null);
      } catch {
        router.push(`/v/${slug}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, destSlug, router]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const newItems: FileItem[] = arr
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        isHook: false,
        status: "pending" as const,
      }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  function toggleHook(idx: number) {
    setItems((prev) =>
      prev.map((it, i) => ({ ...it, isHook: i === idx ? !it.isHook : false }))
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (items.length === 0) return;
    setUploading(true);

    try {
      // Upload each file via presigned URL
      const uploadedKeys: { key: string; isHook: boolean }[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setItems((prev) =>
          prev.map((it, j) => (j === i ? { ...it, status: "uploading" } : it))
        );

        try {
          const presignRes = await fetch("/api/upload/presigned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.file.name,
              contentType: item.file.type || "application/octet-stream",
            }),
          });
          const { url, key } = await presignRes.json();

          await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": item.file.type || "application/octet-stream" },
            body: item.file,
          });

          uploadedKeys.push({ key, isHook: item.isHook });
          setItems((prev) =>
            prev.map((it, j) => (j === i ? { ...it, status: "done", key } : it))
          );
        } catch {
          setItems((prev) =>
            prev.map((it, j) => (j === i ? { ...it, status: "error" } : it))
          );
        }
      }

      // Complete the gallery
      if (uploadedKeys.length > 0) {
        const completeRes = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keys: uploadedKeys.map((k) => k.key),
            hookKey: uploadedKeys.find((k) => k.isHook)?.key || uploadedKeys[0]?.key,
            roomNumber: roomNumber || undefined,
            customerName: customerName || undefined,
            status: "HOOK_ONLY",
          }),
        });
        if (completeRes.ok) {
          const data = await completeRes.json();
          setGalleryLink(data.galleryLink || "");
        }
      }
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/v/${slug}/d/${destSlug}`}
            className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {destination?.name || "Destination"}
          </Link>
          <h1 className="font-display text-2xl text-navy-900">Upload Photos</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card p-5">
            <Camera className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">{items.length}</div>
            <div className="text-xs text-navy-400">Photos selected</div>
          </div>
          <div className="card p-5">
            <Image className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">{doneCount}</div>
            <div className="text-xs text-navy-400">Uploaded</div>
          </div>
        </div>

        {/* Customer info */}
        <div className="card p-5 mb-6">
          <h3 className="font-medium text-navy-900 mb-3">Customer Info (optional)</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Room number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="px-3 py-2 rounded-lg border border-cream-300 text-sm text-navy-900"
            />
            <input
              type="text"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-cream-300 text-sm text-navy-900"
            />
          </div>
        </div>

        {/* Drag-drop zone */}
        <div
          className={`card p-8 text-center border-2 border-dashed transition-colors cursor-pointer mb-6 ${
            isDragOver
              ? "border-brand-400 bg-brand-50"
              : "border-cream-300 hover:border-cream-400"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*,video/*";
            input.onchange = () => { if (input.files) handleFiles(input.files); };
            input.click();
          }}
        >
          <Upload className="h-10 w-10 mx-auto mb-3" style={{ color: primaryColor }} />
          <h2 className="font-display text-lg text-navy-900 mb-1">
            Drop photos here or click to browse
          </h2>
          <p className="text-xs text-navy-400">
            Supports JPG, PNG, RAW, and video files
          </p>
        </div>

        {/* Photo grid */}
        {items.length > 0 && (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-cream-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  {/* Status overlay */}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {/* Hook star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleHook(idx); }}
                    className={`absolute top-1 left-1 p-1 rounded-full transition ${
                      item.isHook ? "bg-yellow-400" : "bg-black/30 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${item.isHook ? "text-white fill-white" : "text-white"}`} />
                  </button>
                  {/* Remove */}
                  {item.status === "pending" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                      className="absolute bottom-1 right-1 p-0.5 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading || items.every((i) => i.status === "done")}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                style={{ background: primaryColor }}
              >
                {uploading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</span>
                ) : items.every((i) => i.status === "done") ? (
                  <span className="flex items-center gap-2"><Check className="h-4 w-4" /> All uploaded</span>
                ) : (
                  `Upload ${items.filter((i) => i.status === "pending").length} photos`
                )}
              </button>
              {galleryLink && (
                <span className="text-xs text-green-600">Gallery created successfully</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
