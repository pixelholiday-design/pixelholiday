import { Star, Tag } from "lucide-react";

const REVIEWS = [
  { stars: 5, body: "Amazing photos, fast delivery!", name: "Sarah" },
  { stars: 5, body: "The kiosk experience was magical.", name: "Mohamed" },
  { stars: 4, body: "Loved the auto-reel video!", name: "Anna" },
];

const TAGS = ["sunset", "family", "couple", "kids", "pool", "magic-shot", "vip"];

export default function ReviewsPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Content</div>
        <h1 className="heading text-4xl mt-1">Reviews & tagging</h1>
        <p className="text-navy-400 mt-1">Customer feedback and photo metadata management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-6">
          <h2 className="heading text-xl mb-4">Customer reviews</h2>
          <div className="space-y-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="border-b border-cream-300/70 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-1 text-gold-500 mb-1">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-gold-500" />
                  ))}
                </div>
                <p className="text-navy-700">"{r.body}"</p>
                <div className="text-xs text-navy-400 mt-1">— {r.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="heading text-xl mb-4">Photo tagging</h2>
          <input className="input mb-4" placeholder="Search photo by ID…" />
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-coral-50 text-coral-700 rounded-full px-3 py-1 text-xs font-medium">
                <Tag className="h-3 w-3" /> {t}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
