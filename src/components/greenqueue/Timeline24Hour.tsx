import { useState } from "react";
import {
  Zap,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import {
  getHourlyCarbonIntensity,
  calculateJobEmission,
  findCleanestSlotForJob,
  isInQuietHours,
  formatCarbonValue,
  formatCurrencyValue,
} from "@/lib/services/CarbonCalculator";
import type { ScheduledJob } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Timeline24Hour({
  onSelectJob,
}: {
  onSelectJob?: (job: ScheduledJob) => void;
}) {
  const { jobs, rescheduleJobSlot } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);

  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const hourlyIntensities = getHourlyCarbonIntensity(settings);
  const quietHours = settings.greenQueue.quietHours;
  const currentHour = new Date().getHours();

  const getSlotColor = (grams: number) => {
    if (grams < 200) return "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
    if (grams < 350) return "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400";
    return "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400";
  };

  const getSlotPillBg = (grams: number) => {
    if (grams < 200) return "bg-emerald-500";
    if (grams < 350) return "bg-amber-500";
    return "bg-rose-500";
  };

  const handleDropOnSlot = (slotHour: number) => {
    if (!draggedJobId) return;
    const job = jobs.find((j) => j.id === draggedJobId);
    if (!job) return;

    // Calculate CO2 and savings
    const currentEmission = calculateJobEmission(job.powerKw, job.durationHours, slotHour, hourlyIntensities);
    const worstEmission = calculateJobEmission(job.powerKw, job.durationHours, 18, hourlyIntensities); // Peak 18:00
    const saved = Math.max(0, worstEmission - currentEmission);

    rescheduleJobSlot(job.id, slotHour, currentEmission, saved);
    setDraggedJobId(null);
    setHoverSlot(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs font-sans space-y-4">
      {/* Header with Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            24-Hour Carbon Intensity Schedule
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag workloads into green hours to cut emissions and electricity costs
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="size-2 rounded-full bg-emerald-500" /> Clean (&lt;200 g/kWh)
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="size-2 rounded-full bg-amber-500" /> Moderate (200–350 g/kWh)
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="size-2 rounded-full bg-rose-500" /> Dirty Peak (&gt;350 g/kWh)
          </span>
          {quietHours.enabled && (
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
              <Moon className="size-3" /> Quiet Hours ({quietHours.start}:00–{quietHours.end}:00)
            </span>
          )}
        </div>
      </div>

      {/* 24-Hour Timeline Grid (Horizontal Scrollable) */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="grid grid-cols-24 gap-1 min-w-[960px]">
          {Array.from({ length: 24 }).map((_, hour) => {
            const intensity = hourlyIntensities[hour] ?? 250;
            const isCurrent = hour === currentHour;
            const isQuiet =
              quietHours.enabled &&
              isInQuietHours(hour, 1, quietHours.start, quietHours.end);
            const isHovered = hoverSlot === hour;

            // Jobs scheduled at this hour
            const slotJobs = jobs.filter(
              (j) => j.status === "scheduled" && j.scheduledSlotHour === hour
            );

            return (
              <div
                key={hour}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverSlot(hour);
                }}
                onDragLeave={() => setHoverSlot(null)}
                onDrop={() => handleDropOnSlot(hour)}
                className={cn(
                  "relative flex flex-col justify-between rounded-lg border p-1.5 min-h-40 transition-all select-none",
                  getSlotColor(intensity),
                  isQuiet && "border-dashed border-purple-500/40 bg-purple-500/5",
                  isCurrent && "ring-2 ring-primary ring-offset-1",
                  isHovered && "scale-105 shadow-md ring-2 ring-amber-400 z-10"
                )}
              >
                {/* Hour Header */}
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>{String(hour).padStart(2, "0")}:00</span>
                  {isQuiet && <Moon className="size-2.5 text-purple-500" />}
                </div>

                {/* Slot Jobs Container */}
                <div className="my-1 flex-1 space-y-1">
                  {slotJobs.map((job) => {
                    const isConflict = job.scheduledSlotHour > job.deadlineHour;
                    const inQuiet =
                      quietHours.enabled &&
                      isInQuietHours(job.scheduledSlotHour, job.durationHours, quietHours.start, quietHours.end);

                    return (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", job.id);
                          setDraggedJobId(job.id);
                          setSelectedJobId(job.id);
                        }}
                        onDragEnd={() => setDraggedJobId(null)}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          onSelectJob?.(job);
                        }}
                        className={cn(
                          "cursor-grab rounded border border-border/80 bg-card p-1 shadow-2xs text-[10px] transition-all hover:scale-102",
                          isConflict && "border-rose-500 bg-rose-500/10",
                          inQuiet && "border-purple-500 bg-purple-500/10"
                        )}
                        title={`${job.name} (${job.powerKw} kW · ${job.durationHours}h)`}
                      >
                        <div className="font-bold text-foreground truncate">{job.name}</div>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-0.5">
                          <span>{job.powerKw}kW · {job.durationHours}h</span>
                          <span className="font-bold text-primary">{Math.round(job.estimatedCo2Grams)}g</span>
                        </div>
                        {isConflict && (
                          <div className="flex items-center gap-0.5 text-[8px] font-bold text-rose-500 mt-0.5">
                            <AlertTriangle className="size-2.5" /> Misses {job.deadlineHour}:00 deadline
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Intensity Pill */}
                <div className="pt-1 border-t border-border/40 text-center text-[9px] font-mono font-bold">
                  {intensity} <span className="text-[8px] opacity-70">g/k</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Job / Slot Inspector */}
      {selectedJobId && (
        <SelectedJobInspector
          jobId={selectedJobId}
          hourlyIntensities={hourlyIntensities}
          quietHours={quietHours}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}

function SelectedJobInspector({
  jobId,
  hourlyIntensities,
  quietHours,
  onClose,
}: {
  jobId: string;
  hourlyIntensities: number[];
  quietHours: { start: number; end: number; enabled: boolean };
  onClose: () => void;
}) {
  const { jobs, rescheduleJobSlot } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);

  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const cleanest = findCleanestSlotForJob(job, hourlyIntensities, quietHours);
  const currentEmission = calculateJobEmission(job.powerKw, job.durationHours, job.scheduledSlotHour, hourlyIntensities);
  const cleanEmission = calculateJobEmission(job.powerKw, job.durationHours, cleanest.slot, hourlyIntensities);
  const savings = Math.max(0, currentEmission - cleanEmission);

  const pricePerKwh = settings.units.pricePerKwh;
  const currentCost = job.powerKw * job.durationHours * pricePerKwh;

  const handleApplyCleanest = () => {
    rescheduleJobSlot(job.id, cleanest.slot, cleanEmission, savings);
    toast.success(`Shifted ${job.name} to optimal slot (${cleanest.slot}:00)!`);
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-primary-soft/30 p-4 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            ⚡
          </span>
          <div>
            <h4 className="text-xs font-bold text-foreground">{job.name}</h4>
            <span className="text-[11px] text-muted-foreground">
              {job.workloadType} · Scheduled at {String(job.scheduledSlotHour).padStart(2, "0")}:00 (Deadline: {job.deadlineHour}:00)
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 text-xs text-muted-foreground">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Current Footprint</span>
          <div className="mt-0.5 text-base font-extrabold text-foreground">
            {formatCarbonValue(currentEmission, settings.units.weight)}
          </div>
          <span className="text-[10px] text-muted-foreground">Cost: {formatCurrencyValue(currentCost, settings.units.currency)}</span>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold flex items-center gap-1">
            <Sparkles className="size-2.5" /> Recommended Clean Slot
          </span>
          <div className="mt-0.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {String(cleanest.slot).padStart(2, "0")}:00 Slot
          </div>
          <span className="text-[10px] text-emerald-600/80">
            Footprint: {formatCarbonValue(cleanEmission, settings.units.weight)}
          </span>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-2.5">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Potential Savings</span>
            <div className="text-base font-extrabold text-emerald-500">
              {savings > 0 ? `-${Math.round(savings)} g CO₂` : "Already Optimized"}
            </div>
          </div>
          {job.scheduledSlotHour !== cleanest.slot && (
            <Button
              size="sm"
              className="mt-1 h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={handleApplyCleanest}
            >
              Move to {cleanest.slot}:00
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
