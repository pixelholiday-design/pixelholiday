import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white p-6">
      <div className="text-7xl font-bold mb-2">404</div>
      <div className="text-xl mb-1">Page not found</div>
      <p className="text-slate-300 mb-6">This page is on holiday — like our customers.</p>
      <Link href="/" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold">Back to Fotiqo</Link>
    </div>
  );
}
