"use client";
import { useEffect, useState } from "react";
import Leaderboard from "@/components/gamification/Leaderboard";

export default function GamificationPage() {
  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/badges").then((r) => r.json()).then((d) => setBadges(d.badges || []));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Gamification Hub</h1>

      <Leaderboard />

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🎖️ Monthly Awards Ceremony</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div key={b.id} className="border-2 border-yellow-400 rounded-xl p-4 text-center">
              <div className="text-4xl">{b.icon}</div>
              <div className="font-bold mt-2">{b.name}</div>
              <div className="text-xs text-gray-600">{b.desc}</div>
              <div className="text-xs mt-2 text-orange-600">{b.cadence}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
