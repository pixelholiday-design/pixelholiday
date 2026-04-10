"use client";
import { Camera, Heart, Download, Lock, Star, Globe, ShoppingBag, Calendar, Search, Image, Grid3X3, FileSignature, BarChart3, MessageSquare, Package } from "lucide-react";

/** CSS-only mockups that look like real product screenshots */
export function ProductMockup({ productId }: { productId: string }) {
  switch (productId) {
    case "gallery": return <GalleryMockup />;
    case "website": return <WebsiteMockup />;
    case "store": return <StoreMockup />;
    case "studio": return <StudioMockup />;
    case "marketplace": return <MarketplaceMockup />;
    default: return <GalleryMockup />;
  }
}

function GalleryMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      {/* Gallery header */}
      <div className="h-8 bg-navy-900 flex items-center justify-between px-3">
        <span className="text-[9px] text-white/70 font-medium">fotiqo.com/gallery/abc123</span>
        <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/20" />)}</div>
      </div>
      {/* Hero cover */}
      <div className="h-20 bg-gradient-to-r from-brand-600 to-brand-400 flex items-end px-4 pb-2">
        <div>
          <div className="text-white font-display text-sm">Beach Wedding</div>
          <div className="text-white/60 text-[8px]">by Sarah Chen · 48 photos</div>
        </div>
      </div>
      {/* Photo grid */}
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {Array.from({length: 9}).map((_, i) => (
          <div key={i} className="aspect-square rounded-md relative overflow-hidden" style={{background: `hsl(${180 + i * 15}, 40%, ${65 + i * 3}%)`}}>
            {i === 0 && <div className="absolute top-0.5 left-0.5 bg-navy-900/70 text-white rounded-full px-1 py-0.5 text-[6px] flex items-center gap-0.5"><Lock className="h-2 w-2" />LOCKED</div>}
            {i === 2 && <Heart className="absolute top-0.5 right-0.5 h-3 w-3 fill-coral-500 text-coral-500" />}
            {i === 4 && <div className="absolute inset-0 flex items-center justify-center text-white/20 text-[8px] font-bold rotate-[-20deg]">FOTIQO</div>}
          </div>
        ))}
      </div>
      {/* Bottom bar */}
      <div className="px-3 py-1.5 bg-navy-900 flex items-center justify-between">
        <div className="text-white text-[8px] font-semibold">Unlock your memories</div>
        <div className="bg-coral-500 text-white text-[7px] px-2 py-0.5 rounded-full font-semibold">Unlock — €49</div>
      </div>
    </div>
  );
}

function WebsiteMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-8 bg-white border-b border-cream-200 flex items-center px-3 gap-2">
        <div className="flex gap-1">{["bg-coral-400","bg-gold-400","bg-green-400"].map(c => <div key={c} className={`w-2 h-2 rounded-full ${c}`} />)}</div>
        <div className="flex-1 bg-cream-100 rounded h-4 flex items-center px-2"><span className="text-[7px] text-navy-400">sarahchen.fotiqo.com</span></div>
      </div>
      {/* Nav */}
      <div className="h-6 bg-white border-b border-cream-100 flex items-center justify-center gap-3 px-3">
        <span className="text-[7px] font-semibold text-navy-900">Sarah Chen</span>
        {["Portfolio", "About", "Services", "Contact"].map(p => <span key={p} className="text-[6px] text-navy-400">{p}</span>)}
      </div>
      {/* Hero */}
      <div className="h-24 bg-gradient-to-br from-purple-100 to-brand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-sm text-navy-900">Capturing love stories</div>
          <div className="text-[8px] text-navy-500 mt-0.5">Wedding & portrait photography</div>
          <div className="mt-1.5 bg-navy-900 text-white text-[7px] px-3 py-1 rounded-full inline-block">Book a session</div>
        </div>
      </div>
      {/* Portfolio grid */}
      <div className="p-2 grid grid-cols-4 gap-1">
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} className="aspect-square rounded" style={{background: `hsl(${200 + i * 20}, 30%, ${70 + i * 2}%)`}} />
        ))}
      </div>
    </div>
  );
}

