"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Camera,
  DollarSign,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface PackageData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: string;
  sessionType: string;
  duration: number;
  deliveredPhotos: number;
  price: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  addOns: AddOn[];
  totalBookings: number;
  totalRevenue: number;
}

const CATEGORIES = ["FAMILY", "COUPLE", "SOLO", "GROUP", "KIDS", "EVENT", "SPECIALTY"];
const CATEGORY_COLORS: Record<string, string> = {
  FAMILY: "bg-blue-100 text-blue-700",
  COUPLE: "bg-pink-100 text-pink-700",
  SOLO: "bg-purple-100 text-purple-700",
  GROUP: "bg-green-100 text-green-700",
  KIDS: "bg-yellow-100 text-yellow-800",
  EVENT: "bg-red-100 text-red-700",
  SPECIALTY: "bg-indigo-100 text-indigo-700",
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      setPackages(data);
    } catch (e) {
      console.error("Failed to fetch packages:", e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/packages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)),
    );
  }

  async function duplicatePackage(id: string) {
    const res = await fetch(`/api/admin/packages/${id}/duplicate`, { method: "POST" });
    if (res.ok) fetchPackages();
  }

  async function deletePackage(id: string) {
    await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
  }

  const filtered =
    filter === "ALL"
      ? packages
      : packages.filter((p) => p.category === filter);

  const totalBookings = packages.reduce((s, p) => s + p.totalBookings, 0);
  const totalRevenue = packages.reduce((s, p) => s + p.totalRevenue, 0);
  const activeCount = packages.filter((p) => p.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-navy-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-400" />
            Photo Packages
          </h1>
          <p className="text-navy-400 text-sm mt-1">
            Manage your Bokun-style instant booking packages
          </p>
        </div>
        <a
          href="/book"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
        >
          <ExternalLink className="h-4 w-4" /> View Booking Page
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <span className="text-xs text-navy-400 uppercase">Total Packages</span>
          <span className="block text-2xl font-bold text-navy-900">{packages.length}</span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-navy-400 uppercase">Active</span>
          <span className="block text-2xl font-bold text-green-600">{activeCount}</span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-navy-400 uppercase">Total Bookings</span>
          <span className="block text-2xl font-bold text-navy-900">{totalBookings}</span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-navy-400 uppercase">Total Revenue</span>
          <span className="block text-2xl font-bold text-coral-500">{formatPrice(totalRevenue)}</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["ALL", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === cat
                ? "bg-brand-400 text-white"
                : "bg-slate-100 text-navy-600 hover:bg-slate-200"
            }`}
          >
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Package table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className={`card p-4 flex flex-col md:flex-row md:items-center gap-4 ${
                !pkg.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-navy-900 truncate">{pkg.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      CATEGORY_COLORS[pkg.category] || "bg-slate-100 text-navy-600"
                    }`}
                  >
                    {pkg.category}
                  </span>
                  {pkg.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-navy-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {pkg.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" /> {pkg.deliveredPhotos} photos
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {formatPrice(pkg.price)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> {pkg.totalBookings} bookings
                  </span>
                  <span className="font-medium text-coral-500">
                    {formatPrice(pkg.totalRevenue)} revenue
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(pkg.id, pkg.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    pkg.isActive
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                  title={pkg.isActive ? "Deactivate" : "Activate"}
                >
                  {pkg.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => duplicatePackage(pkg.id)}
                  className="p-2 rounded-lg bg-slate-50 text-navy-500 hover:bg-slate-100 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deletePackage(pkg.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Deactivate"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <a
                  href={`/book/${pkg.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg bg-brand-400/10 text-brand-400 hover:bg-brand-400/20 transition-colors"
                  title="View public page"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-navy-400">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No packages found in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
