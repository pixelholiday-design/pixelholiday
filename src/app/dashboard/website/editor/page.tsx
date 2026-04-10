"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image, Type, Layout, Grid3X3, MessageSquare, Star, Phone, Zap,
  HelpCircle, BarChart3, Minus, Video, BookOpen, Calendar,
  GripVertical, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Save, Globe, Monitor, Tablet, Smartphone, Plus, ArrowLeft, Loader2, Share2,
} from "lucide-react";
import Link from "next/link";

type Block = {
  id: string;
  type: string;
  sortOrder: number;
  content: any;
  settings: any;
  isVisible: boolean;
};

const BLOCK_TYPES = [
  { type: "HERO", label: "Hero", icon: Layout, group: "Layout", defaultContent: { heading: "Welcome to my studio", subheading: "Professional photography for every occasion", buttonText: "Book a session", buttonLink: "/book" } },
  { type: "SPACER", label: "Spacer", icon: Minus, group: "Layout", defaultContent: { height: 60 } },
  { type: "DIVIDER", label: "Divider", icon: Minus, group: "Layout", defaultContent: { style: "solid", color: "light" } },
  { type: "TEXT", label: "Text", icon: Type, group: "Content", defaultContent: { text: "Write your content here..." } },
  { type: "IMAGE", label: "Image", icon: Image, group: "Content", defaultContent: { url: "", caption: "" } },
  { type: "VIDEO", label: "Video", icon: Video, group: "Content", defaultContent: { embedUrl: "" } },
  { type: "ABOUT", label: "About", icon: MessageSquare, group: "Content", defaultContent: { bio: "I'm a passionate photographer...", photoUrl: "", layout: "photo-left" } },
  { type: "GALLERY_GRID", label: "Gallery", icon: Grid3X3, group: "Portfolio", defaultContent: { columns: 3, maxPhotos: 12 } },
  { type: "BLOG_FEED", label: "Blog", icon: BookOpen, group: "Portfolio", defaultContent: { count: 3 } },
  { type: "SERVICES", label: "Services", icon: Zap, group: "Business", defaultContent: { cards: [{ name: "Portrait Session", description: "1-hour portrait session", price: "150" }], columns: 3 } },
  { type: "TESTIMONIALS", label: "Testimonials", icon: Star, group: "Business", defaultContent: { items: [{ name: "Jane Doe", quote: "Amazing photographer!" }] } },
  { type: "CONTACT_FORM", label: "Contact", icon: Phone, group: "Business", defaultContent: { showPhone: true, showSessionType: true, buttonText: "Send message" } },
  { type: "BOOKING_WIDGET", label: "Booking", icon: Calendar, group: "Business", defaultContent: { heading: "Book your session" } },
  { type: "FAQ", label: "FAQ", icon: HelpCircle, group: "Business", defaultContent: { items: [{ question: "How long until I get my photos?", answer: "Typically 2-4 weeks after your session." }] } },
  { type: "STATS", label: "Stats", icon: BarChart3, group: "Business", defaultContent: { items: [{ number: "500+", label: "Sessions" }, { number: "50+", label: "5-star reviews" }] } },
  { type: "CTA", label: "CTA Banner", icon: Zap, group: "Social", defaultContent: { heading: "Ready to book?", subheading: "Let's create something beautiful together.", buttonText: "Get in touch", buttonLink: "/contact", bgColor: "#0EA5A5" } },
  { type: "INSTAGRAM", label: "Social Feed", icon: Share2, group: "Social", defaultContent: { handle: "@myphotography" } },
];

const GROUPS = ["Layout", "Content", "Portfolio", "Business", "Social"];

