import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-stone-100 p-8">
      <h1 className="text-5xl font-bold text-stone-900 mb-3">PixelHoliday</h1>
      <p className="text-stone-600 mb-10">Resort photography delivery & e-commerce</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <Link href="/login" className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
          <h2 className="font-semibold text-stone-900">Studio login</h2>
          <p className="text-sm text-stone-500 mt-1">Photographers & staff</p>
        </Link>
        <Link href="/admin/upload" className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
          <h2 className="font-semibold text-stone-900">Upload Hub</h2>
          <p className="text-sm text-stone-500 mt-1">Create new gallery</p>
        </Link>
        <Link href="/admin/dashboard" className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
          <h2 className="font-semibold text-stone-900">Dashboard</h2>
          <p className="text-sm text-stone-500 mt-1">Revenue & ops</p>
        </Link>
      </div>
    </main>
  );
}
