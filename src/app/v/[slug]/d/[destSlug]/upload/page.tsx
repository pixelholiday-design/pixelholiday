"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Camera, Image } from "lucide-react";

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

export default function DestinationUploadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

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
            <div className="font-display text-2xl text-navy-900">0</div>
            <div className="text-xs text-navy-400">Photos today</div>
          </div>
          <div className="card p-5">
            <Image className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">0</div>
            <div className="text-xs text-navy-400">Galleries today</div>
          </div>
        </div>

        {/* Drag-drop zone */}
        <div
          className={`card p-12 text-center border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver
              ? "border-brand-400 bg-brand-50"
              : "border-cream-300 hover:border-cream-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
        >
          <Upload
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: primaryColor }}
          />
          <h2 className="font-display text-xl text-navy-900 mb-2">
            Upload coming soon
          </h2>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-4">
            Drag and drop photos here, or click to browse. Supports JPG, RAW, and
            video files.
          </p>
          <p className="text-xs text-navy-400">
            Photos will be uploaded directly to cloud storage via presigned URLs.
          </p>
        </div>
      </main>
    </div>
  );
}
