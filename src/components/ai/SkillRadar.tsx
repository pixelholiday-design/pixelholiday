"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Profile = {
  individualPoses: number;
  couplePoses: number;
  familyPoses: number;
  kidsPoses: number;
  actionPoses: number;
  portraitPoses: number;
  avgSharpness?: number;
  avgExposure?: number;
  avgComposition?: number;
  avgLighting?: number;
  avgFraming?: number;
  weakestPoseCategory?: string | null;
  weakestTechnical?: string | null;
  strongestArea?: string | null;
};

type Training = {
  id: string;
  reason: string;
  status: string;
  priority: string;
  module?: { title: string } | null;
};

export default function SkillRadar({
  userId,
  profile: initialProfile,
}: {
  userId?: string;
  profile?: Profile;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [assignments, setAssignments] = useState<Training[]>([]);
  const [loading, setLoading] = useState(!initialProfile);

  useEffect(() => {
    if (!userId || initialProfile) return;
    setLoading(true);
    fetch(`/api/ai/skill-profile/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.profile);
        setAssignments(data.trainingAssignments || []);
      })
      .finally(() => setLoading(false));
  }, [userId, initialProfile]);

  if (loading) return <div className="p-4 text-sm opacity-70">Loading skill profile…</div>;
  if (!profile) return <div className="p-4 text-sm opacity-70">No skill profile yet.</div>;

  const data = [
    { axis: "Individual", value: profile.individualPoses },
    { axis: "Couple", value: profile.couplePoses },
    { axis: "Family", value: profile.familyPoses },
    { axis: "Kids", value: profile.kidsPoses },
    { axis: "Action", value: profile.actionPoses },
    { axis: "Portrait", value: profile.portraitPoses },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">Your Photography Skill Profile</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Skill"
              dataKey="value"
              stroke="#ff7f50"
              fill="#ff7f50"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="opacity-60">Strongest area</div>
          <div className="font-medium">{profile.strongestArea || "—"}</div>
        </div>
        <div>
          <div className="opacity-60">Weakest area</div>
          <div className="font-medium text-red-600">{profile.weakestPoseCategory || "—"}</div>
        </div>
      </div>
      {assignments.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">AI-assigned training</div>
          <ul className="space-y-2">
            {assignments.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm"
              >
                <div className="font-medium">{a.module?.title || "Training module"}</div>
                <div className="opacity-70">{a.reason}</div>
                <div className="mt-1 flex gap-2 text-xs">
                  <span className="rounded bg-neutral-200 px-2 py-0.5">{a.priority}</span>
                  <span className="rounded bg-neutral-200 px-2 py-0.5">{a.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
