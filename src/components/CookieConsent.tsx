"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const KEY = "ph-cookie-consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const accepted = document.cookie.includes(`${KEY}=`);
    if (!accepted) setShow(true);
  }, []);

  function set(value: "accepted" | "declined") {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${KEY}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-md z-40 animate-slide-up">
      <div className="card p-5 shadow-lift border border-cream-300">
        <div className="flex items-start gap-3">
          <div className="flex-1 text-sm text-navy-700">
            We use cookies for authentication and to remember your preferences. We never sell your
            data — see our{" "}
            <Link href="/privacy" className="text-coral-600 underline">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-coral-600 underline">
              terms
            </Link>
            .
          </div>
          <button onClick={() => set("declined")} className="btn-ghost !p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => set("accepted")} className="btn-primary !py-2 text-xs flex-1">
            Accept
          </button>
          <button onClick={() => set("declined")} className="btn-secondary !py-2 text-xs flex-1">
            Decline non-essential
          </button>
        </div>
      </div>
    </div>
  );
}
