"use client";

import { useState } from "react";
import {
  Sparkles,
  Users,
  Calendar,
  Building2,
  Droplets,
  Camera,
  User,
  FileDown,
  Loader2,
  ExternalLink,
} from "lucide-react";

type Audience =
  | "wedding"
  | "portrait"
  | "event"
  | "hotel"
  | "waterpark"
  | "studio"
  | "freelance";

interface AudienceCard {
  id: Audience;
  title: string;
  description: string;
  pages: number;
  icon: React.ReactNode;
}

const audiences: AudienceCard[] = [
  {
    id: "wedding",
    title: "For Wedding Photographers",
    description:
      "Showcase galleries, contracts, client proofing, and booking management tailored for wedding pros.",
    pages: 8,
    icon: <Sparkles className="h-7 w-7" />,
  },
  {
    id: "portrait",
    title: "For Portrait/Family Photographers",
    description:
      "Highlight client galleries, print ordering, session booking, and family-friendly workflows.",
    pages: 8,
    icon: <Users className="h-7 w-7" />,
  },
  {
    id: "event",
    title: "For Event Photographers",
    description:
      "Emphasize high-volume delivery, face recognition, QR access, and real-time gallery sharing.",
    pages: 8,
    icon: <Calendar className="h-7 w-7" />,
  },
  {
    id: "hotel",
    title: "For Hotels & Resorts",
    description:
      "Present kiosk POS, guest identification, commission models, and automated sales funnels.",
    pages: 10,
    icon: <Building2 className="h-7 w-7" />,
  },
  {
    id: "waterpark",
    title: "For Water Parks & Attractions",
    description:
      "Feature speed cameras, wristband ID, ride-photo delivery, and high-throughput workflows.",
    pages: 10,
    icon: <Droplets className="h-7 w-7" />,
  },
  {
    id: "studio",
    title: "For Photography Studios",
    description:
      "Cover multi-photographer management, studio booking, print labs, and client portals.",
    pages: 8,
    icon: <Camera className="h-7 w-7" />,
  },
  {
    id: "freelance",
    title: "For Freelance Photographers",
    description:
      "Focus on affordable gallery hosting, online sales, simple booking, and brand building.",
    pages: 6,
    icon: <User className="h-7 w-7" />,
  },
];

export default function PresentationsPage() {
  const [loading, setLoading] = useState<Audience | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(audience: Audience) {
    setLoading(audience);
    setError(null);

    try {
      const res = await fetch("/api/admin/presentations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate presentation");
      }

      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setError("Failed to generate presentation. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0C2E3D" }}>
          Sales Presentations
        </h1>
        <p className="mt-1 text-gray-500">
          Generate professional PDF presentations for different customer types
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((a) => {
          const isLoading = loading === a.id;
          return (
            <div
              key={a.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: "#0EA5A5" }}
                >
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "#0C2E3D" }}
                  >
                    {a.title}
                  </h3>
                  <span className="mt-0.5 inline-block text-xs text-gray-400">
                    {a.pages} pages
                  </span>
                </div>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500">
                {a.description}
              </p>

              <button
                onClick={() => handleGenerate(a.id)}
                disabled={loading !== null}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: isLoading ? "#0C2E3D" : "#0EA5A5",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <ExternalLink className="h-3.5 w-3.5" />
          Presentations open in a new tab. Use <strong>Ctrl+P</strong> (or Cmd+P
          on Mac) to save as PDF.
        </p>
      </div>
    </div>
  );
}