function StoreMockup() {
  const products = [
    { name: "Canvas 30×40", price: "€58", color: "bg-coral-100" },
    { name: "Photo Book", price: "€65", color: "bg-brand-100" },
    { name: "Print 8×10", price: "€18", color: "bg-purple-100" },
    { name: "Mug", price: "€15", color: "bg-gold-100" },
  ];
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-8 bg-white border-b border-cream-200 flex items-center justify-between px-3">
        <span className="text-[9px] font-semibold text-navy-900">Shop</span>
        <div className="flex items-center gap-1"><ShoppingBag className="h-3 w-3 text-navy-400" /><span className="text-[7px] bg-coral-500 text-white rounded-full px-1">2</span></div>
      </div>
      {/* Categories */}
      <div className="flex gap-1 px-2 py-1.5 overflow-hidden">
        {["All", "Prints", "Wall Art", "Books", "Gifts"].map((c, i) => (
          <span key={c} className={`text-[7px] px-2 py-0.5 rounded-full whitespace-nowrap ${i === 0 ? "bg-navy-900 text-white" : "bg-cream-100 text-navy-500"}`}>{c}</span>
        ))}
      </div>
      {/* Products */}
      <div className="p-2 grid grid-cols-2 gap-2">
        {products.map(p => (
          <div key={p.name} className="rounded-lg border border-cream-200 overflow-hidden">
            <div className={`h-14 ${p.color} flex items-center justify-center`}>
              <Image className="h-5 w-5 text-navy-300" />
            </div>
            <div className="p-1.5">
              <div className="text-[7px] font-semibold text-navy-900 truncate">{p.name}</div>
              <div className="text-[8px] font-display text-navy-700">{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-cream-50 shadow-lift border border-cream-200 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-14 bg-white border-r border-cream-200 py-2 px-1 space-y-2">
        <div className="w-6 h-6 rounded-lg bg-brand-100 mx-auto flex items-center justify-center"><Camera className="h-3 w-3 text-brand-500" /></div>
        {[BarChart3, Image, Calendar, FileSignature, MessageSquare, Star, Package].map((Icon, i) => (
          <div key={i} className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center ${i === 0 ? "bg-brand-50" : ""}`}><Icon className="h-3 w-3 text-navy-400" /></div>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 p-2">
        <div className="text-[9px] font-semibold text-navy-900 mb-2">Dashboard</div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {[{label: "Revenue", value: "€2,450"}, {label: "Bookings", value: "12"}, {label: "Galleries", value: "8"}].map(s => (
            <div key={s.label} className="bg-white rounded-lg p-1.5 border border-cream-200">
              <div className="text-[7px] text-navy-400">{s.label}</div>
              <div className="text-[10px] font-display text-navy-900">{s.value}</div>
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="bg-white rounded-lg border border-cream-200 p-2 h-16 flex items-end gap-0.5">
          {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-400 rounded-t" style={{height: `${h}%`}} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-cream-50 shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-10 bg-white border-b border-cream-200 flex items-center px-3 gap-2">
        <Search className="h-3 w-3 text-navy-400" />
        <div className="flex-1 bg-cream-100 rounded h-5 flex items-center px-2"><span className="text-[7px] text-navy-400">Search photographers in London...</span></div>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        {[
          {name: "Sarah Chen", type: "Wedding", rating: "5.0", price: "€150/hr"},
          {name: "Marcus R.", type: "Portrait", rating: "4.9", price: "€80/hr"},
          {name: "Elena P.", type: "Events", rating: "4.8", price: "€120/hr"},
          {name: "James O.", type: "Family", rating: "5.0", price: "€95/hr"},
        ].map(p => (
          <div key={p.name} className="bg-white rounded-xl border border-cream-200 overflow-hidden">
            <div className="h-12 bg-gradient-to-br from-brand-100 to-purple-100" />
            <div className="p-1.5">
              <div className="text-[8px] font-semibold text-navy-900">{p.name}</div>
              <div className="text-[6px] text-navy-400">{p.type} · <Star className="h-2 w-2 inline fill-gold-400 text-gold-400" /> {p.rating}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[7px] text-navy-500">From {p.price}</span>
                <span className="text-[6px] bg-navy-900 text-white px-1.5 py-0.5 rounded-full">Book</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductMockup;
