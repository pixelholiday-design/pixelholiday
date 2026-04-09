"use client";

import { Check, Clock, Camera, Users, MapPin, Info } from "lucide-react";
import { useState } from "react";

interface Package {
  name: string;
  description: string;
  shortDescription: string | null;
  category: string;
  sessionType: string;
  duration: number;
  deliveredPhotos: number;
  price: number;
  currency: string;
  coverImage: string | null;
  galleryImages: string[];
  whatsIncluded: string[];
  whatToBring: string[];
  cancellationPolicy: string | null;
  maxGroupSize: number;
  isFeatured: boolean;
  location: { name: string; city: string | null } | null;
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} hour${h > 1 ? "s" : ""} ${m} min` : `${h} hour${h > 1 ? "s" : ""}`;
}

export default function PackageDetail({ pkg }: { pkg: Package }) {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-400/20 to-navy-900/20">
        {pkg.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pkg.coverImage} alt={pkg.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-24 w-24 text-brand-400/30" />
          </div>
        )}
      </div>

      {/* Title + info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-400/10 text-brand-400">
            {pkg.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-navy-500">
            {pkg.sessionType}
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-navy-900 mb-3">{pkg.name}</h1>
        <p className="text-navy-600 leading-relaxed text-base md:text-lg">{pkg.description}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Clock className="h-5 w-5 text-brand-400 mx-auto mb-1" />
          <span className="text-sm font-semibold text-navy-900">{formatDuration(pkg.duration)}</span>
          <span className="text-xs text-navy-400 block">Duration</span>
        </div>
        <div className="card p-4 text-center">
          <Camera className="h-5 w-5 text-brand-400 mx-auto mb-1" />
          <span className="text-sm font-semibold text-navy-900">{pkg.deliveredPhotos}+</span>
          <span className="text-xs text-navy-400 block">Edited photos</span>
        </div>
        <div className="card p-4 text-center">
          <Users className="h-5 w-5 text-brand-400 mx-auto mb-1" />
          <span className="text-sm font-semibold text-navy-900">Up to {pkg.maxGroupSize}</span>
          <span className="text-xs text-navy-400 block">People</span>
        </div>
        {pkg.location && (
          <div className="card p-4 text-center">
            <MapPin className="h-5 w-5 text-brand-400 mx-auto mb-1" />
            <span className="text-sm font-semibold text-navy-900 truncate block">{pkg.location.name}</span>
            <span className="text-xs text-navy-400 block">Location</span>
          </div>
        )}
      </div>

      {/* What's included */}
      {pkg.whatsIncluded.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-navy-900 mb-4">What&apos;s Included</h2>
          <ul className="space-y-2.5">
            {pkg.whatsIncluded.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-navy-700 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What to bring */}
      {pkg.whatToBring.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-navy-900 mb-4">What to Bring</h2>
          <ul className="space-y-2.5">
            {pkg.whatToBring.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-brand-400/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-3 w-3 text-brand-400" />
                </div>
                <span className="text-navy-700 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cancellation policy */}
      {pkg.cancellationPolicy && (
        <div>
          <button
            onClick={() => setShowPolicy(!showPolicy)}
            className="text-sm text-brand-400 hover:underline font-medium"
          >
            {showPolicy ? "Hide" : "View"} cancellation policy
          </button>
          {showPolicy && (
            <p className="mt-2 text-sm text-navy-500 bg-slate-50 rounded-xl p-4">
              {pkg.cancellationPolicy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
