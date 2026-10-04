import { Clock, Plus, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";

export function UpcomingScheduleWidget() {
  const jobs = useDataStore((s) => s.jobs);
  const { setActiveTab, setAddJobModalOpen } = useUIStore();

  const sortedJobs = [...jobs]
    .filter((j) => j.status !== "completed")
    .sort((a, b) => a.scheduledSlotHour - b.scheduledSlotHour)
    .slice(0, 3);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Today's Workload Schedule</h3>
            <span className="text-[11px] text-muted-foreground">
              {sortedJobs.length} tasks scheduled in clean grid slots
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-bold gap-1"
          onClick={() => setAddJobModalOpen(true)}
        >
          <Plus className="size-3" /> Queue Job
        </Button>
      </div>

      <div className="my-3 divide-y divide-border/60">
        {sortedJobs.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No workloads currently queued for today.</p>
        ) : (
          sortedJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between py-2 text-xs first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded bg-primary/10 text-[11px] font-mono font-bold text-primary">
                  {String(job.scheduledSlotHour).padStart(2, "0")}h
                </span>
                <div>
                  <div className="font-bold text-foreground">{job.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {job.powerKw} kW · {job.durationHours}h · est. {Math.round(job.estimatedCo2Grams)} g CO₂
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {job.status}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Avoid peak dirty slots (17:00–21:00)</span>
        <button onClick={() => setActiveTab("greenQueue")} className="text-xs font-bold text-primary hover:underline">
          Full 24-Hour Timeline →
        </button>
      </div>
    </div>
  );
}
