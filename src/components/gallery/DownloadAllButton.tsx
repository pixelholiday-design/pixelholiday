"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadAllButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const res = await fetch(`/api/gallery/${token}/download`);

      // Primary path: server redirected to a Cloudinary ZIP — the fetch follows
      // the redirect automatically and we get the ZIP blob directly.
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/zip") || contentType.includes("application/octet-stream")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fotiqo-photos.zip";
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback path: API returned { urls } for individual R2-backed photos.
      const data = await res.json();

      if (data.url) {
        // Single redirect URL (legacy)
        window.location.href = data.url;
        return;
      }

      if (Array.isArray(data.urls) && data.urls.length > 0) {
        // Trigger individual downloads with a short stagger to avoid browser blocking.
        for (let i = 0; i < data.urls.length; i++) {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              const a = document.createElement("a");
              a.href = data.urls[i];
              a.download = `photo-${i + 1}.jpg`;
              a.target = "_blank";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              resolve();
            }, i * 300);
          });
        }
        return;
      }

      // Unexpected response
      console.error("Download failed:", data);
      alert(data.error || "Download failed. Please try again.");
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl bg-navy-800 text-white text-xs font-semibold px-4 py-2 hover:bg-navy-700 transition shadow-card disabled:opacity-60"
    >
      {busy ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing…
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" /> Download all
        </>
      )}
    </button>
  );
}
