"use client";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Star, Upload, Loader2, Check, ImageIcon, Film, Sparkles,
  Link as LinkIcon, Copy, X, ChevronDown, ChevronUp,
} from "lucide-react";

type LocOpt = { id: string; name: string; type: string };
type PhotogOpt = { id: string; name: string };
type FileItem = { file: File; preview: string; isHook: boolean };

type QueueJob = {
  id: string;
  locationName: string;
  photographerName: string;
  customerName: string;
  totalFiles: number;
  uploadedFiles: number;
  status: "uploading" | "processing" | "done" | "error";
  galleryLink?: string;
  error?: string;
  startedAt: number;
};

const PARALLEL_UPLOADS = 4; // Upload 4 files at once for speed

export default function UploadHub({ locations, photographers }: { locations: LocOpt[]; photographers: PhotogOpt[] }) {
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [photographerId, setPhotographerId] = useState(photographers[0]?.id || "");
  const [roomNumber, setRoomNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [status, setStatus] = useState<"HOOK_ONLY" | "PREVIEW_ECOM" | "DIGITAL_PASS">("HOOK_ONLY");
  const [items, setItems] = useState<FileItem[]>([]);
  const [queue, setQueue] = useState<QueueJob[]>([]);
  const [queueOpen, setQueueOpen] = useState(true);
  const queueRef = useRef<QueueJob[]>([]);

  const locationType = locations.find((l) => l.id === locationId)?.type || "";
  const isHighVolume = locationType === "WATER_PARK" || locationType === "ATTRACTION";

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

  function updateJob(id: string, patch: Partial<QueueJob>) {
    setQueue((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...patch } : j));
      queueRef.current = next;
      return next;
    });
  }

  async function uploadFileWithRetry(file: File): Promise<{ key: string; publicUrl: string }> {
    const r = await fetch("/api/upload/presigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
    }).then((r) => r.json());

    if (!r.mocked) {
      let directOk = false;
      try {
        const res = await fetch(r.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        directOk = res.ok;
      } catch { /* CORS fallback */ }
      if (!directOk) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("key", r.key);
        fd.append("contentType", file.type || "application/octet-stream");
        await fetch("/api/upload/proxy", { method: "POST", body: fd });
      }
    }
    return { key: r.key, publicUrl: r.publicUrl };
  }

  async function processJob(job: QueueJob, files: FileItem[], formData: any) {
    try {
      // Upload files in parallel batches
      const uploaded: { key: string; publicUrl: string; isHookImage: boolean }[] = [];
      for (let i = 0; i < files.length; i += PARALLEL_UPLOADS) {
        const batch = files.slice(i, i + PARALLEL_UPLOADS);
        const results = await Promise.all(
          batch.map(async (it) => {
            const r = await uploadFileWithRetry(it.file);
            return { ...r, isHookImage: it.isHook };
          })
        );
        uploaded.push(...results);
        updateJob(job.id, { uploadedFiles: uploaded.length });
      }

      updateJob(job.id, { status: "processing" });

      const res = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: uploaded,
        }),
      }).then((r) => r.json());

      if (res.magicLinkToken) {
        updateJob(job.id, {
          status: "done",
          galleryLink: `${window.location.origin}/gallery/${res.magicLinkToken}`,
        });
      } else {
        updateJob(job.id, { status: "done", galleryLink: "" });
      }
    } catch (e: any) {
      updateJob(job.id, { status: "error", error: e.message || "Upload failed" });
    }
  }

  function handleUpload() {
    if (!items.length || !locationId || !photographerId) return;

    const loc = locations.find((l) => l.id === locationId);
    const photog = photographers.find((p) => p.id === photographerId);

    const job: QueueJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      locationName: loc?.name || "",
      photographerName: photog?.name || "",
      customerName: customerName || roomNumber || "Guest",
      totalFiles: items.length,
      uploadedFiles: 0,
      status: "uploading",
      startedAt: Date.now(),
    };

    const formData = {
      locationId,
      photographerId,
      customerName,
      customerEmail,
      customerWhatsapp,
      roomNumber,
      status,
    };

    const filesToUpload = [...items];

    // Add to queue and start upload in background
    setQueue((prev) => {
      const next = [job, ...prev];
      queueRef.current = next;
      return next;
    });
    setQueueOpen(true);

    // Reset form immediately for next photographer
    setItems([]);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerWhatsapp("");
    setRoomNumber("");

    // Start background upload (non-blocking)
    processJob(job, filesToUpload, formData);
  }

  const activeJobs = queue.filter((j) => j.status === "uploading" || j.status === "processing");
  const doneJobs = queue.filter((j) => j.status === "done" || j.status === "error");

  const TACTICS = [
    { id: "HOOK_ONLY", label: "Hook only", sub: "O2O tease → drive to kiosk" },
    { id: "PREVIEW_ECOM", label: "Preview + E-com", sub: "Watermarked + Stripe checkout" },
    { id: "DIGITAL_PASS", label: "Digital Pass", sub: "Pre-paid, auto-deliver" },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Gallery creation</div>
        <h1 className="heading text-4xl mt-1">Upload Hub</h1>
        <p className="text-navy-400 mt-1">
          {isHighVolume
            ? "High-volume mode — uploads run in background. Fill the next gallery while photos upload."
            : "Create a gallery, tag the hook image, and deliver in one step."}
        </p>
      </header>

      {/* Upload queue — always visible when jobs exist */}
      {queue.length > 0 && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className="w-full flex items-center justify-between px-5 py-3 bg-cream-50 border-b border-cream-200 hover:bg-cream-100 transition"
          >
            <div className="flex items-center gap-3">
              {activeJobs.length > 0 && <Loader2 className="h-4 w-4 animate-spin text-coral-500" />}
              <span className="font-semibold text-sm text-navy-900">
                Upload queue
                {activeJobs.length > 0 && ` — ${activeJobs.length} active`}
              </span>
              <span className="text-xs text-navy-400">{queue.length} total</span>
            </div>
            {queueOpen ? <ChevronUp className="h-4 w-4 text-navy-400" /> : <ChevronDown className="h-4 w-4 text-navy-400" />}
          </button>
          {queueOpen && (
            <div className="divide-y divide-cream-200 max-h-64 overflow-y-auto">
              {queue.map((job) => (
                <div key={job.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy-900 truncate">
                        {job.customerName}
                      </span>
                      <span className="text-xs text-navy-400">
                        {job.locationName} · {job.photographerName}
                      </span>
                    </div>
                    {(job.status === "uploading" || job.status === "processing") && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-coral-400 to-coral-600 rounded-full transition-all duration-300"
                            style={{ width: `${job.status === "processing" ? 100 : Math.round((job.uploadedFiles / job.totalFiles) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-navy-400 whitespace-nowrap">
                          {job.status === "processing"
                            ? "Creating gallery…"
                            : `${job.uploadedFiles}/${job.totalFiles}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {job.status === "uploading" && (
                      <span className="text-xs text-coral-500 font-medium">Uploading</span>
                    )}
                    {job.status === "processing" && (
                      <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                    )}
                    {job.status === "done" && job.galleryLink && (
                      <a
                        href={job.galleryLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:underline"
                      >
                        <Check className="h-3.5 w-3.5" /> View gallery
                      </a>
                    )}
                    {job.status === "done" && !job.galleryLink && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Done
                      </span>
                    )}
                    {job.status === "error" && (
                      <span className="text-xs text-red-500 font-medium">Error</span>
                    )}
                  </div>
                  <button
                    onClick={() => setQueue((prev) => prev.filter((j) => j.id !== job.id))}
                    className="btn-ghost !p-1 opacity-40 hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

          <button disabled={!items.length} onClick={handleUpload} className="btn-primary w-full !py-3">
            <Upload className="h-4 w-4" />
            {isHighVolume
              ? `Queue upload (${items.length}) →`
              : `Create gallery (${items.length})`}
          </button>

          {isHighVolume && (
            <p className="text-xs text-navy-400 text-center">
              Photos upload in background. Form resets for next photographer.
            </p>
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setItems([])}
                    className="text-xs text-navy-400 hover:text-red-500 transition"
                  >
                    Clear all
                  </button>
                  <div className="text-xs text-navy-400">Exactly one hook per gallery</div>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
                    <button
                      onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-2 left-2 h-6 w-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
