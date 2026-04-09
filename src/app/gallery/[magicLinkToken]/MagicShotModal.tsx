"use client";
import { useEffect, useState } from "react";
import { X, Sparkles, Check, Loader2 } from "lucide-react";

type Element = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  position: string | null;
  assetUrl: string;
};

type SourcePhoto = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
};

export default function MagicShotModal({
  photo,
  onClose,
  onSaved,
}: {
  photo: SourcePhoto;
  onClose: () => void;
  onSaved: (newPhoto: any) => void;
}) {
  const [elements, setElements] = useState<Element[] | null>(null);
  const [picked, setPicked] = useState<Element | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/magic-elements")
      .then((r) => r.json())
      .then((data) => {
        const list: Element[] = (data.elements || []).filter((e: any) => e.isActive);
        setElements(list);
        if (list.length > 0) setPicked(list[0]);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function save() {
    if (!picked) return;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/ai/magic-shot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ photoId: photo.id, elementId: picked.id }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Failed");
        return;
      }
      onSaved(data.photo);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // CSS-composed preview: background image + overlay positioned by element.position.
  // This works regardless of whether Cloudinary is configured.
  const sourceUrl = photo.s3Key_highRes;
  const overlayUrl = picked?.assetUrl || "";
  const position = picked?.position || "CENTER";
  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    ...(position === "TOP" && { top: "8%", left: "50%", transform: "translateX(-50%)", width: "55%" }),
    ...(position === "CENTER" && { top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60%" }),
    ...(position === "FACE" && { top: "32%", left: "50%", transform: "translate(-50%,-50%)", width: "55%" }),
    ...(position === "BORDER" && { inset: 0, width: "100%", height: "100%" }),
    ...(position === "SCATTER" && { inset: 0, width: "100%", height: "100%", opacity: 0.85 }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lift max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-cream-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-500" />
            <h3 className="font-display text-2xl text-navy-900">Add magic to your photo</h3>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-cream-200 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-navy-700" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <div className="label-xs mb-2">Preview</div>
            <div className="relative rounded-2xl overflow-hidden bg-navy-900 aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sourceUrl} alt="" className="w-full h-full object-cover" />
              {picked && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={overlayUrl} alt="" style={overlayStyle} />
              )}
            </div>
            {picked && (
              <div className="mt-3">
                <div className="font-display text-lg text-navy-900">{picked.name}</div>
                {picked.description && (
                  <p className="text-navy-500 text-sm mt-1">{picked.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Picker */}
          <div>
            <div className="label-xs mb-2">Choose an effect</div>
            {elements === null ? (
              <div className="flex items-center gap-2 text-navy-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading effects…
              </div>
            ) : elements.length === 0 ? (
              <div className="text-navy-500 text-sm">No effects available right now.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {elements.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setPicked(e)}
                    className={`relative aspect-square rounded-xl overflow-hidden ring-2 transition flex items-center justify-center bg-gradient-to-br from-brand-100 via-cream-100 to-coral-100 p-3 ${
                      picked?.id === e.id ? "ring-coral-500" : "ring-transparent hover:ring-cream-300"
                    }`}
                    title={e.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.assetUrl} alt={e.name} className="max-w-full max-h-full" />
                    {picked?.id === e.id && (
                      <span className="absolute top-1 right-1 bg-coral-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-navy-900/70 text-white text-[9px] uppercase tracking-wider font-semibold py-1 truncate">
                      {e.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-3 bg-coral-50 border border-coral-200 text-coral-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <footer className="px-6 py-4 border-t border-cream-300 bg-cream-100 flex items-center justify-between gap-3">
          <div className="text-navy-500 text-xs">
            Magic shots create a new copy — your original photo is never modified.
          </div>
          <button
            onClick={save}
            disabled={!picked || saving}
            className="bg-coral-500 hover:bg-coral-600 disabled:bg-cream-300 disabled:text-navy-400 text-white font-semibold px-6 py-2.5 rounded-full transition inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {saving ? "Saving…" : "Save magic shot"}
          </button>
        </footer>
      </div>
    </div>
  );
}
