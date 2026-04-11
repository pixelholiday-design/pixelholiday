"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Sparkles, Image, Globe, ShoppingBag, Calendar, CreditCard,
  Building2, Store, UserCog, MessageCircle, ChevronRight, HelpCircle,
  FileText, TrendingUp, ThumbsUp, ThumbsDown,
} from "lucide-react";

type Article = { id: string; title: string; slug: string; summary: string; category: string; viewCount?: number };
type Cat = { category: string; _count: number };

const CATEGORY_META: Record<string, { icon: any; label: string; color: string; desc: string }> = {
  GETTING_STARTED: { icon: Sparkles, label: "Getting Started", color: "text-brand-500 bg-brand-50", desc: "Set up your account, create galleries, and get running" },
  GALLERIES: { icon: Image, label: "Client Galleries", color: "text-blue-500 bg-blue-50", desc: "Upload, share, and manage client photo galleries" },
  STORE: { icon: ShoppingBag, label: "Online Store", color: "text-coral-500 bg-coral-50", desc: "Products, pricing, fulfillment, and orders" },
  WEBSITE: { icon: Globe, label: "Website Builder", color: "text-purple-500 bg-purple-50", desc: "Build your portfolio website with blocks and SEO" },
  BOOKING: { icon: Calendar, label: "Booking & Scheduling", color: "text-green-500 bg-green-50", desc: "Packages, availability, and client bookings" },
  CONTRACTS: { icon: FileText, label: "Contracts & Invoices", color: "text-amber-500 bg-amber-50", desc: "E-signatures, invoicing, and payment tracking" },
  PAYMENTS: { icon: CreditCard, label: "Payments & Billing", color: "text-gold-500 bg-gold-50", desc: "Stripe, subscriptions, payouts, and revenue" },
  ATTRACTIONS: { icon: Building2, label: "Attractions & Resorts", color: "text-navy-500 bg-navy-50", desc: "Partner setup, kiosk POS, and venue operations" },
  MARKETPLACE: { icon: Store, label: "Marketplace", color: "text-teal-500 bg-teal-50", desc: "Join the marketplace and get client bookings" },
  ACCOUNT: { icon: UserCog, label: "Account & Settings", color: "text-rose-500 bg-rose-50", desc: "Password, email, privacy, and integrations" },
};

const CATEGORY_ORDER = ["GETTING_STARTED", "GALLERIES", "STORE", "WEBSITE", "BOOKING", "CONTRACTS", "PAYMENTS", "ATTRACTIONS", "MARKETPLACE", "ACCOUNT"];

const POPULAR_SLUGS = [
  "what-is-fotiqo",
  "how-to-create-first-gallery",
  "how-to-upload-photos",
  "how-to-share-gallery",
  "how-to-setup-store",
  "how-to-set-up-payments",
  "how-to-create-booking-packages",
  "how-to-create-invoice",
  "how-to-join-marketplace",
  "how-to-understand-commission",
];

