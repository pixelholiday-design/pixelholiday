"use client";
import { useEffect, useState, useRef } from "react";
import { FileSignature, Check, Loader2, PenTool } from "lucide-react";
import { useParams } from "next/navigation";

type ContractData = { id: string; title: string; content: string; photographerName: string; clientName: string; status: string; clientSignedAt: string | null };

export default function ContractSignPage() {
  const { id } = useParams();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signMode, setSignMode] = useState<"type" | "draw">("type");
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${id}/sign`).then((r) => r.json()).then((d) => { setContract(d.contract || null); if (d.contract?.clientSignedAt) setSigned(true); }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0C2E3D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    let isDrawing = false;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = "touches" in e ? e.touches[0] : e;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };
    const start = (e: MouseEvent | TouchEvent) => { isDrawing = true; const { x, y } = getPos(e); ctx.beginPath(); ctx.moveTo(x, y); };
    const move = (e: MouseEvent | TouchEvent) => { if (!isDrawing) return; e.preventDefault(); const { x, y } = getPos(e); ctx.lineTo(x, y); ctx.stroke(); };
    const end = () => { isDrawing = false; setDrawing(true); };

    canvas.addEventListener("mousedown", start); canvas.addEventListener("mousemove", move); canvas.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false }); canvas.addEventListener("touchmove", move, { passive: false }); canvas.addEventListener("touchend", end);
    return () => {
      canvas.removeEventListener("mousedown", start); canvas.removeEventListener("mousemove", move); canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start); canvas.removeEventListener("touchmove", move); canvas.removeEventListener("touchend", end);
    };
  }, [signMode]);

  async function handleSign() {
    if (!agreed) return;
    const signature = signMode === "type" ? typedName : canvasRef.current?.toDataURL() || "";
    if (!signature) return;
    setSigning(true);
    await fetch(`/api/contracts/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature, signatureType: signMode }),
    });
    setSigned(true);
    setSigning(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-400" /></div>;
  if (!contract) return <div className="min-h-screen flex items-center justify-center text-navy-500">Contract not found.</div>;

  if (signed) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"><Check className="h-8 w-8 text-green-600" strokeWidth={3} /></div>
          <h1 className="font-display text-3xl text-navy-900 mb-2">Contract Signed!</h1>
          <p className="text-navy-500">You've signed "{contract.title}". Both parties will receive a copy via email.</p>
          <p className="text-xs text-navy-400 mt-4">Signed on {new Date().toLocaleDateString()} &middot; Powered by Fotiqo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-brand-500" />
            <span className="font-display text-lg text-navy-900">Contract from {contract.photographerName}</span>
          </div>
          <span className="text-xs text-navy-400">Powered by Fotiqo</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl text-navy-900 mb-6">{contract.title}</h1>

        {/* Contract content */}
        <div className="card p-8 mb-8 prose prose-navy max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: contract.content }} />

        {/* Signature section */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-lg text-navy-900">Sign this contract</h2>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-navy-300 text-brand-500 focus:ring-brand-400" />
            <span className="text-sm text-navy-700">I, <strong>{contract.clientName}</strong>, have read and agree to the terms above.</span>
          </label>

          {/* Signature mode toggle */}
          <div className="flex gap-1 bg-cream-200 rounded-xl p-1">
            <button onClick={() => setSignMode("type")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${signMode === "type" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"}`}>Type name</button>
            <button onClick={() => setSignMode("draw")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1 ${signMode === "draw" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"}`}><PenTool className="h-3.5 w-3.5" /> Draw</button>
          </div>

          {signMode === "type" ? (
            <div>
              <input className="input text-center text-2xl" style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }} value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Type your full name" />
              {typedName && <p className="text-center mt-2 text-2xl text-navy-900" style={{ fontFamily: "'Georgia', serif", fontStyle: "italic" }}>{typedName}</p>}
            </div>
          ) : (
            <div className="border-2 border-dashed border-cream-300 rounded-xl overflow-hidden bg-white">
              <canvas ref={canvasRef} width={500} height={150} className="w-full cursor-crosshair" />
              <p className="text-xs text-navy-400 text-center py-1">Draw your signature above</p>
            </div>
          )}

          <button onClick={handleSign} disabled={signing || !agreed || (signMode === "type" ? !typedName : !drawing)} className="btn-primary w-full !py-3.5 text-base">
            {signing ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing...</> : <><FileSignature className="h-4 w-4" /> Sign Contract</>}
          </button>

          <p className="text-xs text-navy-400 text-center">By signing, you agree to the terms above. Your signature, IP address, and timestamp will be recorded for legal verification.</p>
        </div>
      </main>
    </div>
  );
}
