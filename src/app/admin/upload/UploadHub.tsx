"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Star, Upload, Loader2, Check } from "lucide-react";

type LocOpt = { id: string; name: string; type: string };
type PhotogOpt = { id: string; name: string };
type Item = { file: File; preview: string; isHook: boolean; uploaded?: boolean; key?: string; publicUrl?: string };

export default function UploadHub({ locations, photographers }: { locations: LocOpt[]; photographers: PhotogOpt[] }) {
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [photographerId, setPhotographerId] = useState(photographers[0]?.id || "");
  const [roomNumber, setRoomNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [status, setStatus] = useState<"HOOK_ONLY" | "PREVIEW_ECOM" | "DIGITAL_PASS">("PREVIEW_ECOM");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ link: string } | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const next = accepted.map((f) => ({ file: f, preview: URL.createObjectURL(f), isHook: false }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/x-canon-cr2": [".cr2"],
      "image/x-nikon-nef": [".nef"],
      "image/x-sony-arw": [".arw"],
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
    },
  });

  function toggleHook(idx: number) {
    setItems((prev) => prev.map((it, i) => ({ ...it, isHook: i === idx ? !it.isHook : false })));
  }

  async function handleUpload() {
    if (!items.length || !locationId || !photographerId) return;
    setBusy(true);
    const uploaded: Item[] = [];
    for (const it of items) {
      const r = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: it.file.name, contentType: it.file.type || "application/octet-stream" }),
      }).then((r) => r.json());

      // Direct PUT to R2 (skipped if mocked)
      if (!r.mocked) {
        try {
          await fetch(r.uploadUrl, { method: "PUT", body: it.file, headers: { "Content-Type": it.file.type } });
        } catch (e) {
          console.warn("R2 upload failed (continuing in dev)", e);
        }
      }
      uploaded.push({ ...it, uploaded: true, key: r.key, publicUrl: r.publicUrl });
    }
    setItems(uploaded);

    const res = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        photographerId,
        customerName,
        customerEmail,
        customerWhatsapp,
        roomNumber,
        status,
        photos: uploaded.map((u) => ({ key: u.key!, publicUrl: u.publicUrl!, isHookImage: u.isHook })),
      }),
    }).then((r) => r.json());

    setBusy(false);
    if (res.magicLinkToken) {
      setDone({ link: `${window.location.origin}/gallery/${res.magicLinkToken}` });
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">Upload Hub</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Form */}
          <aside className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-stone-900">Gallery details</h2>

            <label className="block text-sm">
              <span className="text-stone-600">Location</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-stone-600">Photographer</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={photographerId} onChange={(e) => setPhotographerId(e.target.value)}>
                {photographers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-stone-600">Room number</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
            </label>

            <label className="block text-sm">
              <span className="text-stone-600">Customer name</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </label>

            <label className="block text-sm">
              <span className="text-stone-600">Customer email</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </label>

            <label className="block text-sm">
              <span className="text-stone-600">WhatsApp</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value)} placeholder="+216..." />
            </label>

            <div className="text-sm">
              <span className="text-stone-600 block mb-2">Tactic</span>
              <div className="grid grid-cols-3 gap-2">
                {(["HOOK_ONLY", "PREVIEW_ECOM", "DIGITAL_PASS"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)} className={`py-2 px-3 rounded-lg text-xs font-medium ${status === s ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {status === "HOOK_ONLY" && "O2O — only hook image visible, drives to kiosk."}
                {status === "PREVIEW_ECOM" && "Online watermarked preview + Stripe checkout."}
                {status === "DIGITAL_PASS" && "Pre-paid pass — auto-deliver clean files."}
              </p>
            </div>

            <button disabled={busy || !items.length} onClick={handleUpload} className="w-full bg-stone-900 text-white rounded-lg py-3 font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {busy ? "Uploading..." : `Create gallery (${items.length} files)`}
            </button>

            {done && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 break-all">
                ✅ Gallery created. <a className="underline" href={done.link} target="_blank" rel="noreferrer">{done.link}</a>
              </div>
            )}
          </aside>

          {/* RIGHT — Dropzone + thumbs */}
          <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${isDragActive ? "border-stone-900 bg-stone-50" : "border-stone-300"}`}>
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2 text-stone-400" />
              <p className="text-stone-600">{isDragActive ? "Drop files here" : "Drag & drop photos / videos, or click to browse"}</p>
              <p className="text-xs text-stone-400 mt-1">JPG · PNG · RAW (CR2/NEF/ARW) · MP4 · MOV</p>
            </div>

            {items.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((it, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden bg-stone-100 aspect-square">
                    {it.file.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-stone-500 text-xs">{it.file.name}</div>
                    )}
                    <button onClick={() => toggleHook(i)} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white">
                      <Star size={16} className={it.isHook ? "fill-amber-400 text-amber-500" : "text-stone-400"} />
                    </button>
                    {it.uploaded && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white rounded-full p-1">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
