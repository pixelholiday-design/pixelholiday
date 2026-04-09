"use client";

import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Camera,
  Share2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  confirmationCode: string;
  customerName: string;
  customerEmail: string;
  sessionDate: string;
  sessionStartTime: string;
  groupSize: number;
  basePrice: number;
  addOnsTotal: number;
  addOnsSelected: string[];
  totalPrice: number;
  currency: string;
  isPaid: boolean;
  status: string;
  package: {
    name: string;
    slug: string;
    duration: number;
    deliveredPhotos: number;
    whatsIncluded: string[];
    whatToBring: string[];
    coverImage: string | null;
    sessionType: string;
  };
  assignedPhotographer: { name: string } | null;
  location: { name: string; city: string | null; address: string | null } | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function generateICS(booking: Booking): string {
  const date = new Date(booking.sessionDate);
  const [h, m] = booking.sessionStartTime.split(":").map(Number);
  date.setHours(h, m, 0, 0);

  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + booking.package.duration);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDT = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const location = booking.location
    ? `${booking.location.name}${booking.location.city ? ", " + booking.location.city : ""}`
    : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fotiqo//Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDT(date)}`,
    `DTEND:${formatDT(endDate)}`,
    `SUMMARY:${booking.package.name} - Fotiqo`,
    `DESCRIPTION:Confirmation: ${booking.confirmationCode}\\nPhotographer: ${booking.assignedPhotographer?.name || "TBD"}\\n${booking.package.whatToBring.map((w) => "- " + w).join("\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function ConfirmationView({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const sessionDate = new Date(booking.sessionDate);
      const [h, m] = booking.sessionStartTime.split(":").map(Number);
      sessionDate.setHours(h, m, 0, 0);

      const now = new Date();
      const diff = sessionDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Your session is happening now!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const parts = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
      if (hours > 0) parts.push(`${hours}h`);
      if (mins > 0) parts.push(`${mins}m`);
      setCountdown(parts.join(" ") + " to go");
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [booking.sessionDate, booking.sessionStartTime]);

  function downloadCalendar() {
    const ics = generateICS(booking);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fotiqo-${booking.confirmationCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareWhatsApp() {
    const text = `I just booked a ${booking.package.name} photo session with Fotiqo! ${formatDate(booking.sessionDate)} at ${formatTime(booking.sessionStartTime)}. Can't wait!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function copyCode() {
    navigator.clipboard.writeText(booking.confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-navy-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-navy-500">
            Your photo session has been booked. Check your email for details.
          </p>
        </div>

        {/* Confirmation code */}
        <div className="card p-6 text-center mb-6">
          <span className="text-xs text-navy-400 uppercase tracking-wider">Confirmation Code</span>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="font-mono text-2xl md:text-3xl font-bold text-navy-900 tracking-wider">
              {booking.confirmationCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-navy-400" />
              )}
            </button>
          </div>
          {countdown && (
            <p className="mt-3 text-sm font-medium text-brand-400">{countdown}</p>
          )}
        </div>

        {/* Booking details */}
        <div className="card p-6 mb-6 space-y-4">
          <h2 className="font-display text-lg text-navy-900">{booking.package.name}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-navy-900 block">
                  {formatDate(booking.sessionDate)}
                </span>
                <span className="text-navy-400">Date</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-navy-900 block">
                  {formatTime(booking.sessionStartTime)} ({booking.package.duration} min)
                </span>
                <span className="text-navy-400">Time</span>
              </div>
            </div>
            {booking.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-navy-900 block">
                    {booking.location.name}
                  </span>
                  <span className="text-navy-400">
                    {booking.location.city || "Location"}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-navy-900 block">
                  {booking.groupSize} {booking.groupSize === 1 ? "person" : "people"}
                </span>
                <span className="text-navy-400">Group size</span>
              </div>
            </div>
            {booking.assignedPhotographer && (
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-navy-900 block">
                    {booking.assignedPhotographer.name}
                  </span>
                  <span className="text-navy-400">Photographer</span>
                </div>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <hr className="border-slate-100" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-500">{booking.package.name}</span>
              <span className="text-navy-700">{formatPrice(booking.basePrice, booking.currency)}</span>
            </div>
            {booking.addOnsTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-navy-500">
                  Add-ons: {booking.addOnsSelected.join(", ")}
                </span>
                <span className="text-navy-700">
                  +{formatPrice(booking.addOnsTotal, booking.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-navy-900 pt-1">
              <span>Total paid</span>
              <span>{formatPrice(booking.totalPrice, booking.currency)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button
            onClick={downloadCalendar}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-navy-700 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="h-4 w-4" /> Add to Calendar
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-navy-700 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share on WhatsApp
          </button>
          <button
            onClick={copyCode}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-navy-700 hover:bg-slate-50 transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        {/* What to bring */}
        {booking.package.whatToBring.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="font-display text-lg text-navy-900 mb-3">What to Bring</h3>
            <ul className="space-y-2">
              {booking.package.whatToBring.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-navy-600">
                  <ArrowRight className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/book"
            className="text-sm text-brand-400 hover:underline"
          >
            Book another session
          </Link>
        </div>
      </div>
    </div>
  );
}