export default function HelpPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/help/articles${q}`)
      .then((r) => r.json())
      .then((d) => {
        setArticles(d.articles || []);
        if (!search) setCategories(d.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const popularArticles = useMemo(
    () => POPULAR_SLUGS.map((slug) => articles.find((a) => a.slug === slug)).filter(Boolean) as Article[],
    [articles],
  );

  const sortedCategories = useMemo(
    () => CATEGORY_ORDER.map((key) => categories.find((c) => c.category === key)).filter(Boolean) as Cat[],
    [categories],
  );

  const totalArticles = categories.reduce((s, c) => s + c._count, 0);

  function openChat() {
    // Trigger ChatWidget open via custom event
    window.dispatchEvent(new CustomEvent("fotiqo:open-chat"));
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <header className="bg-gradient-to-br from-[#0C2E3D] via-[#0EA5A5] to-[#0C2E3D] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl mb-3">Help Center</h1>
          <p className="text-white/70 text-lg mb-8">Search {totalArticles || "100+"}  articles to find answers fast</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-navy-900 text-lg placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lift"
              placeholder="Search 100+ articles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20 text-navy-400">Loading articles...</div>
        ) : search ? (
          /* ── SEARCH RESULTS ── */
          <div>
            <h2 className="font-display text-xl text-navy-900 mb-4">
              {articles.length} result{articles.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </h2>
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/help/${a.slug}`} className="block card p-5 hover:shadow-card transition group">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-navy-900 text-sm group-hover:text-brand-500 transition">{a.title}</div>
                      <div className="text-xs text-navy-500 mt-1">{a.summary}</div>
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-wide text-navy-400 bg-cream-100 px-2 py-0.5 rounded-full">
                        {CATEGORY_META[a.category]?.label || a.category}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-navy-300 shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
              {articles.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-10 w-10 mx-auto text-navy-300 mb-3" />
                  <p className="text-navy-500 font-medium">No articles found</p>
                  <p className="text-sm text-navy-400 mt-1">Try a different search term or chat with us.</p>
                  <button onClick={openChat} className="btn-primary mt-4 text-sm">
                    <MessageCircle className="h-4 w-4" /> Chat with us
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeCategory ? (
          /* ── CATEGORY DETAIL VIEW ── */
          <div>
            <button onClick={() => setActiveCategory(null)} className="text-sm text-brand-500 hover:text-brand-700 mb-4 flex items-center gap-1">
              &larr; All Categories
            </button>
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const meta = CATEGORY_META[activeCategory] || { icon: HelpCircle, label: activeCategory, color: "text-navy-500 bg-cream-200", desc: "" };
                const Icon = meta.icon;
                return (
                  <>
                    <div className={`h-12 w-12 rounded-xl ${meta.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl text-navy-900">{meta.label}</h2>
                      <p className="text-sm text-navy-500">{meta.desc}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="space-y-2">
              {articles.filter((a) => a.category === activeCategory).map((a) => (
                <Link key={a.id} href={`/help/${a.slug}`} className="flex items-center justify-between card px-5 py-4 hover:shadow-card transition group">
                  <div>
                    <div className="font-semibold text-navy-900 text-sm group-hover:text-brand-500 transition">{a.title}</div>
                    <div className="text-xs text-navy-500 mt-0.5">{a.summary}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-navy-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* ── DEFAULT: CATEGORIES + POPULAR ── */
          <>
            {/* Popular Articles */}
            {popularArticles.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-brand-500" />
                  <h2 className="font-display text-xl text-navy-900">Popular Articles</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {popularArticles.map((a) => (
                    <Link key={a.id} href={`/help/${a.slug}`} className="flex items-center gap-3 card px-4 py-3 hover:shadow-card transition group">
                      <div className={`h-8 w-8 rounded-lg ${CATEGORY_META[a.category]?.color || "bg-cream-200"} flex items-center justify-center shrink-0`}>
                        {(() => { const I = CATEGORY_META[a.category]?.icon || HelpCircle; return <I className="h-4 w-4" />; })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-navy-900 text-sm truncate group-hover:text-brand-500 transition">{a.title}</div>
                        <div className="text-xs text-navy-400 truncate">{a.summary}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-navy-300 shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Category Grid */}
            <section>
              <h2 className="font-display text-xl text-navy-900 mb-4">Browse by Category</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCategories.map((cat) => {
                  const meta = CATEGORY_META[cat.category] || { icon: HelpCircle, label: cat.category, color: "text-navy-500 bg-cream-200", desc: "" };
                  const Icon = meta.icon;
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setActiveCategory(cat.category)}
                      className="card p-5 hover:shadow-card transition text-left group"
                    >
                      <div className={`h-10 w-10 rounded-xl ${meta.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg text-navy-900 mb-0.5 group-hover:text-brand-500 transition">{meta.label}</h3>
                      <p className="text-xs text-navy-400 mb-2">{meta.desc}</p>
                      <span className="text-xs font-semibold text-navy-500">{cat._count} articles &rarr;</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Still need help */}
      <section className="bg-white border-t border-cream-200 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <MessageCircle className="h-10 w-10 mx-auto text-brand-500 mb-3" />
          <h2 className="font-display text-2xl text-navy-900 mb-2">Still need help?</h2>
          <p className="text-navy-500 text-sm mb-5">Our AI assistant can answer your questions instantly. No waiting, no emails.</p>
          <button onClick={openChat} className="btn-primary text-sm">
            <MessageCircle className="h-4 w-4" /> Chat with us
          </button>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-navy-400">
        &copy; {new Date().getFullYear()} Fotiqo. All rights reserved.
      </footer>
    </div>
  );
}
