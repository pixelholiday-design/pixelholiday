"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle,
  Loader2,
  Send,
  X,
  Image as ImageIcon,
} from "lucide-react";

type Review = {
  id: string;
  profileId: string;
  photographerId: string;
  bookingId: string | null;
  customerName: string;
  customerEmail: string | null;
  rating: number;
  title: string | null;
  comment: string;
  photoUrls: string[];
  response: string | null;
  respondedAt: string | null;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: string;
};

type Props = {
  reviews: Review[];
  profileId: string;
  averageRating: number;
  totalReviews: number;
};

type FilterTab = "all" | "needs_response" | "responded";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${
            s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  return date.toLocaleDateString();
}

export default function ReviewsClient({ reviews: initial, profileId, averageRating, totalReviews }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respondedCount = reviews.filter((r) => r.response).length;
  const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

  const filtered = reviews.filter((r) => {
    if (filter === "needs_response") return !r.response;
    if (filter === "responded") return !!r.response;
    return true;
  });

  const needsResponseCount = reviews.filter((r) => !r.response).length;

  async function submitResponse(reviewId: string) {
    if (!replyText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit response");
      }
      const data = await res.json();
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? { ...r, response: data.review.response, respondedAt: data.review.respondedAt }
            : r
        )
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit response");
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    { key: "needs_response", label: "Needs Response", count: needsResponseCount },
    { key: "responded", label: "Responded", count: respondedCount },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500">Manage and respond to client reviews</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col items-start">
                <StarRating rating={Math.round(averageRating)} size="sm" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Average Rating</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
            <span className="text-3xl font-bold text-slate-900">{totalReviews}</span>
            <p className="text-xs text-slate-500 mt-1">Total Reviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
            <span className="text-3xl font-bold text-slate-900">{responseRate}%</span>
            <p className="text-xs text-slate-500 mt-1">Response Rate</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 ${filter === tab.key ? "text-slate-300" : "text-slate-400"}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {filter === "needs_response"
                ? "All reviews have been responded to!"
                : filter === "responded"
                  ? "No responded reviews yet."
                  : "No reviews yet. They will appear here once clients leave feedback."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-5"
              >
                {/* Review header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {review.customerName}
                      </span>
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(review.createdAt)}</span>
                </div>

                {/* Review content */}
                {review.title && (
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{review.title}</h3>
                )}
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{review.comment}</p>

                {/* Photo thumbnails */}
                {review.photoUrls.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <div className="flex gap-2 overflow-x-auto">
                      {review.photoUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Review photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing response */}
                {review.response && (
                  <div className="bg-slate-50 rounded-lg p-4 mt-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">Your Response</span>
                      {review.respondedAt && (
                        <span className="text-xs text-slate-400">
                          {timeAgo(review.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{review.response}</p>
                  </div>
                )}

                {/* Reply action */}
                {!review.response && replyingTo !== review.id && (
                  <button
                    onClick={() => {
                      setReplyingTo(review.id);
                      setReplyText("");
                    }}
                    className="mt-3 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                )}

                {/* Reply form */}
                {replyingTo === review.id && (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response to this review..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => submitResponse(review.id)}
                        disabled={loading || !replyText.trim()}
                        className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Submit Response
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
