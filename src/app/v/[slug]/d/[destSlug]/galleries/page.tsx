"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2, Image, Clock } from "lucide-react";

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

export default function DestinationGalleriesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

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
          <h1 className="font-display text-2xl text-navy-900">Galleries</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <Image className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">0</div>
            <div className="text-xs text-navy-400">Total galleries</div>
          </div>
          <div className="card p-5">
            <Camera className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">0</div>
            <div className="text-xs text-navy-400">Photos</div>
          </div>
          <div className="card p-5">
            <Clock className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">0</div>
            <div className="text-xs text-navy-400">Active today</div>
          </div>
        </div>

        {/* Empty state */}
        <div className="card p-10 text-center">
          <Camera className="h-12 w-12 text-navy-300 mx-auto mb-4" />
          <h3 className="font-display text-lg text-navy-900 mb-2">
            No galleries yet
          </h3>
          <p className="text-sm text-navy-400 mb-6 max-w-md mx-auto">
            Upload photos to create galleries. Each gallery is linked to a
            customer and can be shared via magic link.
          </p>
          <Link
            href={`/v/${slug}/d/${destSlug}/upload`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
            style={{ background: primaryColor }}
          >
            <Camera className="h-5 w-5" /> Upload Photos
          </Link>
        </div>
      </main>
    </div>
  );
}
