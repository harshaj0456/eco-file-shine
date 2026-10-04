import { useState } from "react";
import {
  Zap,
  Play,
  Plus,
  Clock,
  Trash2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline24Hour } from "./Timeline24Hour";
import { CarbonIntensityChart } from "./CarbonIntensityChart";
import { AddJobModal } from "./AddJobModal";
import { DaySimulationModal } from "./DaySimulationModal";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import {
  formatCarbonValue,
  formatCurrencyValue,
} from "@/lib/services/CarbonCalculator";
import type { ScheduledJob } from "@/lib/types";
import { toast } from "sonner";

export function GreenQueueApp() {
  const { jobs, updateJobStatus, deleteJob } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const { setAddJobModalOpen, setDaySimulationOpen } = useUIStore();

  const totalEmissionsGrams = jobs.reduce((sum, j) => sum + j.estimatedCo2Grams, 0);
  const totalSavedGrams = jobs.reduce((sum, j) => sum + j.co2SavedGrams, 0);
  const totalCost = jobs.reduce((sum, j) => sum + j.costEstimated, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="size-4" />
            </span>
            <h1 className="text-xl font-extrabold text-foreground">
              GreenQueue Carbon-Aware Workload Scheduler
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Schedule heavy compute, AI fine-tuning, and media pipelines in clean solar/wind windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDaySimulationOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs text-xs"
          >
            <Play className="size-3.5 fill-emerald-500 text-emerald-500" /> Simulate Day
          </Button>
          <Button
            size="sm"
            onClick={() => setAddJobModalOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs text-xs"
          >
            <Plus className="size-3.5" /> Queue Workload
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Scheduled Tasks
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">{jobs.length}</span>
            <span className="text-xs text-muted-foreground">workloads active</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            Carbon Avoided
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCarbonValue(totalSavedGrams, settings.units.weight)}
            </span>
            <span className="text-xs text-emerald-500 font-bold">vs dirty peak slots</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-primary uppercase">
            Estimated Energy Cost
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-primary">
              {formatCurrencyValue(totalCost, settings.units.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              (@ {formatCurrencyValue(settings.units.pricePerKwh, settings.units.currency)}/kWh)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Timeline */}
      <Timeline24Hour />

      {/* 24-Hour Carbon Intensity Curve */}
      <CarbonIntensityChart />

      {/* Workload Table */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
          All Queued & Scheduled Tasks
        </h4>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-2 font-bold">Workload Name</th>
                <th className="px-3 py-2 font-bold">Power & Duration</th>
                <th className="px-3 py-2 font-bold">Slot & Deadline</th>
                <th className="px-3 py-2 font-bold">Emissions</th>
                <th className="px-3 py-2 font-bold">Status</th>
                <th className="px-3 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-foreground">{job.name}</div>
                    <div className="text-[10px] text-muted-foreground">{job.workloadType}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">
                    {job.powerKw} kW · {job.durationHours} hrs
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-bold text-foreground">
                      {String(job.scheduledSlotHour).padStart(2, "0")}:00
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Deadline: {job.deadlineHour}:00
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-bold text-primary">
                      {Math.round(job.estimatedCo2Grams)} g CO₂
                    </span>
                    {job.co2SavedGrams > 0 && (
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        (-{Math.round(job.co2SavedGrams)}g saved)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={job.status === "completed" ? "default" : "outline"} className="text-[10px]">
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteJob(job.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddJobModal />
      <DaySimulationModal />
    </div>
  );
}
