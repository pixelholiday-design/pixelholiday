"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] pt-24 px-6">
      <h2 className="font-display text-2xl text-navy-900 mb-2">Something went wrong</h2>
      <p className="text-navy-500 text-sm mb-6">We hit an unexpected error. Please try again.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 text-sm font-medium"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-navy-200 text-navy-700 rounded-xl hover:bg-cream-50 text-sm font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