export default function WebsiteEditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSlug, setPageSlug] = useState("home");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const selectedBlock = blocks.find((b) => b.id === selectedId);

  // Load blocks
  useEffect(() => {
    setLoading(true);
    fetch(`/api/website/blocks?page=${pageSlug}`)
      .then((r) => r.json())
      .then((d) => setBlocks(d.blocks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageSlug]);

  // Add block
  async function addBlock(type: string) {
    const def = BLOCK_TYPES.find((b) => b.type === type);
    if (!def) return;
    const res = await fetch("/api/website/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, pageSlug, content: def.defaultContent, settings: {} }),
    }).then((r) => r.json());
    if (res.block) {
      setBlocks((prev) => [...prev, res.block]);
      setSelectedId(res.block.id);
    }
  }

  // Delete block
  async function deleteBlock(id: string) {
    await fetch(`/api/website/blocks/${id}`, { method: "DELETE" });
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Move block up/down
  async function moveBlock(id: string, direction: "up" | "down") {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    newBlocks.forEach((b, i) => (b.sortOrder = i));
    setBlocks(newBlocks);
    await fetch("/api/website/blocks/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: newBlocks.map((b, i) => ({ id: b.id, sortOrder: i })) }),
    });
  }

  // Update block content
  const updateBlockContent = useCallback(async (id: string, content: any) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    // Debounced save
    await fetch(`/api/website/blocks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { ...blocks.find((b) => b.id === id)?.content, ...content } }),
    });
  }, [blocks]);

  return (
    <div className="h-screen flex flex-col bg-cream-100 -mt-14 lg:-mt-0 -mb-16 lg:mb-0">
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-cream-300 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/website" className="text-navy-400 hover:text-brand-500 transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="font-display text-sm text-navy-900">Website Editor</span>
          {/* Page tabs */}
          <div className="flex gap-1 ml-4">
            {["home", "about", "portfolio", "services", "contact"].map((p) => (
              <button key={p} onClick={() => setPageSlug(p)} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${pageSlug === p ? "bg-navy-900 text-white" : "text-navy-500 hover:bg-cream-200"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-cream-200 rounded-lg p-0.5">
            {[{ key: "desktop", icon: Monitor }, { key: "tablet", icon: Tablet }, { key: "mobile", icon: Smartphone }].map(({ key, icon: Icon }) => (
              <button key={key} onClick={() => setPreviewDevice(key as any)} className={`p-1.5 rounded-md transition ${previewDevice === key ? "bg-white shadow-sm" : ""}`}>
                <Icon className="h-3.5 w-3.5 text-navy-500" />
              </button>
            ))}
          </div>
          <a href="/p/me" target="_blank" rel="noreferrer" className="btn-secondary text-xs !py-1.5 !px-3">
            <Eye className="h-3.5 w-3.5" /> Preview
          </a>
          <button className="btn-primary text-xs !py-1.5 !px-3">
            <Globe className="h-3.5 w-3.5" /> Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Block palette */}
        <div className="w-56 bg-white border-r border-cream-300 overflow-y-auto flex-shrink-0 p-3">
          <div className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-2">Add blocks</div>
          {GROUPS.map((group) => (
            <div key={group} className="mb-3">
              <div className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-1 px-1">{group}</div>
              <div className="space-y-1">
                {BLOCK_TYPES.filter((b) => b.group === group).map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition text-left"
                    >
                      <Icon className="h-3.5 w-3.5 text-navy-400" />
                      {bt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER — Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-cream-200/50">
          <div
            className="mx-auto bg-white rounded-xl shadow-card min-h-[400px] overflow-hidden transition-all"
            style={{ maxWidth: previewDevice === "mobile" ? 375 : previewDevice === "tablet" ? 768 : "100%" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
            ) : blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed border-cream-300 rounded-xl m-4">
                <Layout className="h-10 w-10 text-navy-300 mb-3" />
                <p className="text-navy-500 font-medium">No blocks yet</p>
                <p className="text-xs text-navy-400 mt-1">Click a block from the left panel to add it</p>
              </div>
            ) : (
              blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`relative group border-2 transition ${selectedId === block.id ? "border-brand-400" : "border-transparent hover:border-brand-200"}`}
                  onClick={() => setSelectedId(block.id)}
                >
                  {/* Block controls */}
                  <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }} disabled={idx === 0} className="h-6 w-6 rounded bg-white/90 shadow-sm flex items-center justify-center text-navy-400 hover:text-navy-600 disabled:opacity-30">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }} disabled={idx === blocks.length - 1} className="h-6 w-6 rounded bg-white/90 shadow-sm flex items-center justify-center text-navy-400 hover:text-navy-600 disabled:opacity-30">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="h-6 w-6 rounded bg-white/90 shadow-sm flex items-center justify-center text-coral-400 hover:text-coral-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Block type label */}
                  <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-[9px] bg-navy-900/70 text-white rounded px-1.5 py-0.5 font-mono">{block.type}</span>
                  </div>
                  {/* Render block preview */}
                  <BlockPreview block={block} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — Settings panel */}
        <div className="w-72 bg-white border-l border-cream-300 overflow-y-auto flex-shrink-0 p-4">
          {selectedBlock ? (
            <BlockSettings block={selectedBlock} onUpdate={updateBlockContent} />
          ) : (
            <div className="text-center py-12 text-navy-400">
              <Layout className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a block to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Block Preview ─────────────────────────────────────

function BlockPreview({ block }: { block: Block }) {
  const c = block.content || {};
  switch (block.type) {
    case "HERO":
      return (
        <div className="relative h-64 bg-gradient-to-br from-navy-800 to-brand-700 flex items-center justify-center text-white text-center p-8" style={c.bgImage ? { backgroundImage: `url(${c.bgImage})`, backgroundSize: "cover" } : {}}>
          <div className="relative z-10">
            <h2 className="font-display text-3xl mb-2">{c.heading || "Hero Heading"}</h2>
            <p className="text-white/70 mb-4">{c.subheading || "Subheading text"}</p>
            {c.buttonText && <span className="inline-block bg-white/20 px-4 py-2 rounded-lg text-sm font-medium">{c.buttonText}</span>}
          </div>
        </div>
      );
    case "TEXT":
      return <div className="px-8 py-6 prose prose-navy max-w-none text-sm">{c.text || "Text content..."}</div>;
    case "ABOUT":
      return (
        <div className="px-8 py-6 flex gap-6 items-center">
          <div className="w-32 h-32 rounded-xl bg-cream-200 flex-shrink-0 flex items-center justify-center"><Image className="h-8 w-8 text-cream-400" /></div>
          <div><p className="text-sm text-navy-700">{c.bio || "About text..."}</p></div>
        </div>
      );
    case "SERVICES":
      return (
        <div className="px-8 py-6">
          <div className={`grid grid-cols-${c.columns || 3} gap-4`}>
            {(c.cards || [{ name: "Service", description: "Description", price: "100" }]).map((s: any, i: number) => (
              <div key={i} className="border border-cream-300 rounded-xl p-4 text-center">
                <div className="font-semibold text-navy-900 text-sm">{s.name}</div>
                <div className="text-xs text-navy-400 mt-1">{s.description}</div>
                <div className="font-display text-lg text-navy-900 mt-2">&euro;{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "TESTIMONIALS":
      return (
        <div className="px-8 py-6 bg-cream-50">
          {(c.items || []).map((t: any, i: number) => (
            <div key={i} className="text-center py-4">
              <p className="text-sm text-navy-700 italic">"{t.quote}"</p>
              <p className="text-xs text-navy-500 mt-2 font-semibold">&mdash; {t.name}</p>
            </div>
          ))}
        </div>
      );
    case "CTA":
      return (
        <div className="px-8 py-10 text-center text-white" style={{ background: c.bgColor || "#0EA5A5" }}>
          <h3 className="font-display text-2xl mb-1">{c.heading || "Call to action"}</h3>
          <p className="text-white/70 text-sm mb-4">{c.subheading || "Subtext"}</p>
          <span className="inline-block bg-white/20 px-5 py-2 rounded-lg text-sm font-medium">{c.buttonText || "Button"}</span>
        </div>
      );
    case "CONTACT_FORM":
      return (
        <div className="px-8 py-6">
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="h-9 bg-cream-100 rounded-lg border border-cream-300" />
            <div className="h-9 bg-cream-100 rounded-lg border border-cream-300" />
            <div className="h-20 bg-cream-100 rounded-lg border border-cream-300" />
            <div className="h-9 bg-brand-400 rounded-lg flex items-center justify-center text-white text-xs font-medium">{c.buttonText || "Send"}</div>
          </div>
        </div>
      );
    case "FAQ":
      return (
        <div className="px-8 py-6 space-y-2">
          {(c.items || []).map((q: any, i: number) => (
            <div key={i} className="border border-cream-300 rounded-lg p-3">
              <div className="font-semibold text-navy-900 text-xs">{q.question}</div>
              <div className="text-xs text-navy-500 mt-1">{q.answer}</div>
            </div>
          ))}
        </div>
      );
    case "STATS":
      return (
        <div className="px-8 py-6 flex justify-center gap-8">
          {(c.items || []).map((s: any, i: number) => (
            <div key={i} className="text-center">
              <div className="font-display text-2xl text-navy-900">{s.number}</div>
              <div className="text-xs text-navy-500">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case "GALLERY_GRID":
      return (
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-cream-200 rounded-lg" />
            ))}
          </div>
        </div>
      );
    case "SPACER":
      return <div style={{ height: c.height || 60 }} className="bg-cream-50/50" />;
    case "DIVIDER":
      return <div className="px-8 py-4"><hr className="border-cream-300" /></div>;
    case "BOOKING_WIDGET":
      return (
        <div className="px-8 py-6 text-center bg-brand-50">
          <Calendar className="h-8 w-8 text-brand-400 mx-auto mb-2" />
          <div className="font-display text-lg text-navy-900">{c.heading || "Book your session"}</div>
          <div className="h-9 bg-brand-400 rounded-lg mt-3 max-w-xs mx-auto flex items-center justify-center text-white text-xs font-medium">Book Now</div>
        </div>
      );
    default:
      return <div className="px-8 py-4 text-xs text-navy-400">{block.type} block</div>;
  }
}

// ── Block Settings Panel ─────────────────────────────

function BlockSettings({ block, onUpdate }: { block: Block; onUpdate: (id: string, content: any) => void }) {
  const c = block.content || {};

  function update(key: string, value: any) {
    onUpdate(block.id, { [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-navy-400 uppercase tracking-wide">{block.type.replace("_", " ")} Settings</div>

      {block.type === "HERO" && (
        <>
          <Field label="Heading" value={c.heading} onChange={(v) => update("heading", v)} />
          <Field label="Subheading" value={c.subheading} onChange={(v) => update("subheading", v)} />
          <Field label="Button text" value={c.buttonText} onChange={(v) => update("buttonText", v)} />
          <Field label="Button link" value={c.buttonLink} onChange={(v) => update("buttonLink", v)} />
          <Field label="Background image URL" value={c.bgImage} onChange={(v) => update("bgImage", v)} placeholder="https://..." />
        </>
      )}
      {block.type === "TEXT" && (
        <div>
          <label className="label-xs block mb-1">Content</label>
          <textarea className="input !h-32 text-sm" value={c.text || ""} onChange={(e) => update("text", e.target.value)} />
        </div>
      )}
      {block.type === "ABOUT" && (
        <>
          <div><label className="label-xs block mb-1">Bio</label><textarea className="input !h-24 text-sm" value={c.bio || ""} onChange={(e) => update("bio", e.target.value)} /></div>
          <Field label="Photo URL" value={c.photoUrl} onChange={(v) => update("photoUrl", v)} placeholder="https://..." />
        </>
      )}
      {block.type === "CTA" && (
        <>
          <Field label="Heading" value={c.heading} onChange={(v) => update("heading", v)} />
          <Field label="Subheading" value={c.subheading} onChange={(v) => update("subheading", v)} />
          <Field label="Button text" value={c.buttonText} onChange={(v) => update("buttonText", v)} />
          <Field label="Button link" value={c.buttonLink} onChange={(v) => update("buttonLink", v)} />
          <Field label="Background color" value={c.bgColor} onChange={(v) => update("bgColor", v)} placeholder="#0EA5A5" />
        </>
      )}
      {block.type === "CONTACT_FORM" && (
        <Field label="Button text" value={c.buttonText} onChange={(v) => update("buttonText", v)} />
      )}
      {block.type === "SPACER" && (
        <div>
          <label className="label-xs block mb-1">Height ({c.height || 60}px)</label>
          <input type="range" min="20" max="200" value={c.height || 60} onChange={(e) => update("height", parseInt(e.target.value))} className="w-full" />
        </div>
      )}
      {block.type === "GALLERY_GRID" && (
        <div>
          <label className="label-xs block mb-1">Columns</label>
          <select className="input text-sm" value={c.columns || 3} onChange={(e) => update("columns", parseInt(e.target.value))}>
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
        </div>
      )}
      {block.type === "BOOKING_WIDGET" && (
        <Field label="Heading" value={c.heading} onChange={(v) => update("heading", v)} />
      )}
      {(block.type === "STATS" || block.type === "FAQ" || block.type === "TESTIMONIALS" || block.type === "SERVICES") && (
        <p className="text-xs text-navy-400">Edit items in the JSON content. Advanced editor coming soon.</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      <input className="input text-sm" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
