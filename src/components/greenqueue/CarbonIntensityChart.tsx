import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Zap, Sun, Moon, Info } from "lucide-react";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { getHourlyCarbonIntensity } from "@/lib/services/CarbonCalculator";

export function CarbonIntensityChart() {
  const settings = useSettingsStore((s) => s.settings);
  const hourlyIntensities = getHourlyCarbonIntensity(settings);

  const data = hourlyIntensities.map((intensity, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    intensity,
    rawHour: hour,
  }));

  const getBarColor = (val: number) => {
    if (val < 200) return "#10b981"; // Emerald
    if (val < 350) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs font-sans space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500" />
            Grid Carbon Intensity Profile ({settings.general.region.toUpperCase()})
          </h3>
          <p className="text-xs text-muted-foreground">
            Emission factor curve in grams of CO₂ per kilowatt-hour across 24 hours
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Sun className="size-3.5" /> Solar Midday (11:00–15:00)
          </span>
          <span className="flex items-center gap-1 text-rose-600 font-semibold">
            <Moon className="size-3.5" /> Evening Peak (17:00–21:00)
          </span>
        </div>
      </div>

      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "var(--color-foreground)",
              }}
              formatter={(value: any) => [`${value} g CO₂/kWh`, "Grid Intensity"]}
            />
            <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.intensity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
