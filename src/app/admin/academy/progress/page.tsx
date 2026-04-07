"use client";
import { useEffect, useState } from "react";

function CertificateBadge({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
      🏆 Certified: {name}
    </div>
  );
}

export default function AcademyProgress() {
  const [data, setData] = useState<any>({ entries: [], byUser: {} });
  useEffect(() => {
    fetch("/api/academy/progress").then((r) => r.json()).then(setData);
  }, []);

  const users = Object.values(data.byUser || {}) as any[];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Academy Progress Tracker</h1>
      {users.length === 0 && <p className="text-gray-500">No progress entries yet.</p>}
      <div className="space-y-4">
        {users.map((u) => {
          const total = u.modules.length;
          const pct = total ? Math.round((u.completed / total) * 100) : 0;
          return (
            <div key={u.userId} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold">User: {u.userId}</div>
                <div className="text-sm">{u.completed}/{total} modules • {pct}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs text-gray-600">Avg score: {total ? (u.totalScore / total).toFixed(1) : 0}</div>
              {pct === 100 && <div className="mt-2"><CertificateBadge name="Full Curriculum" /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
