import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, Calendar } from "lucide-react";

const TREND_DATA = [
  { month: "May", storageGB: 52.4, carbonKg: 14.8, score: 64 },
  { month: "Jun", storageGB: 49.1, carbonKg: 12.3, score: 68 },
  { month: "Jul", storageGB: 46.8, carbonKg: 9.6, score: 72 },
  { month: "Aug", storageGB: 42.0, carbonKg: 6.8, score: 79 },
  { month: "Sep", storageGB: 38.4, carbonKg: 4.8, score: 84 },
  { month: "Oct", storageGB: 32.1, carbonKg: 2.9, score: 88 },
];

export function TrendChartWidget() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">6-Month Digital Footprint Trajectory</h3>
            <span className="text-[11px] text-muted-foreground">
              Storage reduced by 38.7% · Carbon footprint slashed by 80.4%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="size-2 rounded-full bg-primary" /> Digital Footprint (kg CO₂e)
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-blue-400" /> Active Storage (GB)
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="my-3 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "var(--color-foreground)",
              }}
              formatter={(value: any, name: any) => [
                name === "carbonKg" ? `${value} kg CO₂e` : `${value} GB`,
                name === "carbonKg" ? "Monthly Carbon" : "Total Storage",
              ]}
            />
            <Area
              type="monotone"
              dataKey="carbonKg"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#primaryGradient)"
            />
            <Area
              type="monotone"
              dataKey="storageGB"
              stroke="#38bdf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#storageGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" /> Next monthly sustainability audit: Nov 1, 2026
        </span>
        <span className="font-semibold text-emerald-500">Continuous 6-month decrease 🔥</span>
      </div>
    </div>
  );
}
