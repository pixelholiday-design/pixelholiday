export default function ReviewsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reviews & Photo Tagging</h1>
      <div className="grid grid-cols-2 gap-6">
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-3">Customer Reviews</h2>
          <div className="space-y-3">
            <div className="border-b pb-2">⭐⭐⭐⭐⭐ "Amazing photos, fast delivery!" — Sarah</div>
            <div className="border-b pb-2">⭐⭐⭐⭐⭐ "The kiosk experience was magical" — Mohamed</div>
            <div className="border-b pb-2">⭐⭐⭐⭐ "Loved the auto-reel video!" — Anna</div>
          </div>
        </section>
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-3">Photo Tagging</h2>
          <input className="border p-2 w-full" placeholder="Search photo by ID..." />
          <div className="flex flex-wrap gap-2 mt-3">
            {["sunset", "family", "couple", "kids", "pool", "magic-shot", "vip"].map((t) => (
              <span key={t} className="bg-gray-200 px-2 py-1 rounded text-sm">#{t}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
