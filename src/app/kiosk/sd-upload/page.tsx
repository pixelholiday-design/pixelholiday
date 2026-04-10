"use client";
import { useEffect, useState } from "react";
import { Upload, HardDrive, Star, Loader2, Check, LogOut, AlertCircle } from "lucide-react";
import PinPad from "@/components/kiosk/PinPad";

type Loc = { id: string; name: string };
type Item = { id: string; file: File; preview: string; isHook: boolean };

export default function SdUploadKiosk() {
  const [staff, setStaff] = useState<{ id: string; name: string; role: string } | null>(null);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [locationId, setLocationId] = useState("");
  const [wristband, setWristband] = useState("");
  const [room, setRoom] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ link: string } | null>(null);

  useEffect(() => {
    if (!staff) return;
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((d) => {
        const locs = Array.from(new Map((d.staff || []).filter((s: any) => s.location).map((s: any) => [s.location.id, s.location])).values()) as Loc[];
        setLocations(locs);
        if (locs[0]) setLocationId(locs[0].id);
      })
      .catch(() => {});
  }, [staff]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: Item[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      preview: URL.createObjectURL(f),
      isHook: false,
    }));
    setItems((prev) => [...prev, ...next]);
    setError(null);
    setDone(null);
  }

  function toggleHook(id: string) {
    setItems((prev) => prev.map((it) => ({ ...it, isHook: it.id === id ? !it.isHook : false })));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function upload() {
    if (!staff || !items.length) return;
    if (!wristband && !room) {
      setError("Please enter a wristband code OR room number to identify the customer.");
      return;
    }

    setBusy(true);
    setError(null);
    setProgress("Preparing upload...");

    try {
      // Step 1: Upload each file to R2 via presigned URLs
      const uploadedPhotos: { s3Key: string; isHookImage: boolean }[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Uploading photo ${i + 1} of ${items.length}...`);

        // Get presigned URL
        let presignRes;
        try {
          presignRes = await fetch("/api/upload/presigned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.file.name,
              contentType: item.file.type || "image/jpeg",
            }),
          }).then((r) => r.json());
        } catch {
          // If presigned URL fails (no R2 configured), use direct key
          presignRes = null;
        }

        if (presignRes?.uploadUrl && !presignRes.mocked) {
          // Upload actual file to R2
          try {
            await fetch(presignRes.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": item.file.type || "image/jpeg" },
              body: item.file,
            });
            uploadedPhotos.push({ s3Key: presignRes.key, isHookImage: item.isHook });
          } catch (uploadErr) {
            console.warn(`Failed to upload ${item.file.name} to R2, using fallback key`);
            uploadedPhotos.push({ s3Key: presignRes.key || `sd/${item.file.name}`, isHookImage: item.isHook });
          }
        } else {
          // No R2 configured or mocked — use a generated key
          // The photo will be accessible via the photo proxy or placeholder
          const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          uploadedPhotos.push({ s3Key: key, isHookImage: item.isHook });
        }
      }

      // Step 2: Create gallery + photo records via mobile-upload API
      setProgress("Creating gallery...");

      // Build customer identifier: prefer wristband, fall back to room number
      const payload: Record<string, unknown> = {
        locationId,
        photographerId: staff.id,
        photos: uploadedPhotos,
      };

      if (wristband.trim()) {
        payload.wristbandCode = wristband.trim();
      } else if (room.trim()) {
        // API expects wristbandCode or customerId — use room as wristband code
        // or find/create customer by room number first
        payload.wristbandCode = `ROOM-${room.trim()}`;
      }

      const res = await fetch("/api/mobile-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const r = await res.json();

      if (r.ok) {
        setDone({ link: `${window.location.origin}/gallery/${r.magicLinkToken}` });
        setItems([]);
        setWristband("");
        setRoom("");
        setProgress("");
      } else {
        setError(r.error || "Upload failed. Please try again.");
        setProgress("");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Check your connection.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  }

  if (!staff) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center p-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3">SD upload</div>
        <PinPad onVerified={(u) => setStaff(u)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-900 text-white overflow-y-auto">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-coral-500/15 text-coral-300 flex items-center justify-center">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-xl">SD card upload</div>
            <div className="text-xs text-white/50">{staff.name}</div>
          </div>
        </div>
        <button onClick={() => setStaff(null)} className="btn-ghost text-white/70">
          <LogOut className="h-4 w-4" /> Lock
        </button>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <div className="label-xs mb-1.5 text-white/60">Location</div>
            <select className="input !text-navy-900" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="label-xs mb-1.5 text-white/60">Wristband (or QR scan)</div>
            <input className="input !text-navy-900" value={wristband} onChange={(e) => { setWristband(e.target.value); setError(null); }} placeholder="WRIST-AQUA-001" />
          </label>
          <label className="block">
            <div className="label-xs mb-1.5 text-white/60">Or room number</div>
            <input className="input !text-navy-900" value={room} onChange={(e) => { setRoom(e.target.value); setError(null); }} placeholder="412" />
          </label>
        </div>

        <label className="block">
          {/* multiple + accept any image, simulating an SD card folder */}
          <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          <span className="cursor-pointer block rounded-2xl border-2 border-dashed border-white/15 hover:border-coral-400 hover:bg-coral-500/5 transition p-12 text-center">
            <Upload className="h-10 w-10 mx-auto text-coral-400 mb-3" />
            <div className="font-display text-2xl">Insert SD card &amp; pick photos</div>
            <div className="text-white/50 text-sm mt-1">Browse the SD reader as a folder, multi-select files</div>
          </span>
        </label>

        {items.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {items.map((it) => (
              <div key={it.id} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleHook(it.id)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center"
                  title="Set as hook image"
                >
                  <Star className={`h-3.5 w-3.5 ${it.isHook ? "fill-gold-500 text-gold-500" : "text-navy-400"}`} />
                </button>
                <button
                  onClick={() => removeItem(it.id)}
                  className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-5 py-3 flex items-center gap-3 text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button disabled={!items.length || busy} onClick={upload} className="btn-primary w-full !py-4 text-base">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? progress || "Uploading…" : `Upload ${items.length} photo${items.length !== 1 ? "s" : ""}`}
        </button>

        {done && (
          <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6 text-center">
            <Check className="h-10 w-10 text-green-400 mx-auto mb-2" />
            <div className="font-display text-xl mb-1">Gallery created!</div>
            <div className="text-white/60 text-sm mb-3">Customer can view their photos at:</div>
            <a href={done.link} target="_blank" rel="noreferrer" className="text-coral-300 underline break-all text-sm">
              {done.link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
