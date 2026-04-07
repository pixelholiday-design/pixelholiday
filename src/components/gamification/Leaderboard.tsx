"use client";
import { useEffect, useState } from "react";

export function BadgeNotification({ message }: { message: string }) {
  return <div className="fixed bottom-6 right-6 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg font-bold animate-bounce">{message}</div>;
}

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetch("/api/admin/leaderboard").then((r) => r.json()).then((d) => setData(d.leaderboard || []));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">🏆 Real-time Leaderboard</h2>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr><th>Rank</th><th>Name</th><th>Level</th><th>XP</th><th>Uploads</th><th>Sales</th><th>Badges</th></tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.userId} className="border-b">
              <td className="py-2">#{e.rank}</td>
              <td>{e.name}</td>
              <td>Lv.{e.level}</td>
              <td>{e.xp}</td>
              <td>{e.uploads}</td>
              <td>{e.sales}</td>
              <td>{e.badges.length}</td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-4">No data yet</td></tr>}
        </tbody>
      </table>
      {notification && <BadgeNotification message={notification} />}
    </div>
  );
}
