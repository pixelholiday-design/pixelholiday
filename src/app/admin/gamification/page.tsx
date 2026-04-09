"use client";
import { useEffect, useState } from "react";
import { Trophy, Award } from "lucide-react";
import Leaderboard from "@/components/gamification/Leaderboard";

export default function GamificationPage() {
  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/badges").then((r) => r.json()).then((d) => setBadges(d.badges || []));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Module 15.10</div>
        <h1 className="heading text-4xl mt-1">Gamification Hub</h1>
        <p className="text-navy-400 mt-1">Leaderboards, badges, and monthly awards to keep the team motivated.</p>
      </header>

      <Leaderboard />

      <div className="card p-6">
        <h2 className="heading text-xl flex items-center gap-2 mb-5">
          <Trophy className="h-5 w-5 text-gold-500" /> Monthly Awards Ceremony
        </h2>
        {badges.length === 0 ? (
          <div className="text-center py-10 text-navy-400">
            <Award className="h-8 w-8 mx-auto text-navy-300 mb-3" />
            <div>No badges configured yet.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div key={b.id} className="rounded-xl border border-gold-500/30 bg-gradient-to-br from-white to-gold-500/5 p-5 text-center">
                <div className="text-4xl mb-2">{b.icon}</div>
                <div className="font-semibold text-navy-900">{b.name}</div>
                <div className="text-sm text-navy-400 mt-1">{b.desc}</div>
                <div className="text-xs text-gold-600 font-medium mt-2">{b.cadence}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
