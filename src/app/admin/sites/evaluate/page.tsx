"use client";
import { useState } from "react";

export default function EvaluatePage() {
  const [form, setForm] = useState({
    locationName: "",
    trafficScore: 3,
    affluenceScore: 3,
    spaceScore: 3,
    partnerScore: 3,
    competitionScore: 3,
    expectedTraffic: 500,
    expectedAOV: 50,
    proposedRent: 0,
  });
  const [result, setResult] = useState<any>(null);

  const totalScore =
    form.trafficScore +
    form.affluenceScore +
    form.spaceScore +
    form.partnerScore +
    form.competitionScore;
  const monthlyGross = form.expectedTraffic * form.expectedAOV;
  const rentCeiling = monthlyGross * 0.2;
  const passed = totalScore >= 18;
  const rentOk = form.proposedRent <= rentCeiling;

  const submit = async () => {
    const r = await fetch("/api/admin/sites/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setResult(await r.json());
  };

  const Slider = ({ k, label }: { k: keyof typeof form; label: string }) => (
    <div>
      <label className="text-sm font-medium">
        {label}: {form[k]}
      </label>
      <input
        type="range"
        min={1}
        max={5}
        value={form[k] as number}
        onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Site Viability Scorecard</h1>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="Location name"
        value={form.locationName}
        onChange={(e) => setForm({ ...form, locationName: e.target.value })}
      />
      <div className="space-y-3 mb-6">
        <Slider k="trafficScore" label="Traffic" />
        <Slider k="affluenceScore" label="Affluence" />
        <Slider k="spaceScore" label="Space/Setup" />
        <Slider k="partnerScore" label="Partner Quality" />
        <Slider k="competitionScore" label="Low Competition" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <label className="text-sm">
          Traffic/mo
          <input
            type="number"
            value={form.expectedTraffic}
            onChange={(e) => setForm({ ...form, expectedTraffic: Number(e.target.value) })}
            className="w-full border p-2 rounded"
          />
        </label>
        <label className="text-sm">
          AOV
          <input
            type="number"
            value={form.expectedAOV}
            onChange={(e) => setForm({ ...form, expectedAOV: Number(e.target.value) })}
            className="w-full border p-2 rounded"
          />
        </label>
        <label className="text-sm">
          Proposed rent
          <input
            type="number"
            value={form.proposedRent}
            onChange={(e) => setForm({ ...form, proposedRent: Number(e.target.value) })}
            className="w-full border p-2 rounded"
          />
        </label>
      </div>
      <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
        <div>Total score: <b>{totalScore}/25</b> ({passed ? "PASS" : "FAIL"})</div>
        <div>Monthly gross: <b>{monthlyGross.toFixed(0)}</b></div>
        <div>Rent ceiling (20%): <b>{rentCeiling.toFixed(0)}</b></div>
        <div className={rentOk ? "text-green-700" : "text-red-700"}>
          Proposed rent {rentOk ? "OK" : "EXCEEDS CEILING — DO NOT SIGN"}
        </div>
      </div>
      <button
        onClick={submit}
        disabled={!passed || !rentOk}
        className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Submit Evaluation
      </button>
      {result && <pre className="mt-4 text-xs bg-gray-50 p-2">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
