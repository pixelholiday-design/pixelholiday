import NextImage from "next/image";
import { Camera, Heart, Lock, Star, ShoppingBag, Search, BarChart3, Calendar, FileSignature, MessageSquare, Package, Image } from "lucide-react";

const img = (seed: number, w = 400, h = 300) => `https://picsum.photos/seed/fq${seed}/${w}/${h}`;

export function ProductMockup({ productId }: { productId: string }) {
  switch (productId) {
    case "gallery": return <GalleryMockup />;
    case "website": return <WebsiteMockup />;
    case "store": return <StoreMockup />;
    case "studio": return <StudioMockup />;
    case "marketplace": return <MarketplaceMockup />;
    case "mobile": return <MobileGalleryMockup />;
    default: return <GalleryMockup />;
  }
}

function Img({ seed, w = 400, h = 300, alt, className }: { seed: number; w?: number; h?: number; alt: string; className?: string }) {
  return <NextImage src={img(seed, w, h)} alt={alt} width={w} height={h} className={className || "w-full h-full object-cover"} loading="lazy" />;
}

function GalleryMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-7 bg-navy-900 flex items-center justify-between px-3">
        <span className="text-[8px] text-white/70">fotiqo.com/gallery/beach-wedding</span>
        <div className="flex gap-1">{[1,2,3].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20"/>)}</div>
      </div>
      <div className="h-[72px] relative overflow-hidden">
        <Img seed={42} w={800} h={300} alt="Beach wedding gallery hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"/>
        <div className="absolute bottom-1.5 left-3 text-white">
          <div className="font-display text-[11px]">Beach Wedding</div>
          <div className="text-white/60 text-[7px]">by Sarah Chen &middot; 48 photos</div>
        </div>
      </div>
      <div className="p-1.5 grid grid-cols-3 gap-1">
        {[10,11,12,13,14,15,16,17,18].map((s,i)=>(
          <div key={s} className="aspect-square rounded relative overflow-hidden">
            <Img seed={s} w={200} h={200} alt={`Gallery photo ${i + 1}`}/>
            {i<6&&<div className="absolute inset-0 flex items-center justify-center"><span className="text-white/25 text-[6px] font-bold rotate-[-20deg]">FOTIQO</span></div>}
            {i===0&&<div className="absolute top-0.5 left-0.5 bg-navy-900/80 text-white rounded-full px-1 text-[4px] flex items-center gap-0.5"><Lock className="h-1.5 w-1.5"/>LOCKED</div>}
            {(i===2||i===5)&&<Heart className="absolute top-0.5 right-0.5 h-2 w-2 fill-coral-500 text-coral-500"/>}
          </div>
        ))}
      </div>
      <div className="px-3 py-1 bg-navy-900 flex items-center justify-between">
        <span className="text-white text-[7px] font-semibold">Unlock your memories</span>
        <span className="bg-[#F97316] text-white text-[6px] px-2 py-0.5 rounded-full font-semibold">Unlock</span>
      </div>
    </div>
  );
}

function WebsiteMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-7 bg-white border-b border-cream-200 flex items-center px-3 gap-2">
        <div className="flex gap-1">{["bg-coral-400","bg-gold-400","bg-green-400"].map(c=><div key={c} className={`w-1.5 h-1.5 rounded-full ${c}`}/>)}</div>
        <div className="flex-1 bg-cream-100 rounded h-3.5 flex items-center px-2"><span className="text-[6px] text-navy-400">sarahchen.fotiqo.com</span></div>
      </div>
      <div className="h-5 bg-white border-b border-cream-100 flex items-center justify-center gap-3">
        <span className="text-[6px] font-semibold text-navy-900">Sarah Chen Photography</span>
        {["Portfolio","About","Services","Contact"].map(p=><span key={p} className="text-[5px] text-navy-400">{p}</span>)}
      </div>
      <div className="h-[88px] relative overflow-hidden">
        <Img seed={88} w={800} h={400} alt="Photographer portfolio hero"/>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="font-display text-[11px]">Capturing love stories</div>
            <div className="text-[7px] text-white/70 mt-0.5">Wedding & portrait photography</div>
            <div className="mt-1 bg-white text-navy-900 text-[6px] px-2.5 py-0.5 rounded-full inline-block font-semibold">Book a session</div>
          </div>
        </div>
      </div>
      <div className="p-1.5 grid grid-cols-4 gap-1">
        {[20,21,22,23,24,25,26,27].map(s=>(
          <div key={s} className="aspect-square rounded overflow-hidden"><Img seed={s} w={150} h={150} alt={`Portfolio sample ${s - 19}`}/></div>
        ))}
      </div>
    </div>
  );
}

