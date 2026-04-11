"use client";

interface UsageBarProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
}

export default function UsageBar({ label, current, max, unit = "" }: UsageBarProps) {
  const isUnlimited = max === Infinity || max > 999999;
  const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
  const isWarning = percentage > 80;
  const isFull = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-navy-600">{label}</span>
        <span className="text-navy-400 text-xs">
          {current}{unit} / {isUnlimited ? "Unlimited" : `${max}${unit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isFull ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-brand-500"
          }`}
          style={{ width: isUnlimited ? "5%" : `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
