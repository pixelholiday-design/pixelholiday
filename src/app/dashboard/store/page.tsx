"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, Plus, Package, DollarSign, TrendingUp } from "lucide-react";

type Product = {
  id: string;
  productKey: string;
  name: string;
  retailPrice: number;
  price?: number;
  isActive: boolean;
  category: string;
};

export default function DashboardStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Store</h1>
          <p className="text-navy-500 text-sm mt-1">Products your clients can purchase from their gallery</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-brand-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{activeCount}</div>
              <div className="text-xs text-navy-400">Active products</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-coral-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{products.length}</div>
              <div className="text-xs text-navy-400">Total catalog</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">2%</div>
              <div className="text-xs text-navy-400">Commission rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="text-center py-16 text-navy-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500">Your store catalog will appear here.</p>
          <p className="text-sm text-navy-400 mt-1">Products are available to clients viewing their gallery.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {products.slice(0, 20).map((p) => (
            <div key={p.id} className="card px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{p.name}</div>
                <div className="text-xs text-navy-400">{p.category}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-navy-900">&euro;{(p.retailPrice ?? p.price ?? 0).toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-cream-200 text-navy-400"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
