"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Forward to /api/log so structured server logs capture client crashes too.
    fetch("/api/health").catch(() => {});
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[client error]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 text-navy-900 p-6">
      <div className="card p-10 max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/15 text-coral-600 mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl mb-2">Something went wrong</h1>
        <p className="text-navy-500 text-sm mb-6">
          We hit an unexpected error. The team has been notified — you can try again or head home.
        </p>
        {error?.digest && (
          <p className="text-[10px] text-navy-400 font-mono mb-4">ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
