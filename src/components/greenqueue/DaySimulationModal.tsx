import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import {
  getHourlyCarbonIntensity,
  formatCarbonValue,
} from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";

export function DaySimulationModal() {
  const { isDaySimulationOpen, setDaySimulationOpen } = useUIStore();
  const jobs = useDataStore((s) => s.jobs);
  const settings = useSettingsStore((s) => s.settings);

  const [simHour, setSimHour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(2);
  const [cumulativeCo2, setCumulativeCo2] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const hourlyIntensities = getHourlyCarbonIntensity(settings);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 1000 / speed;
      timerRef.current = setInterval(() => {
        setSimHour((prev) => {
          if (prev >= 23) {
            setIsPlaying(false);
            return 23;
          }
          const next = prev + 1;

          // Check jobs running at this next hour
          const activeAtHour = jobs.filter(
            (j) =>
              next >= j.scheduledSlotHour &&
              next < j.scheduledSlotHour + j.durationHours
          );

          let hourCo2 = 0;
          const currentIntensity = hourlyIntensities[next] ?? 250;
          activeAtHour.forEach((j) => {
            const added = j.powerKw * currentIntensity;
            hourCo2 += added;
          });

          setCumulativeCo2((c) => c + hourCo2);

          if (activeAtHour.length > 0) {
            setLogs((l) => [
              `[${String(next).padStart(2, "0")}:00] Active: ${activeAtHour.map((j) => j.name).join(", ")} (+${Math.round(hourCo2)}g CO₂)`,
              ...l.slice(0, 15),
            ]);
          }

          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, jobs, hourlyIntensities]);

  const handleReset = () => {
    setIsPlaying(false);
    setSimHour(0);
    setCumulativeCo2(0);
    setLogs(["Simulation reset to 00:00"]);
  };

  const currentIntensity = hourlyIntensities[simHour] ?? 250;
  const activeJobsNow = jobs.filter(
    (j) =>
      simHour >= j.scheduledSlotHour &&
      simHour < j.scheduledSlotHour + j.durationHours
  );

  return (
    <Dialog open={isDaySimulationOpen} onOpenChange={setDaySimulationOpen}>
      <DialogContent className="max-w-xl font-sans bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Play className="size-4 fill-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">24-Hour Schedule Simulation</DialogTitle>
              <DialogDescription className="text-xs">
                Simulate day playback with live grid carbon telemetry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Live Moving Clock & Counter Box */}
        <div className="my-2 rounded-xl border border-border bg-muted/40 p-4 text-center">
          <div className="flex items-center justify-center gap-8">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Clock</span>
              <div className="text-3xl font-mono font-extrabold text-foreground tracking-wider">
                {String(simHour).padStart(2, "0")}:00
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Grid Intensity</span>
              <div className="text-2xl font-mono font-bold text-amber-500">
                {currentIntensity} <span className="text-xs font-normal">g/kWh</span>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Cumulative CO₂</span>
              <div className="text-2xl font-mono font-bold text-primary">
                {formatCarbonValue(cumulativeCo2, settings.units.weight)}
              </div>
            </div>
          </div>

          {/* Timeline scrubber bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-primary transition-all duration-300"
                style={{ width: `${((simHour + 1) / 24) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Workloads at this hour */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Workloads Running at {String(simHour).padStart(2, "0")}:00:</span>
            <span className="text-muted-foreground font-mono">{activeJobsNow.length} active</span>
          </div>

          <div className="rounded-lg border border-border bg-background p-2.5 min-h-16 flex items-center justify-center">
            {activeJobsNow.length === 0 ? (
              <span className="text-xs text-muted-foreground">No workloads running at this hour.</span>
            ) : (
              <div className="flex flex-wrap gap-2 w-full">
                {activeJobsNow.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary-soft/40 px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    <Zap className="size-3 text-amber-500 animate-pulse" />
                    <span>{j.name}</span>
                    <span className="text-[10px] opacity-70">({j.powerKw} kW)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time simulation event feed */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Telemetry Feed</span>
          <div className="rounded-lg border border-border bg-background p-2 max-h-28 overflow-y-auto font-mono text-[11px] text-muted-foreground space-y-0.5">
            {logs.map((l, i) => (
              <div key={i} className="truncate">
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="font-bold gap-1"
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-white" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Speed:</span>
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-xs font-bold",
                  speed === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
