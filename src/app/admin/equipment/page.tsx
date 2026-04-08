"use client";
import { useEffect, useState } from "react";
import { Package, Loader2, Plus, UserPlus, RotateCcw } from "lucide-react";
import Modal, { Field, inputCls } from "@/components/admin/Modal";

const TYPES = ["CAMERA", "LENS", "FLASH", "TRIPOD", "MEMORY_CARD", "BATTERY", "CHARGER", "TABLET", "PRINTER", "KIOSK_SCREEN", "OTHER"];
const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[] | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [eq, loc, st] = await Promise.all([
      fetch("/api/admin/equipment").then((r) => r.json()).catch(() => ({ equipment: [] })),
      fetch("/api/admin/locations").then((r) => r.json()).catch(() => ({ locations: [] })),
      fetch("/api/admin/staff").then((r) => r.json()).catch(() => ({ staff: [] })),
    ]);
    setEquipment(eq.equipment || []);
    setLocations(loc.locations || []);
    setStaff(st.staff || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/admin/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setAddOpen(false);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to add equipment");
    }
  }

  async function handleAssign(userId: string) {
    if (!assignFor) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", equipmentId: assignFor.id, userId }),
    });
    setSubmitting(false);
    if (res.ok) {
      setAssignFor(null);
      load();
    } else alert("Failed to assign");
  }

  async function handleReturn(equipmentId: string, assignmentId: string) {
    if (!confirm("Mark this equipment as returned?")) return;
    const res = await fetch("/api/admin/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return", equipmentId, assignmentId }),
    });
    if (res.ok) load();
  }

  const total = (equipment || []).reduce((s, e) => s + (e.purchaseCost || 0), 0);
  const assigned = (equipment || []).filter((e) => e.status === "ASSIGNED").length;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Operations</div>
          <h1 className="heading text-4xl mt-1">Equipment</h1>
          <p className="text-navy-400 mt-1">Cameras, lenses, kiosks — track ownership and total fleet cost.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white font-medium text-sm hover:bg-brand-800 min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Equipment
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Total fleet cost" value={`€${total.toLocaleString()}`} />
        <Stat label="Items" value={`${equipment?.length ?? 0}`} />
        <Stat label="Assigned" value={`${assigned}`} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Inventory</h2>
        </div>
        {equipment === null ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : equipment.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600 mb-3">
              <Package className="h-5 w-5" />
            </div>
            <div className="font-display text-xl text-navy-900">No equipment</div>
            <div className="text-sm text-navy-400 mt-1">Add your first camera or lens to start tracking.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Serial</th>
                  <th className="px-6 py-3">Cost</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned to</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {equipment.map((e) => {
                  const active = e.assignments?.[0];
                  return (
                    <tr key={e.id} className="hover:bg-cream-100/60">
                      <td className="px-6 py-3 font-medium text-navy-900">{e.name}</td>
                      <td className="px-6 py-3 text-navy-600">{e.type}</td>
                      <td className="px-6 py-3 text-navy-500 text-xs">{e.serialNumber || "—"}</td>
                      <td className="px-6 py-3 text-navy-600">€{e.purchaseCost || 0}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full text-xs font-medium px-2.5 py-1 ${
                          e.status === "ASSIGNED" ? "bg-coral-50 text-coral-700" :
                          e.status === "AVAILABLE" ? "bg-green-50 text-green-700" :
                          "bg-cream-200 text-navy-600"
                        }`}>{e.status}</span>
                      </td>
                      <td className="px-6 py-3 text-navy-600">{active?.user?.name || "—"}</td>
                      <td className="px-6 py-3 text-navy-600">{e.location?.name}</td>
                      <td className="px-6 py-3 text-right">
                        {active ? (
                          <button
                            onClick={() => handleReturn(e.id, active.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-900"
                          >
                            <RotateCcw className="h-3 w-3" /> Return
                          </button>
                        ) : (
                          <button
                            onClick={() => setAssignFor(e)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                          >
                            <UserPlus className="h-3 w-3" /> Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Equipment">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type" required>
              <select name="type" required className={inputCls}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <input name="brand" placeholder="Nikon" className={inputCls} />
            </Field>
            <Field label="Model" required>
              <input name="model" required placeholder="D7200" className={inputCls} />
            </Field>
            <Field label="Serial number">
              <input name="serialNumber" className={inputCls} />
            </Field>
            <Field label="Purchase price (€)">
              <input name="purchaseCost" type="number" step="0.01" className={inputCls} />
            </Field>
            <Field label="Location" required>
              <select name="locationId" required className={inputCls}>
                <option value="">Select location…</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea name="notes" rows={2} className={inputCls} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm text-navy-600 hover:bg-cream-100 min-h-[44px]">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[44px]">
              {submitting ? "Saving…" : "Add Equipment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal open={!!assignFor} onClose={() => setAssignFor(null)} title={`Assign: ${assignFor?.name}`}>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {staff.length === 0 && <div className="text-sm text-navy-400">No staff available.</div>}
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAssign(s.id)}
              disabled={submitting}
              className="w-full text-left p-3 rounded-lg border border-cream-300 hover:border-brand-500 hover:bg-brand-50 transition min-h-[44px] disabled:opacity-50"
            >
              <div className="font-medium text-navy-900">{s.name}</div>
              <div className="text-xs text-navy-400">{s.role} {s.location?.name ? `· ${s.location.name}` : ""}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
    </div>
  );
}
