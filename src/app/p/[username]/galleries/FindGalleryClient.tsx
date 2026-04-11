"use client";

import { useState } from "react";
import { Search, Camera, ArrowRight, Loader2 } from "lucide-react";

interface GalleryResult {
  title: string;
  photoCount: number;
  date: string;
  coverImageUrl: string | null;
  galleryLink: string;
}

interface Props {
  username: string;
  brandColor: string;
}

export default function FindGalleryClient({ username, brandColor }: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<GalleryResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email && !code && !lastName && !phone) {
      setError("Please fill in at least one field to search.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (email) params.set("email", email);
      if (code) params.set("code", code);
      if (lastName) params.set("name", lastName);
      if (phone) params.set("phone", phone);

      const res = await fetch(`/api/photographer/${username}/find-gallery?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Search failed");
      }
      const data = await res.json();
      setResults(data.galleries || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ backgroundColor: brandColor + "15" }}
          >
            <Camera className="w-7 h-7" style={{ color: brandColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Find Your Photos</h1>
          <p className="text-gray-500 mt-1">
            Enter your details below to access your gallery.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              style={{ "--tw-ring-color": brandColor } as any}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              style={{ "--tw-ring-color": brandColor } as any}
              placeholder="e.g. GAL-AB34"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                style={{ "--tw-ring-color": brandColor } as any}
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                style={{ "--tw-ring-color": brandColor } as any}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: brandColor }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? "Searching..." : "Find My Gallery"}
          </button>
        </form>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="mt-8">
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                No galleries found. Please check your details and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {results.length} {results.length === 1 ? "Gallery" : "Galleries"} Found
              </h2>
              {results.map((g, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex"
                >
                  {g.coverImageUrl ? (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={g.coverImageUrl}
                        alt={g.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: brandColor + "10" }}
                    >
                      <Camera className="w-8 h-8" style={{ color: brandColor }} />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{g.title}</h3>
                      <p className="text-sm text-gray-500">
                        {g.photoCount} photo{g.photoCount !== 1 ? "s" : ""} &middot;{" "}
                        {new Date(g.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <a
                      href={g.galleryLink}
                      className="inline-flex items-center gap-1 text-sm font-medium mt-2"
                      style={{ color: brandColor }}
                    >
                      View Gallery
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
