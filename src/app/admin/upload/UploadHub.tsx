"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Star, Upload, Loader2, Check, ImageIcon, Film, Sparkles, Link as LinkIcon, Copy } from "lucide-react";
import UploadCoach from "@/components/ai/UploadCoach";

type LocOpt = { id: string; name: string; type: string };
type PhotogOpt = { id: string; name: string };
type Item = { file: File; preview: string; isHook: boolean; uploaded?: boolean; key?: string; publicUrl?: string; progress?: number };

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
  const [done, setDone] = useState<{ link: string; photoIds: string[] } | null>(null);

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
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const r = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: it.file.name, contentType: it.file.type || "application/octet-stream" }),
      }).then((r) => r.json());

      if (!r.mocked) {
        try {
          await fetch(r.uploadUrl, { method: "PUT", body: it.file, headers: { "Content-Type": it.file.type } });
        } catch (e) {
          console.warn("R2 upload failed (continuing in dev)", e);
        }
      }
      uploaded.push({ ...it, uploaded: true, key: r.key, publicUrl: r.publicUrl, progress: 100 });
      setItems([...uploaded, ...items.slice(idx + 1)]);
    }

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
      setDone({ link: `${window.location.origin}/gallery/${res.magicLinkToken}`, photoIds: res.photoIds || [] });
    }
  }

  const TACTICS = [
    { id: "HOOK_ONLY", label: "Hook only", sub: "O2O tease → drive to kiosk" },
    { id: "PREVIEW_ECOM", label: "Preview + E-com", sub: "Watermarked + Stripe checkout" },
    { id: "DIGITAL_PASS", label: "Digital Pass", sub: "Pre-paid, auto-deliver" },
  ] as const;

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Gallery creation</div>
        <h1 className="heading text-4xl mt-1">Upload Hub</h1>
        <p className="text-navy-400 mt-1">Create a gallery, tag the hook image, and deliver in one step.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT — Form */}
        <aside className="xl:col-span-1 card p-6 space-y-5 h-fit">
          <h2 className="heading text-lg">Gallery details</h2>

          <Field label="Location">
            <select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Photographer">
            <select className="input" value={photographerId} onChange={(e) => setPhotographerId(e.target.value)}>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Room #">
              <input className="input" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="214" />
            </Field>
            <Field label="Customer">
              <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name" />
            </Field>
          </div>

          <Field label="WhatsApp">
            <input className="input" value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value)} placeholder="+216…" />
          </Field>

          <Field label="Email">
            <input className="input" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="guest@example.com" />
          </Field>

          <div>
            <div className="label-xs mb-2">Delivery tactic</div>
            <div className="space-y-2">
              {TACTICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStatus(t.id as any)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                    status === t.id
                      ? "border-coral-500 bg-coral-50 ring-1 ring-coral-200"
                      : "border-cream-300 hover:border-navy-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-navy-900 text-sm">{t.label}</div>
                    {status === t.id && <Check className="h-4 w-4 text-coral-500" />}
                  </div>
                  <div className="text-xs text-navy-400 mt-0.5">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button disabled={busy || !items.length} onClick={handleUpload} className="btn-primary w-full !py-3">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Create gallery ({items.length})
              </>
            )}
          </button>

          {done && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <Sparkles className="h-4 w-4" /> Gallery ready
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-3 w-3 text-green-700 shrink-0" />
                <a className="text-xs text-green-800 underline break-all" href={done.link} target="_blank" rel="noreferrer">
                  {done.link}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(done.link)}
                  className="ml-auto btn-ghost !p-1.5"
                  title="Copy link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {done.photoIds.length > 0 && (
                <div className="mt-3">
                  <UploadCoach photoIds={done.photoIds} />
                </div>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT — Dropzone + thumbs */}
        <section className="xl:col-span-2 card p-6">
          <div
            {...getRootProps()}
            className={`rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition ${
              isDragActive ? "border-coral-500 bg-coral-50" : "border-cream-300 bg-cream-100/50 hover:border-navy-200"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto h-14 w-14 rounded-2xl bg-coral-500/10 text-coral-500 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <div className="heading text-xl">{isDragActive ? "Drop to upload" : "Drag & drop photos here"}</div>
            <p className="text-navy-400 text-sm mt-1">or click to browse</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-400">
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> JPG · PNG · RAW
              </span>
              <span className="h-3 w-px bg-navy-200" />
              <span className="inline-flex items-center gap-1">
                <Film className="h-3 w-3" /> MP4 · MOV
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-navy-600">
                  <span className="font-semibold text-navy-900">{items.length}</span> files · Tap the star to mark the hook image
                </div>
                <div className="text-xs text-navy-400">Exactly one hook per gallery</div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden bg-cream-200 aspect-square ring-1 ring-cream-300/50 hover:ring-coral-300 hover:shadow-lift transition"
                  >
                    {it.file.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-navy-400 text-xs px-2 text-center">
                        <Film className="h-5 w-5" />
                      </div>
                    )}
                    <button
                      onClick={() => toggleHook(i)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center hover:bg-white"
                    >
                      <Star className={`h-4 w-4 ${it.isHook ? "fill-gold-500 text-gold-500" : "text-navy-400"}`} />
                    </button>
                    {it.uploaded && (
                      <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-xs block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
