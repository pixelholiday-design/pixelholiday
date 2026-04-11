"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function PasswordGate({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/gallery/${token}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <Lock className="h-7 w-7 text-brand-600" />
        </div>
        <h1 className="font-display text-xl font-bold text-navy-900 mb-2">
          Password Protected
        </h1>
        <p className="text-sm text-navy-500 mb-6">
          Enter the password to view this gallery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Gallery password"
            className="input w-full"
            autoFocus
            required
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lift hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Verifying..." : "View Gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}
