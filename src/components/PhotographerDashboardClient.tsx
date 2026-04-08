"use client";
import { useEffect, useState } from "react";
import { Trophy, Flame, Star, Zap, Loader2, TrendingUp, Target, Clock, Wallet } from "lucide-react";
import SkillRadar from "@/components/ai/SkillRadar";

type Stats = {
  user: { id: string; name: string; xp: number; level: number; streakDays: number; userBadges: any[] };
  current: { level: number; title: string; perk: string; xp: number };
  next: { level: number; title: string; xp: number } | null;
  todayXp: number;
  progressToNext: number;
};
type LeaderRow = { rank: number; userId: string; name: string; level: number; periodXp: number };

export default function PhotographerDashboardClient() {
  const [data, setData] = useState<{ stats: Stats; leaderboard: LeaderRow[]; myRank: number | null } | null>(null);
  const [today, setToday] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/me/xp")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
    fetch("/api/me/today")
      .then((r) => r.json())
      .then(setToday)
      .catch(() => {});
  }, []);

  if (!data?.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    );
  }

  const { stats, leaderboard, myRank } = data;
  return (
    <div className="min-h-screen bg-cream-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <div className="label-xs">My dashboard</div>
          <h1 className="heading text-4xl mt-1">Hello, {stats.user.name}</h1>
          <p className="text-navy-400 mt-1">{stats.current.title} · Level {stats.user.level}</p>
        </header>

        {/* XP progress */}
        <div className="card p-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="label-xs">Level {stats.user.level}</div>
              <div className="font-display text-3xl text-navy-900">{stats.current.title}</div>
              <div className="text-xs text-navy-400 mt-1">{stats.current.perk}</div>
            </div>
            <div className="text-right">
              <div className="label-xs">XP</div>
              <div className="font-display text-3xl text-coral-600">{stats.user.xp.toLocaleString()}</div>
              {stats.next && (
                <div className="text-xs text-navy-400">
                  {stats.next.xp - stats.user.xp} to {stats.next.title}
                </div>
              )}
            </div>
          </div>
          <div className="h-3 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-coral-500 to-gold-500 transition-all duration-700"
              style={{ width: `${stats.progressToNext}%` }}
            />
          </div>
          <div className="text-xs text-navy-400 mt-2 text-center">
            {stats.progressToNext}% to next level
          </div>
        </div>

        {/* My targets today */}
        {today?.targets && (
          <div className="card p-6">
            <h2 className="heading text-lg flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-coral-500" /> My targets today
            </h2>
            <div className="space-y-4">
              <ProgressBar label="Appointments booked" current={today.progress.appointmentsToday} target={today.targets.appointments} />
              <ProgressBar label="Photos taken" current={today.progress.photosToday} target={today.targets.photos} />
              <ProgressBar label="Revenue (€)" current={Math.round(today.progress.revenueToday)} target={today.targets.revenue} />
            </div>
          </div>
        )}

        {/* Next appointment */}
        {today?.nextAppointment && (
          <div className="card p-6 flex items-start gap-4 border-l-4 border-coral-500">
            <div className="h-10 w-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="label-xs">Next appointment</div>
              <div className="font-display text-2xl text-navy-900">{today.nextAppointment.customer}</div>
              <div className="text-sm text-navy-500">
                {new Date(today.nextAppointment.time).toLocaleString()}
                {today.nextAppointment.locationName && ` · ${today.nextAppointment.locationName}`}
                {today.nextAppointment.roomNumber && ` · Room ${today.nextAppointment.roomNumber}`}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Stat
            icon={<Zap className="h-4 w-4" />}
            label="Today's XP"
            value={`+${stats.todayXp}`}
            accent="coral"
          />
          <Stat
            icon={<Flame className="h-4 w-4" />}
            label="Streak"
            value={`${stats.user.streakDays} day${stats.user.streakDays === 1 ? "" : "s"}`}
            accent="gold"
            sub="🔥 keep it going!"
          />
          <Stat
            icon={<Trophy className="h-4 w-4" />}
            label="Leaderboard rank"
            value={myRank ? `#${myRank}` : "—"}
            accent="green"
          />
        </div>

        {/* Badges */}
        <div className="card p-6">
          <h2 className="heading text-lg mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-gold-500" /> Badges ({stats.user.userBadges?.length || 0})
          </h2>
          {(stats.user.userBadges?.length || 0) === 0 ? (
            <div className="text-sm text-navy-400">No badges yet. Close your first sale to unlock <strong>First Blood</strong>!</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {stats.user.userBadges.map((ub: any) => (
                <div key={ub.id} className="text-center">
                  <div className="text-3xl">{ub.badge.icon}</div>
                  <div className="text-[11px] font-medium text-navy-900 mt-1">{ub.badge.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My earnings this month */}
        {today?.earnings && (
          <div className="card p-6">
            <h2 className="heading text-lg flex items-center gap-2 mb-4">
              <Wallet className="h-4 w-4 text-gold-500" /> My earnings this month
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <EarnRow label="Base salary" value={today.earnings.baseSalary} />
              <EarnRow label="Commissions" value={today.earnings.commissions} />
              <EarnRow label="Attendance bonus" value={today.earnings.attendanceBonus} />
              <EarnRow label="Total" value={today.earnings.total} strong />
            </div>
          </div>
        )}

        {/* AI skill radar */}
        <SkillRadar userId={stats.user.id} />

        {/* Leaderboard */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-coral-500" /> This week's leaderboard
            </h2>
          </div>
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">No XP yet this week.</div>
          ) : (
            <ul className="divide-y divide-cream-300/70">
              {leaderboard.map((r) => (
                <li
                  key={r.userId}
                  className={`px-6 py-3 flex items-center gap-4 ${
                    r.userId === stats.user.id ? "bg-coral-50" : ""
                  }`}
                >
                  <div className="font-display text-2xl text-navy-300 w-8">#{r.rank}</div>
                  <div className="flex-1 font-medium text-navy-900">{r.name}</div>
                  <div className="text-xs text-navy-400">Lv. {r.level}</div>
                  <div className="font-semibold text-coral-600">+{r.periodXp} XP</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-navy-700">{label}</span>
        <span className="font-semibold text-navy-900">{current} / {target}</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-green-500" : "bg-gradient-to-r from-coral-500 to-gold-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EarnRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className={`font-display ${strong ? "text-2xl text-coral-600" : "text-xl text-navy-900"}`}>
        €{(value || 0).toFixed(0)}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, accent }: any) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "gold" ? "bg-gold-500/10 text-gold-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}
