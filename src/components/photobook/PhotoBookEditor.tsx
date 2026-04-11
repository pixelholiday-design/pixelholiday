"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Save, Eye, Sparkles, X, ChevronLeft, ChevronRight,
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Star,
  Type, Image, Shapes, Layout, Palette, RotateCcw, RotateCw,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Edit3,
} from "lucide-react";
import type { BookElement, BookPage, GalleryPhoto, SavedDesign, ToolTab } from "./types";
import { LAYOUT_PRESETS, SHAPE_CLIPS, BG_COLORS, BG_GRADIENTS, FONTS, TEXT_PRESETS, COLOR_SWATCHES } from "./layouts";
import PageThumbnails from "./PageThumbnails";
import CanvasArea from "./CanvasArea";
import PreviewOverlay from "./PreviewOverlay";

interface Props {
  galleryId: string;
  magicLinkToken: string;
  photos: GalleryPhoto[];
  photographerName: string;
  locationName: string;
  savedDesign: SavedDesign | null;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function createDefaultPages(): BookPage[] {
  return [
    { pageNumber: 0, elements: [], background: "#FFFFFF" },
    { pageNumber: 1, elements: [], background: "#FFFFFF" },
  ];
}

export default function PhotoBookEditor({
  galleryId,
  magicLinkToken,
  photos,
  photographerName,
  locationName,
  savedDesign,
}: Props) {
  const [designId, setDesignId] = useState(savedDesign?.id || "");
  const [title, setTitle] = useState(savedDesign?.title || "My Photo Book");
  const [pages, setPages] = useState<BookPage[]>(() => {
    if (savedDesign?.pages && Array.isArray(savedDesign.pages) && savedDesign.pages.length > 0) {
      return savedDesign.pages as BookPage[];
    }
    return createDefaultPages();
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolTab>("photos");
  const [history, setHistory] = useState<BookPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // Push to history
  const pushHistory = useCallback((newPages: BookPage[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, JSON.parse(JSON.stringify(newPages))].slice(-30);
    });
    setHistoryIndex((i) => Math.min(i + 1, 29));
  }, [historyIndex]);

  const updatePages = useCallback((updater: (prev: BookPage[]) => BookPage[]) => {
    setPages((prev) => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setPages(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setPages(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Auto-save every 30s
  useEffect(() => {
    const snap = JSON.stringify({ title, pages });
    if (snap === lastSavedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      doSave();
    }, 30000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, title]);

  async function doSave() {
    setSaving(true);
    try {
      const body = { title, pages, galleryId };
      if (designId) {
        await fetch("/api/photobook", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: designId, ...body }),
        });
      } else {
        const res = await fetch("/api/photobook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.design?.id) setDesignId(data.design.id);
      }
      lastSavedRef.current = JSON.stringify({ title, pages });
    } catch {
      // silent fail for auto-save
    }
    setSaving(false);
  }

  // Element operations
  const currentPageData = pages[currentPage] || pages[0];
  const selectedEl = currentPageData?.elements.find((e) => e.id === selectedElement);

  function updateElement(id: string, updates: Partial<BookElement>) {
    updatePages((prev) =>
      prev.map((p, i) =>
        i === currentPage
          ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)) }
          : p
      )
    );
  }

  function addElement(el: Omit<BookElement, "id">) {
    const newEl: BookElement = { ...el, id: uid() };
    updatePages((prev) =>
      prev.map((p, i) =>
        i === currentPage ? { ...p, elements: [...p.elements, newEl] } : p
      )
    );
    setSelectedElement(newEl.id);
  }

  function deleteElement(id: string) {
    updatePages((prev) =>
      prev.map((p, i) =>
        i === currentPage ? { ...p, elements: p.elements.filter((e) => e.id !== id) } : p
      )
    );
    if (selectedElement === id) setSelectedElement(null);
  }

  function duplicateElement(id: string) {
    const el = currentPageData.elements.find((e) => e.id === id);
    if (!el) return;
    const newEl = { ...el, id: uid(), x: el.x + 3, y: el.y + 3 };
    updatePages((prev) =>
      prev.map((p, i) =>
        i === currentPage ? { ...p, elements: [...p.elements, newEl] } : p
      )
    );
    setSelectedElement(newEl.id);
  }

  function bringForward(id: string) {
    updatePages((prev) =>
      prev.map((p, i) => {
        if (i !== currentPage) return p;
        const idx = p.elements.findIndex((e) => e.id === id);
        if (idx < p.elements.length - 1) {
          const els = [...p.elements];
          [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
          return { ...p, elements: els };
        }
        return p;
      })
    );
  }

  function sendBack(id: string) {
    updatePages((prev) =>
      prev.map((p, i) => {
        if (i !== currentPage) return p;
        const idx = p.elements.findIndex((e) => e.id === id);
        if (idx > 0) {
          const els = [...p.elements];
          [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
          return { ...p, elements: els };
        }
        return p;
      })
    );
  }

  function addPage() {
    updatePages((prev) => [
      ...prev,
      { pageNumber: prev.length, elements: [], background: "#FFFFFF" },
    ]);
  }

  function setPageBackground(bg: string) {
    updatePages((prev) =>
      prev.map((p, i) => (i === currentPage ? { ...p, background: bg } : p))
    );
  }

  // Apply layout preset
  function applyLayout(preset: typeof LAYOUT_PRESETS[0]) {
    const newElements: BookElement[] = preset.elements.map((e) => ({
      ...e,
      id: uid(),
      content: e.type === "text" ? (e as { content?: string }).content || "Your text here" : "",
    }));
    updatePages((prev) =>
      prev.map((p, i) =>
        i === currentPage ? { ...p, elements: newElements } : p
      )
    );
    setSelectedElement(null);
  }

  // AI Auto-Fill
  function autoFill() {
    if (photos.length === 0) return;
    const layoutCycle = ["two-col", "hero-left", "grid-4", "three-up", "hero-right", "collage-5"];
    const newPages: BookPage[] = [];
    let photoIdx = 0;

    // Cover / title page
    const titleLayout = LAYOUT_PRESETS.find((l) => l.name === "title-page")!;
    const coverEls: BookElement[] = titleLayout.elements.map((e) => {
      const el: BookElement = { ...e, id: uid(), content: e.type === "text" ? title : "" };
      if (e.type === "photo" && photoIdx < photos.length) {
        el.content = photos[photoIdx++].url;
      }
      return el;
    });
    newPages.push({ pageNumber: 0, elements: coverEls, background: "#FFF8F0" });

    // Pages 1-2: full bleed
    for (let i = 0; i < 2 && photoIdx < photos.length; i++) {
      newPages.push({
        pageNumber: newPages.length,
        elements: [{
          id: uid(), type: "photo", x: 0, y: 0, width: 100, height: 100,
          rotation: 0, content: photos[photoIdx++].url, style: {},
        }],
        background: "#FFFFFF",
      });
    }

    // Remaining pages with cycling layouts
    let cycleIdx = 0;
    while (photoIdx < photos.length) {
      const layoutName = layoutCycle[cycleIdx % layoutCycle.length];
      const preset = LAYOUT_PRESETS.find((l) => l.name === layoutName)!;
      const photoSlots = preset.elements.filter((e) => e.type === "photo");
      if (photoIdx + photoSlots.length > photos.length && photoIdx < photos.length) {
        // Just do remaining as centered singles
        while (photoIdx < photos.length) {
          newPages.push({
            pageNumber: newPages.length,
            elements: [{
              id: uid(), type: "photo", x: 10, y: 10, width: 80, height: 80,
              rotation: 0, content: photos[photoIdx++].url, style: {},
            }],
            background: "#FFFFFF",
          });
        }
        break;
      }
      const els: BookElement[] = preset.elements.map((e) => {
        const el: BookElement = { ...e, id: uid(), content: "" };
        if (e.type === "photo" && photoIdx < photos.length) {
          el.content = photos[photoIdx++].url;
        }
        return el;
      });
      newPages.push({ pageNumber: newPages.length, elements: els, background: "#FFFFFF" });
      cycleIdx++;
    }

    setPages(newPages);
    pushHistory(newPages);
    setCurrentPage(0);
    setSelectedElement(null);
  }

  // Tool panel tabs config
  const toolTabs: { key: ToolTab; icon: React.ReactNode; label: string }[] = [
    { key: "photos", icon: <Image size={16} />, label: "Photos" },
    { key: "layouts", icon: <Layout size={16} />, label: "Layouts" },
    { key: "text", icon: <Type size={16} />, label: "Text" },
    { key: "shapes", icon: <Shapes size={16} />, label: "Shapes" },
    { key: "backgrounds", icon: <Palette size={16} />, label: "BGs" },
  ];

  if (showPreview) {
    return (
      <PreviewOverlay
        pages={pages}
        photos={photos}
        onClose={() => setShowPreview(false)}
        magicLinkToken={magicLinkToken}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-navy-900 text-white shrink-0">
        <div className="flex items-center gap-3">
          <a href={`/gallery/${magicLinkToken}`} className="p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </a>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-b border-white/30 focus:border-brand-500 outline-none text-lg font-semibold px-1 py-0.5 min-w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-white/10 rounded disabled:opacity-30" title="Undo">
            <RotateCcw size={16} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white/10 rounded disabled:opacity-30" title="Redo">
            <RotateCw size={16} />
          </button>
          <button onClick={autoFill} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 rounded text-sm font-medium">
            <Sparkles size={14} /> AI Auto-Fill
          </button>
          <button onClick={() => doSave()} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm">
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded text-sm font-medium">
            <Eye size={14} /> Preview Book
          </button>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Page Thumbnails */}
        <PageThumbnails
          pages={pages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onAddPage={addPage}
          photos={photos}
        />

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas toolbar */}
          {selectedEl && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b shrink-0">
              <button onClick={() => deleteElement(selectedEl.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete">
                <Trash2 size={16} />
              </button>
              <button onClick={() => duplicateElement(selectedEl.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
                <Copy size={16} />
              </button>
              <button onClick={() => bringForward(selectedEl.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Bring Forward">
                <ArrowUp size={16} />
              </button>
              <button onClick={() => sendBack(selectedEl.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Send Back">
                <ArrowDown size={16} />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <label className="text-xs text-gray-500">Rotate</label>
              <input
                type="range"
                min={-180}
                max={180}
                value={selectedEl.rotation}
                onChange={(e) => updateElement(selectedEl.id, { rotation: Number(e.target.value) })}
                className="w-24 accent-brand-500"
              />
              <span className="text-xs text-gray-500 w-8">{selectedEl.rotation}°</span>
            </div>
          )}

          <CanvasArea
            page={currentPageData}
            selectedElement={selectedElement}
            editingText={editingText}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onSetEditingText={setEditingText}
            photos={photos}
          />
        </div>

        {/* Right: Tool Panel */}
        <div className="w-72 bg-white border-l flex flex-col shrink-0">
          {/* Tool tabs */}
          <div className="flex border-b shrink-0">
            {toolTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  tool === t.key ? "text-brand-500 border-b-2 border-brand-500 bg-brand-50" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tool content */}
          <div className="flex-1 overflow-y-auto p-3">
            {tool === "photos" && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{photos.length} photos available</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => addElement({
                        type: "photo", x: 20, y: 20, width: 60, height: 60,
                        rotation: 0, content: photo.url, style: {},
                      })}
                      className="aspect-square rounded overflow-hidden border-2 border-transparent hover:border-brand-500 transition-colors relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      {photo.isFavorited && (
                        <Star size={10} className="absolute top-0.5 right-0.5 text-yellow-400 fill-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool === "layouts" && (
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyLayout(preset)}
                    className="border rounded p-2 hover:border-brand-500 hover:bg-brand-50 transition-colors"
                  >
                    {/* Mini layout preview */}
                    <div className="relative w-full aspect-[3/2] bg-gray-100 rounded-sm mb-1">
                      {preset.elements.map((e, idx) => (
                        <div
                          key={idx}
                          className={`absolute ${e.type === "photo" ? "bg-brand-200" : "bg-gray-300"} rounded-sm`}
                          style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.width}%`, height: `${e.height}%` }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-600">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            {tool === "text" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Add Text</p>
                  <div className="space-y-1.5">
                    {TEXT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => addElement({
                          type: "text", x: 10, y: 40, width: 80, height: 20,
                          rotation: 0, content: preset.label === "Heading" ? title : "Your text here",
                          style: { fontFamily: preset.fontFamily, fontSize: preset.fontSize, color: "#0C2E3D", bold: preset.bold, italic: false, align: "center" },
                        })}
                        className="w-full text-left px-3 py-2 rounded border hover:border-brand-500 hover:bg-brand-50 transition-colors"
                      >
                        <span style={{ fontFamily: preset.fontFamily, fontSize: Math.min(preset.fontSize * 0.4, 18), fontWeight: preset.bold ? 700 : 400 }}>
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text formatting when text selected */}
                {selectedEl?.type === "text" && (
                  <div className="border-t pt-3 space-y-3">
                    <p className="text-xs font-semibold text-gray-700">Format Text</p>
                    <select
                      value={(selectedEl.style.fontFamily as string) || "DM Sans"}
                      onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, fontFamily: e.target.value } })}
                      className="w-full text-sm border rounded px-2 py-1"
                    >
                      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div>
                      <label className="text-xs text-gray-500">Size: {selectedEl.style.fontSize as number || 16}px</label>
                      <input
                        type="range" min={8} max={120}
                        value={(selectedEl.style.fontSize as number) || 16}
                        onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, fontSize: Number(e.target.value) } })}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, bold: !selectedEl.style.bold } })}
                        className={`p-1.5 rounded ${selectedEl.style.bold ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><Bold size={14} /></button>
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, italic: !selectedEl.style.italic } })}
                        className={`p-1.5 rounded ${selectedEl.style.italic ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><Italic size={14} /></button>
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, underline: !selectedEl.style.underline } })}
                        className={`p-1.5 rounded ${selectedEl.style.underline ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><Underline size={14} /></button>
                      <div className="w-px bg-gray-200 mx-0.5" />
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, align: "left" } })}
                        className={`p-1.5 rounded ${selectedEl.style.align === "left" ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><AlignLeft size={14} /></button>
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, align: "center" } })}
                        className={`p-1.5 rounded ${selectedEl.style.align === "center" || !selectedEl.style.align ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><AlignCenter size={14} /></button>
                      <button
                        onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, align: "right" } })}
                        className={`p-1.5 rounded ${selectedEl.style.align === "right" ? "bg-brand-500 text-white" : "border hover:bg-gray-50"}`}
                      ><AlignRight size={14} /></button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Color</p>
                      <div className="flex flex-wrap gap-1">
                        {COLOR_SWATCHES.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, color: c } })}
                            className={`w-6 h-6 rounded-full border-2 ${selectedEl.style.color === c ? "border-brand-500 scale-110" : "border-gray-200"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tool === "shapes" && (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  {selectedEl?.type === "photo" ? "Apply shape to selected photo" : "Select a photo first"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(SHAPE_CLIPS).map(([name, clip]) => (
                    <button
                      key={name}
                      disabled={!selectedEl || selectedEl.type !== "photo"}
                      onClick={() => {
                        if (selectedEl?.type === "photo") {
                          updateElement(selectedEl.id, { style: { ...selectedEl.style, clipPath: clip } });
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2 border rounded hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <div
                        className="w-10 h-10 bg-brand-300"
                        style={{
                          clipPath: clip && clip !== "rounded" && clip !== "polaroid" ? clip : undefined,
                          borderRadius: clip === "rounded" ? "20%" : clip === "polaroid" ? "2px" : undefined,
                          border: clip === "polaroid" ? "3px solid white" : undefined,
                          boxShadow: clip === "polaroid" ? "0 2px 4px rgba(0,0,0,0.15)" : undefined,
                        }}
                      />
                      <span className="text-[9px] text-gray-600 capitalize">{name.replace("-", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool === "backgrounds" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Solid Colors</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BG_COLORS.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => setPageBackground(bg.value)}
                        className={`aspect-square rounded border-2 ${currentPageData.background === bg.value ? "border-brand-500 scale-105" : "border-gray-200"}`}
                        style={{ backgroundColor: bg.value }}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Gradients</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BG_GRADIENTS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setPageBackground(g)}
                        className={`aspect-[3/2] rounded border-2 ${currentPageData.background === g ? "border-brand-500 scale-105" : "border-gray-200"}`}
                        style={{ background: g }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Use Photo as Background</p>
                  <div className="grid grid-cols-4 gap-1">
                    {photos.slice(0, 8).map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setPageBackground(`url(${photo.url})`)}
                        className="aspect-square rounded overflow-hidden border-2 border-transparent hover:border-brand-500"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
