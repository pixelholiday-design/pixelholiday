"use client";
import { useEffect, useState } from "react";
import { Camera, Star, Upload, Loader2, Check, ArrowLeft } from "lucide-react";
import QRScanner from "@/components/mobile/QRScanner";

type Loc = { id: string; name: string };
type Photog = { id: string; name: string; locationId: string | null };
type Item = { id: string; preview: string; isHook: boolean; uploaded?: boolean; key?: string };

export default function MobileUploadPage() {
  const [stage, setStage] = useState<"setup" | "scan" | "shoot" | "done">("setup");
  const [locations, setLocations] = useState<Loc[]>([]);
  const [photographers, setPhotographers] = useState<Photog[]>([]);
  const [locationId, setLocationId] = useState("");
  const [photographerId, setPhotographerId] = useState("");
  const [wristbandCode, setWristbandCode] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  // Load lists
  useEffect(() => {
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const staff = d.staff || [];
        const locs = Array.from(new Map(staff.filter((s: any) => s.location).map((s: any) => [s.location.id, s.location])).values()) as Loc[];
        setLocations(locs);
        const ph = staff.filter((s: any) => s.role === "PHOTOGRAPHER");
        setPhotographers(ph);
        if (ph[0]) {
          setPhotographerId(ph[0].id);
          if (ph[0].locationId) setLocationId(ph[0].locationId);
        }
      })
      .catch(() => {});
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: Item[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      preview: URL.createObjectURL(f),
      isHook: false,
    }));
    setItems((prev) => [...prev, ...next]);
  }

  function toggleHook(id: string) {
    setItems((prev) => prev.map((it) => ({ ...it, isHook: it.id === id ? !it.isHook : false })));
  }

  async function submit() {
    setBusy(true);
    const photos = items.map((it) => ({
      s3Key: `mobile/${wristbandCode || "anon"}/${it.id}.jpg`,
      isHookImage: it.isHook,
    }));
    const r = await fetch("/api/mobile-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wristbandCode, locationId, photographerId, photos }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setLink(`${window.location.origin}/gallery/${r.magicLinkToken}`);
      setStage("done");
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 px-5 py-8 max-w-md mx-auto font-sans">
      <header className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-coral-500/15 ring-1 ring-coral-500/30 flex items-center justify-center">
          <Camera className="h-5 w-5 text-coral-600" />
        </div>
        <div>
          <div className="font-display text-xl text-navy-900 leading-tight">PixelHoliday</div>
          <div className="text-[11px] uppercase tracking-widest text-navy-400">Photographer mobile</div>
        </div>
      </header>

      {stage === "setup" && (
        <div className="space-y-5 animate-fade-in">
          <h1 className="heading text-2xl">Start a session</h1>

          <label className="block">
            <div className="label-xs mb-1.5">Location</div>
            <select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="label-xs mb-1.5">Photographer</div>
            <select className="input" value={photographerId} onChange={(e) => setPhotographerId(e.target.value)}>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <button
            disabled={!locationId || !photographerId}
            onClick={() => setStage("scan")}
            className="btn-primary w-full !py-4 text-base"
          >
            Continue
          </button>
        </div>
      )}

      {stage === "scan" && (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStage("setup")} className="btn-ghost -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="heading text-2xl">Scan customer wristband</h1>
          <p className="text-sm text-navy-400">Their photos will be added to today's gallery automatically.</p>
          <QRScanner
            onResult={(c) => {
              setWristbandCode(c);
              setStage("shoot");
            }}
          />
        </div>
      )}

      {stage === "shoot" && (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStage("scan")} className="btn-ghost -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="heading text-2xl">Add photos</h1>
            <p className="text-xs text-navy-400 font-mono mt-1">Wristband: {wristbandCode}</p>
          </div>

          <label className="block">
            <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
            <span className="btn-secondary w-full !py-4 cursor-pointer">
              <Camera className="h-5 w-5" /> Take or pick photos
            </span>
          </label>

          {items.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {items.map((it) => (
                <div key={it.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleHook(it.id)}
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center"
                  >
                    <Star className={`h-3.5 w-3.5 ${it.isHook ? "fill-gold-500 text-gold-500" : "text-navy-400"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={submit} disabled={!items.length || busy} className="btn-primary w-full !py-4 text-base">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {busy ? "Uploading…" : `Upload ${items.length} photo${items.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {stage === "done" && link && (
        <div className="text-center animate-fade-in space-y-5 mt-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lift mx-auto">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h1 className="heading text-3xl">Uploaded!</h1>
          <p className="text-sm text-navy-500">Customer can view their gallery here:</p>
          <a className="block text-coral-600 underline break-all text-xs" href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
          <button
            onClick={() => {
              setItems([]);
              setWristbandCode("");
              setLink(null);
              setStage("scan");
            }}
            className="btn-primary w-full !py-4 text-base"
          >
            Next customer
          </button>
        </div>
      )}
    </div>
  );
}