function StoreMockup() {
  const items=[{name:"Canvas 30x40",price:"EUR 58",s:30},{name:"Photo Book",price:"EUR 65",s:31},{name:"Print 8x10",price:"EUR 18",s:32},{name:"Mug",price:"EUR 15",s:33}];
  return (
    <div className="aspect-[4/3] rounded-2xl bg-white shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-7 bg-white border-b border-cream-200 flex items-center justify-between px-3">
        <span className="text-[8px] font-semibold text-navy-900">Shop</span>
        <div className="flex items-center gap-1"><ShoppingBag className="h-2.5 w-2.5 text-navy-400"/><span className="text-[6px] bg-coral-500 text-white rounded-full w-3 h-3 flex items-center justify-center">2</span></div>
      </div>
      <div className="flex gap-1 px-2 py-1">
        {["All","Prints","Wall Art","Books","Gifts"].map((c,i)=>(
          <span key={c} className={`text-[6px] px-1.5 py-0.5 rounded-full ${i===0?"bg-navy-900 text-white":"bg-cream-100 text-navy-500"}`}>{c}</span>
        ))}
      </div>
      <div className="p-1.5 grid grid-cols-2 gap-1.5">
        {items.map(p=>(
          <div key={p.name} className="rounded-lg border border-cream-200 overflow-hidden">
            <div className="h-14 overflow-hidden"><Img seed={p.s} w={300} h={200} alt={`${p.name} product photo`}/></div>
            <div className="p-1"><div className="text-[6px] font-semibold text-navy-900 truncate">{p.name}</div><div className="text-[7px] font-display text-navy-700">{p.price}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioMockup() {
  return (
    <div className="aspect-[4/3] rounded-2xl bg-cream-50 shadow-lift border border-cream-200 overflow-hidden flex">
      <div className="w-12 bg-white border-r border-cream-200 py-2 px-1 space-y-1.5">
        <div className="w-5 h-5 rounded bg-brand-100 mx-auto flex items-center justify-center"><Camera className="h-2.5 w-2.5 text-brand-500"/></div>
        {[BarChart3,Image,Calendar,FileSignature,MessageSquare,Star,Package].map((Icon,i)=>(
          <div key={i} className={`w-5 h-5 rounded mx-auto flex items-center justify-center ${i===0?"bg-brand-50":""}`}><Icon className="h-2.5 w-2.5 text-navy-400"/></div>
        ))}
      </div>
      <div className="flex-1 p-2">
        <div className="text-[8px] font-semibold text-navy-900 mb-1.5">Dashboard</div>
        <div className="grid grid-cols-3 gap-1 mb-1.5">
          {[{l:"Revenue",v:"EUR 2,450",c:"text-green-600"},{l:"Bookings",v:"12",c:"text-brand-500"},{l:"Galleries",v:"8",c:"text-purple-500"}].map(s=>(
            <div key={s.l} className="bg-white rounded p-1 border border-cream-200">
              <div className="text-[5px] text-navy-400">{s.l}</div>
              <div className={`text-[9px] font-display ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded border border-cream-200 p-1.5 h-14 flex items-end gap-0.5">
          {[30,45,35,60,50,75,65,80,70,90,85,95].map((h,i)=>(
            <div key={i} className="flex-1 bg-brand-400 rounded-t" style={{height:`${h}%`}}/>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {[40,41,42].map(s=>(
            <div key={s} className="h-7 rounded overflow-hidden"><Img seed={s} w={200} h={100} alt={`Recent gallery thumbnail ${s - 39}`}/></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceMockup() {
  const list=[{n:"Sarah Chen",t:"Wedding",r:"5.0",p:"EUR 150/hr",s:50},{n:"Marcus R.",t:"Portrait",r:"4.9",p:"EUR 80/hr",s:51},{n:"Elena P.",t:"Events",r:"4.8",p:"EUR 120/hr",s:52},{n:"James O.",t:"Family",r:"5.0",p:"EUR 95/hr",s:53}];
  return (
    <div className="aspect-[4/3] rounded-2xl bg-cream-50 shadow-lift border border-cream-200 overflow-hidden">
      <div className="h-8 bg-white border-b border-cream-200 flex items-center px-3 gap-2">
        <Search className="h-2.5 w-2.5 text-navy-400"/>
        <div className="flex-1 bg-cream-100 rounded h-4 flex items-center px-2"><span className="text-[6px] text-navy-400">Search photographers in London...</span></div>
      </div>
      <div className="p-1.5 grid grid-cols-2 gap-1.5">
        {list.map(p=>(
          <div key={p.n} className="bg-white rounded-xl border border-cream-200 overflow-hidden">
            <div className="h-12 overflow-hidden"><Img seed={p.s} w={300} h={200} alt={`${p.n} ${p.t} photography portfolio`}/></div>
            <div className="p-1.5">
              <div className="text-[7px] font-semibold text-navy-900">{p.n}</div>
              <div className="text-[5px] text-navy-400">{p.t} &middot; <Star className="h-1.5 w-1.5 inline fill-gold-400 text-gold-400"/> {p.r}</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[6px] text-navy-500">From {p.p}</span>
                <span className="text-[5px] bg-navy-900 text-white px-1 py-0.5 rounded-full">Book</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileGalleryMockup() {
  return (
    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200 rounded-2xl shadow-lift border border-cream-200 p-6">
      {/* Phone frame */}
      <div className="w-[180px] h-[320px] bg-navy-900 rounded-[28px] p-2 shadow-xl relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-navy-900 rounded-b-xl z-10" />
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[20px] overflow-hidden relative">
          {/* Status bar */}
          <div className="h-6 bg-brand-500 flex items-center justify-between px-3">
            <span className="text-[6px] text-white/70">9:41</span>
            <div className="flex gap-0.5"><div className="w-2 h-1.5 bg-white/50 rounded-sm"/><div className="w-2 h-1.5 bg-white/50 rounded-sm"/></div>
          </div>
          {/* Gallery header */}
          <div className="px-2 py-1.5 border-b border-cream-200">
            <div className="text-[7px] font-display text-navy-900">Beach Wedding</div>
            <div className="text-[5px] text-navy-400">by Sarah Chen</div>
          </div>
          {/* Photo grid */}
          <div className="grid grid-cols-2 gap-0.5 p-1">
            {[10,11,12,13,14,15].map(s => (
              <div key={s} className="aspect-square rounded-sm overflow-hidden">
                <Img seed={s} w={150} h={150} alt={`Mobile gallery photo ${s - 9}`}/>
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-cream-200 px-2 py-1.5 flex items-center justify-between">
            <span className="text-[5px] text-navy-400">48 photos</span>
            <span className="text-[5px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full">Unlock</span>
          </div>
        </div>
      </div>
      {/* Install prompt */}
      <div className="ml-4 max-w-[140px]">
        <div className="bg-white rounded-xl shadow-card p-3 border border-cream-200 mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded bg-brand-500 flex items-center justify-center">
              <Camera className="h-2.5 w-2.5 text-white"/>
            </div>
            <div>
              <div className="text-[7px] font-semibold text-navy-900">Add to Home Screen</div>
              <div className="text-[5px] text-navy-400">fotiqo.com</div>
            </div>
          </div>
          <div className="flex gap-1">
            <span className="text-[5px] bg-cream-100 text-navy-500 px-1.5 py-0.5 rounded">Cancel</span>
            <span className="text-[5px] bg-brand-500 text-white px-1.5 py-0.5 rounded">Add</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[6px] text-navy-600"><span className="w-3 h-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[5px]">&#10003;</span>Works offline</div>
          <div className="flex items-center gap-1.5 text-[6px] text-navy-600"><span className="w-3 h-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[5px]">&#10003;</span>Push notifications</div>
          <div className="flex items-center gap-1.5 text-[6px] text-navy-600"><span className="w-3 h-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[5px]">&#10003;</span>Your branding</div>
          <div className="flex items-center gap-1.5 text-[6px] text-navy-600"><span className="w-3 h-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[5px]">&#10003;</span>Full-screen app</div>
        </div>
      </div>
    </div>
  );
}

export default ProductMockup;
