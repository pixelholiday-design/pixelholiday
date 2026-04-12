"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Loader2, Monitor, Settings,
  CreditCard, Tv, ExternalLink,
} from "lucide-react";

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

const KIOSK_LINKS = [
  {
    href: "/kiosk/setup",
    label: "Kiosk Setup",
    description: "Configure and pair kiosk devices for this destination.",
    icon: Settings,
  },
  {
    href: "/kiosk/sale-point",
    label: "Sale Point",
    description: "Process sales, view galleries, and manage transactions.",
    icon: CreditCard,
  },
  {
    href: "/kiosk/self-service",
    label: "Self-Service",
    description: "Customer-facing self-service mode for browsing and purchasing.",
    icon: Monitor,
  },
  {
    href: "/kiosk/tv-display",
    label: "TV Display",
    description: "Large screen display mode for showcasing photos to customers.",
    icon: Tv,
  },
];

export default function DestinationKioskPage() {
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
          <h1 className="font-display text-2xl text-navy-900">Kiosk POS</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Setup info */}
        <div className="card p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShoppingBag className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
            <div>
              <h2 className="font-display text-lg text-navy-900 mb-1">
                Configure kiosk devices for this destination
              </h2>
              <p className="text-sm text-navy-500">
                Set up sale points, self-service stations, and TV displays.
                Kiosk devices connect via local network and work offline.
              </p>
            </div>
          </div>
        </div>

        {/* Kiosk links */}
        <div className="grid sm:grid-cols-2 gap-4">
          {KIOSK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="card p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: primaryColor + "15" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-base text-navy-900">
                        {item.label}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-navy-300 group-hover:text-navy-500 transition-colors" />
                    </div>
                    <p className="text-sm text-navy-500">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
