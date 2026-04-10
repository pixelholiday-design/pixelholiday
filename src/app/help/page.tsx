"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Image, Globe, ShoppingBag, Calendar, CreditCard, Wrench, Hotel, HelpCircle, ChevronRight } from "lucide-react";

type Article = { id: string; title: string; slug: string; summary: string; category: string };
type Cat = { category: string; _count: number };

const CATEGORY_META: Record<string, { icon: any; label: string; color: string }> = {
  GETTING_STARTED: { icon: Sparkles, label: "Getting Started", color: "text-brand-500 bg-brand-100" },
  GALLERIES: { icon: Image, label: "Galleries", color: "text-blue-500 bg-blue-100" },
  WEBSITE: { icon: Globe, label: "Website", color: "text-purple-500 bg-purple-100" },
  STORE: { icon: ShoppingBag, label: "Store", color: "text-coral-500 bg-coral-100" },
  BOOKING: { icon: Calendar, label: "Booking", color: "text-green-500 bg-green-100" },
  BILLING: { icon: CreditCard, label: "Billing", color: "text-gold-500 bg-gold-100" },
  TROUBLESHOOTING: { icon: Wrench, label: "Troubleshooting", color: "text-navy-500 bg-navy-100" },
  RESORT: { icon: Hotel, label: "Resort Operations", color: "text-coral-500 bg-coral-100" },
};

export default function HelpPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/help/articles${q}`).then((r) => r.json()).then((d) => { setArticles(d.articles || []); if (!search) setCategories(d.categories || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-gradient-to-b from-brand-500 to-brand-400 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl mb-4">How can we help?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-navy-900 text-lg placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lift"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {search ? (
          /* Search results */
          <div>
            <h2 className="font-display text-xl text-navy-900 mb-4">{articles.length} results for "{search}"</h2>
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/help/${a.category.toLowerCase()}/${a.slug}`} className="block card p-4 hover:shadow-card transition">
                  <div className="font-semibold text-navy-900 text-sm">{a.title}</div>
                  <div className="text-xs text-navy-500 mt-1">{a.summary}</div>
                </Link>
              ))}
              {articles.length === 0 && <p className="text-navy-400">No articles found. Try a different search or chat with us!</p>}
            </div>
          </div>
        ) : (
          /* Category grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.category] || { icon: HelpCircle, label: cat.category, color: "text-navy-500 bg-cream-200" };
              const Icon = meta.icon;
              const catArticles = articles.filter((a) => a.category === cat.category);
              return (
                <div key={cat.category} className="card p-5 hover:shadow-card transition">
                  <div className={`h-10 w-10 rounded-xl ${meta.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg text-navy-900 mb-1">{meta.label}</h3>
                  <p className="text-xs text-navy-400 mb-3">{cat._count} articles</p>
                  <div className="space-y-1">
                    {catArticles.slice(0, 3).map((a) => (
                      <Link key={a.id} href={`/help/${a.category.toLowerCase()}/${a.slug}`} className="flex items-center gap-1 text-sm text-navy-600 hover:text-brand-500 transition">
                        <ChevronRight className="h-3 w-3" /> {a.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-sm text-navy-400">
        Can't find what you need? <button onClick={() => {}} className="text-brand-500 hover:text-brand-700">Chat with us</button>
      </footer>
    </div>
  );
}
