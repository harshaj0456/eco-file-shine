import { Zap, ArrowRight, Play, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { getHourlyCarbonIntensity } from "@/lib/services/CarbonCalculator";

export function GreenQueueWidget() {
  const jobs = useDataStore((s) => s.jobs);
  const { setActiveTab, setDaySimulationOpen } = useUIStore();
  const settings = useSettingsStore((s) => s.settings);

  const currentHour = new Date().getHours();
  const hourlyIntensities = getHourlyCarbonIntensity(settings);
  const currentIntensity = hourlyIntensities[currentHour] ?? 250;

  // Find lowest intensity in next 12 hours
  let minHour = currentHour;
  let minVal = currentIntensity;
  for (let i = 1; i <= 12; i++) {
    const h = (currentHour + i) % 24;
    if (hourlyIntensities[h] < minVal) {
      minVal = hourlyIntensities[h];
      minHour = h;
    }
  }

  const scheduledCount = jobs.filter((j) => j.status === "scheduled").length;
  const queuedCount = jobs.filter((j) => j.status === "queued").length;
  const totalSavedGrams = jobs.reduce((sum, j) => sum + j.co2SavedGrams, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Zap className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">GreenQueue Grid</h3>
            <span className="text-[11px] text-muted-foreground">
              {scheduledCount} active jobs · {queuedCount} in queue
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold gap-1"
            onClick={() => setDaySimulationOpen(true)}
          >
            <Play className="size-3 text-emerald-500 fill-emerald-500" /> Simulate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold"
            onClick={() => setActiveTab("greenQueue")}
          >
            Timeline <ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
      </div>

      {/* Grid Pulse Stats */}
      <div className="my-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Current Grid</span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-foreground">{currentIntensity}</span>
            <span className="text-[10px] text-muted-foreground">g CO₂/kWh</span>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <Sparkles className="size-2.5" /> Next Green Slot
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {String(minHour).padStart(2, "0")}:00
            </span>
            <span className="text-[10px] text-muted-foreground">({minVal} g/kWh)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Lifetime Workload Savings:</span>
        <span className="font-bold text-emerald-500 font-mono">
          -{(totalSavedGrams / 1000).toFixed(2)} kg CO₂e
        </span>
      </div>
    </div>
  );
}
