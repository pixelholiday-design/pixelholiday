"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="text-5xl font-bold mb-2">Something went wrong</div>
      <p className="text-slate-300 mb-2">{error.message}</p>
      <button onClick={() => reset()} className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold mt-4">
        Try again
      </button>
    </div>
  );
}
