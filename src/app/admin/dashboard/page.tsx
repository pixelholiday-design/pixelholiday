"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/dashboard").then((r) => r.json()).then(setData).catch(() => setData({}));
  }, []);
  if (!data) return <div className="p-8">Loading dashboard…</div>;

  const pieData = [
    { name: "Manual", value: data.salesBreakdown?.manual?.revenue || 0 },
    { name: "Automated (Sleeping Money)", value: data.salesBreakdown?.automated?.revenue || 0 },
  ];
  const COLORS = ["#3b82f6", "#a855f7"];

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">CEO Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Revenue" value={`€${(data.totalRevenue || 0).toFixed(2)}`} />
        <Card title="Pending Payouts" value={`€${(data.pendingPayouts || 0).toFixed(2)}`} />
        <Card title="Digital Passes" value={`${data.digitalPasses?.count || 0} (€${data.digitalPasses?.revenue || 0})`} />
        <Card title="Equipment Cost" value={`€${(data.equipmentCost || 0).toFixed(2)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Revenue by Location</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.revenueByLocation || []}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Conversion: Uploaded vs Sold</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{ name: "Galleries", uploaded: data.conversion?.uploaded || 0, sold: data.conversion?.sold || 0 }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="uploaded" fill="#94a3b8" />
              <Bar dataKey="sold" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Automated vs Manual Sales</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Photographer Performance</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th>Name</th><th>Uploaded</th><th>Sold</th><th>Rate</th></tr></thead>
            <tbody>
              {(data.photographerStats || []).map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">
                    {p.name}
                    {p.flagged && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">LOW</span>}
                  </td>
                  <td>{p.uploaded}</td>
                  <td>{p.sold}</td>
                  <td>{(p.conversionRate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
