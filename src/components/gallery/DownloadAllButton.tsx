"use client";
import { Download } from "lucide-react";

export default function DownloadAllButton({ token }: { token: string }) {
  return (
    <a href={`/api/gallery/${token}/download`} className="bg-stone-900 hover:bg-stone-800 text-white text-sm px-4 py-2 rounded-full font-semibold inline-flex items-center gap-2">
      <Download size={14} /> Download all
    </a>
  );
}
