import { prisma } from "@/lib/db";
import { Star, ExternalLink, Send, MessageSquare, Instagram, MapPin, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

// Configurable links — move to DB/env later
const GOOGLE_REVIEW_LINK = "https://g.page/r/CVI8WduSMcw2EAE/review";
const INSTAGRAM_LINK = "https://www.instagram.com/pixelholiday/";

export default async function ReviewsPage() {
  // Fetch marketplace reviews
  const reviews = await prisma.photographerReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      profile: { select: { displayName: true, username: true } },
    },
  }).catch(() => []);

  // Fetch recent completed orders for review request sending
  const recentOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      customer: { select: { id: true, name: true, email: true, whatsapp: true } },
      gallery: { select: { id: true, photographerId: true, photographer: { select: { name: true } } } },
    },
  }).catch(() => []);

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0";
  const fiveStarCount = reviews.filter((r: any) => r.rating === 5).length;
  const fiveStarPct = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct: totalReviews > 0 ? Math.round((reviews.filter((r: any) => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="label-xs">Reputation</div>
          <h1 className="heading text-4xl mt-1">Reviews & Reputation</h1>
          <p className="text-navy-400 mt-1">Manage customer reviews, request feedback, and grow your online presence.</p>
        </div>
        <div className="flex gap-3">
          <a
            href={GOOGLE_REVIEW_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !bg-white !text-navy-900 border border-cream-300 hover:border-brand-400 flex items-center gap-2 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Get Google Reviews
          </a>
          <a
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !bg-gradient-to-r !from-purple-500 !to-pink-500 flex items-center gap-2 text-sm"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-sm text-navy-400 mb-1">Average Rating</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-navy-900">{avgRating}</span>
            <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-navy-400 mb-1">Total Reviews</div>
          <div className="text-3xl font-bold text-navy-900">{totalReviews}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-navy-400 mb-1">5-Star Rate</div>
          <div className="text-3xl font-bold text-brand-500">{fiveStarPct}%</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-navy-400 mb-1">Response Rate</div>
          <div className="text-3xl font-bold text-navy-900">
            {reviews.filter((r: any) => r.photographerResponse).length}/{totalReviews}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Review list */}
        <div className="xl:col-span-2 space-y-6">
          {/* Get More Reviews section */}
          <section className="card p-6 bg-gradient-to-r from-brand-50 to-cream-100 border-brand-200">
            <h2 className="heading text-xl mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-500" />
              Grow Your Reviews
            </h2>
            <p className="text-sm text-navy-500 mb-4">
              Share these links with customers after their session to collect reviews.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-cream-300">
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Google Reviews</div>
                  <div className="text-sm text-navy-700 truncate">{GOOGLE_REVIEW_LINK}</div>
                </div>
                <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-700">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-cream-300">
                <Instagram className="h-5 w-5 text-pink-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Instagram</div>
                  <div className="text-sm text-navy-700 truncate">{INSTAGRAM_LINK}</div>
                </div>
                <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-700">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Reviews list */}
          <section className="card p-6">
            <h2 className="heading text-xl mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              Recent Reviews ({totalReviews})
            </h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-navy-400">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Send review requests to customers after their session.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-cream-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                className={`h-3.5 w-3.5 ${j < (r.rating || 0) ? "fill-gold-500 text-gold-500" : "text-cream-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-navy-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-navy-700 text-sm">{r.comment || "(no comment)"}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                          <span>— {r.customerName || "Anonymous"}</span>
                          {r.profile && <span>for @{r.profile.username}</span>}
                        </div>
                        {r.photographerResponse && (
                          <div className="mt-2 ml-4 pl-3 border-l-2 border-brand-200 text-sm text-navy-600">
                            <span className="text-xs font-semibold text-brand-500">Reply:</span> {r.photographerResponse}
                          </div>
                        )}
                      </div>
                      <div>
                        {r.isPublic ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                            <CheckCircle className="h-3 w-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-navy-400 bg-cream-200 rounded-full px-2 py-0.5">
                            <XCircle className="h-3 w-3" /> Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Distribution + Send Requests */}
        <div className="space-y-6">
          {/* Rating distribution */}
          <section className="card p-6">
            <h2 className="heading text-lg mb-4">Rating Distribution</h2>
            <div className="space-y-2">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-sm text-navy-500 w-8">{d.star} <Star className="h-3 w-3 inline fill-gold-500 text-gold-500" /></span>
                  <div className="flex-1 bg-cream-200 rounded-full h-2.5">
                    <div
                      className="bg-gold-500 rounded-full h-2.5 transition-all"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-navy-400 w-8 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Send review requests */}
          <section className="card p-6">
            <h2 className="heading text-lg mb-2 flex items-center gap-2">
              <Send className="h-4 w-4 text-brand-500" />
              Request Reviews
            </h2>
            <p className="text-xs text-navy-400 mb-4">
              Send a branded email asking customers to rate their experience.
            </p>
            <ReviewActions
              orders={recentOrders.map((o: any) => ({
                id: o.id,
                customerName: o.customer?.name || "Guest",
                customerEmail: o.customer?.email || "",
                photographerName: o.gallery?.photographer?.name || "Photographer",
                galleryId: o.gallery?.id || "",
                date: o.createdAt.toISOString(),
              }))}
              googleReviewLink={GOOGLE_REVIEW_LINK}
              instagramLink={INSTAGRAM_LINK}
            />
          </section>

          {/* Quick links */}
          <section className="card p-6">
            <h2 className="heading text-lg mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={GOOGLE_REVIEW_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-cream-100 hover:bg-cream-200 transition text-sm text-navy-700"
              >
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="flex-1">View Google Business Profile</span>
                <ExternalLink className="h-3.5 w-3.5 text-navy-400" />
              </a>
              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-cream-100 hover:bg-cream-200 transition text-sm text-navy-700"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                <span className="flex-1">View Instagram Page</span>
                <ExternalLink className="h-3.5 w-3.5 text-navy-400" />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Love your holiday photos? Leave us a review on Google: ${GOOGLE_REVIEW_LINK}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-cream-100 hover:bg-cream-200 transition text-sm text-navy-700"
              >
                <Send className="h-4 w-4 text-green-500" />
                <span className="flex-1">Share Review Link via WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 text-navy-400" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
