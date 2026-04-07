"use client";
import { Download } from "lucide-react";

export default function DownloadAllButton({ token }: { token: string }) {
  return (
    <a
      href={`/api/gallery/${token}/download`}
      className="inline-flex items-center gap-2 rounded-xl bg-navy-800 text-white text-xs font-semibold px-4 py-2 hover:bg-navy-700 transition shadow-card"
    >
      <Download className="h-3.5 w-3.5" /> Download all
    </a>
  );
}
