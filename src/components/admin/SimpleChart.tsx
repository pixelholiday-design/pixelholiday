"use client";

export type ChartDataPoint = {
  label: string;
  value: number;
};

type SimpleChartProps = {
  data: ChartDataPoint[];
  title?: string;
  unit?: string;
  color?: string;
};

export default function SimpleChart({
  data,
  title,
  unit = "",
  color = "bg-coral-500",
}: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-navy-400 text-sm py-8">No data to display.</div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {title && <h3 className="heading text-sm mb-3">{title}</h3>}
      <div className="space-y-2">
        {data.map((point) => {
          const pct = (point.value / max) * 100;
          return (
            <div key={point.label} className="flex items-center gap-3 text-sm">
              <div className="w-28 shrink-0 text-right text-xs text-navy-500 truncate" title={point.label}>
                {point.label}
              </div>
              <div className="flex-1 h-6 bg-cream-200 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-20 shrink-0 text-xs font-semibold text-navy-900 tabular-nums">
                {unit}{point.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
