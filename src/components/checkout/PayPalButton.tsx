"use client";

import { useState } from "react";

interface PayPalButtonProps {
  galleryToken: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
}

export default function PayPalButton({ galleryToken, amount, currency = "EUR", onSuccess }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayPal() {
    setLoading(true);
    setError("");

    try {
      // Create PayPal order
      const createRes = await fetch("/api/checkout/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryToken, amount, currency }),
      });
      const createData = await createRes.json();

      if (!createData.ok || !createData.approveUrl) {
        setError(createData.error || "Failed to start PayPal checkout");
        return;
      }

      // Redirect to PayPal for approval
      window.location.href = createData.approveUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePayPal}
        disabled={loading}
        className="w-full rounded-xl bg-[#0070ba] px-5 py-3 text-sm font-semibold text-white shadow-lift hover:bg-[#003087] active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          "Connecting to PayPal..."
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.54 0-.997.39-1.08.917l-.848 5.36-.244 1.548a.564.564 0 0 1-.556.48z"/>
            </svg>
            Pay with PayPal
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}
