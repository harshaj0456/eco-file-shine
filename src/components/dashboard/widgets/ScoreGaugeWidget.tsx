import { useState } from "react";
import { Gauge, Info, TrendingUp, Sparkles, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { calculateCompositeScore } from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";

export function ScoreGaugeWidget() {
  const { files, jobs, devices } = useDataStore();
  const { settings, setScoringWeight, resetSettings } = useSettingsStore();
  const [showTuning, setShowTuning] = useState(false);
  const [hoverDelta, setHoverDelta] = useState<number | null>(null);

  const storageHealth = Math.min(100, Math.max(20, 100 - files.filter((f) => f.status === "active").length * 2.5));
  const computeHealth = Math.min(100, Math.max(30, 70 + jobs.filter((j) => j.status === "completed").length * 8));
  const deviceHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );

  const liveScore = calculateCompositeScore(storageHealth, computeHealth, deviceHealth, settings.scoring);
  const w = settings.scoring;

  // Grade Tier
  const tier =
    liveScore >= 90
      ? { label: "Platinum Eco Leader", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
      : liveScore >= 75
        ? { label: "Gold Carbon Optimizer", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" }
        : liveScore >= 60
          ? { label: "Silver Clean Specialist", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
          : { label: "Bronze Eco Starter", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Gauge className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Digital Carbon Score</h3>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", tier.bg, tier.color)}>
              {tier.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* ?Why Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                <Info className="size-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-xs font-sans p-3.5" align="end">
              <h4 className="font-bold text-foreground">How is your score calculated?</h4>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Your score (0–100) blends 3 pillars according to your custom weights:
              </p>
              <div className="mt-2.5 space-y-1.5 border-t border-border pt-2 text-[11px]">
                <div className="flex justify-between">
                  <span>Data Diet Storage ({w.dataDiet}%):</span>
                  <span className="font-bold">{Math.round(storageHealth)}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>GreenQueue Compute ({w.greenQueue}%):</span>
                  <span className="font-bold">{Math.round(computeHealth)}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Passport ({w.devices}%):</span>
                  <span className="font-bold">{Math.round(deviceHealth)}/100</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTuning(!showTuning)}
            className="h-7 text-xs font-semibold gap-1"
          >
            <SlidersHorizontal className="size-3" />
            {showTuning ? "Hide Tuning" : "Tune Weights"}
          </Button>
        </div>
      </div>

      {/* Center Gauge / Score Display */}
      <div className="my-4 flex items-center justify-center gap-6">
        <div className="relative grid size-28 place-items-center">
          {/* Circular SVG Ring */}
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-muted"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-primary transition-all duration-700 ease-out"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * liveScore) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{liveScore}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">OUT OF 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-muted-foreground">
              <span>Data Diet</span>
              <span className="font-bold text-foreground">{Math.round(storageHealth)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${storageHealth}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-muted-foreground">
              <span>GreenQueue</span>
              <span className="font-bold text-foreground">{Math.round(computeHealth)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${computeHealth}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-muted-foreground">
              <span>E-Waste Passport</span>
              <span className="font-bold text-foreground">{Math.round(deviceHealth)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${deviceHealth}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Weight Tuning Sliders */}
      {showTuning && (
        <div className="mt-2 space-y-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span>Live Scoring Weights (Auto-normalizes to 100%)</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => resetSettings()}
            >
              <RotateCcw className="mr-1 size-2.5" /> Reset
            </Button>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Data Diet Weight:</span>
              <span className="font-bold text-blue-500">{w.dataDiet}%</span>
            </div>
            <Slider
              value={[w.dataDiet]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("dataDiet", v ?? 35)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>GreenQueue Weight:</span>
              <span className="font-bold text-amber-500">{w.greenQueue}%</span>
            </div>
            <Slider
              value={[w.greenQueue]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("greenQueue", v ?? 35)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Hardware Passport Weight:</span>
              <span className="font-bold text-purple-500">{w.devices}%</span>
            </div>
            <Slider
              value={[w.devices]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("devices", v ?? 30)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
