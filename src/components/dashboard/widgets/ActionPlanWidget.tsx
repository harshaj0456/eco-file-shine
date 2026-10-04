import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle, Zap, HardDrive, Laptop, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  module: "dataDiet" | "greenQueue" | "devices";
  impactScoreDelta: number;
  impactCo2SavedKg: number;
  icon: typeof HardDrive;
  actionText: string;
}

export function ActionPlanWidget() {
  const { files, jobs, devices, setFileStatus, rescheduleJobSlot, logDeviceMaintenance } = useDataStore();
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  // "What if?" preview state map: itemId -> boolean
  const [whatIfPreviews, setWhatIfPreviews] = useState<Record<string, boolean>>({});

  const duplicates = files.filter((f) => f.isDuplicate && f.status === "active");
  const dupGb = duplicates.reduce((s, f) => s + f.sizeGB, 0);

  const ACTIONS: ActionItem[] = [
    {
      id: "act-duplicates",
      title: `Purge ${duplicates.length} Duplicate Media Files`,
      description: `Recover ${dupGb.toFixed(1)} GB of wasted cloud and disk storage immediately.`,
      module: "dataDiet",
      impactScoreDelta: +4,
      impactCo2SavedKg: Number((dupGb * 0.074).toFixed(2)),
      icon: HardDrive,
      actionText: "Clean Duplicates",
    },
    {
      id: "act-green-shift",
      title: "Shift AI Fine-tuning to 13:00 Window",
      description: "Run during peak solar grid window (170 g/kWh vs 440 g/kWh evening peak).",
      module: "greenQueue",
      impactScoreDelta: +3,
      impactCo2SavedKg: 0.82,
      icon: Zap,
      actionText: "Reschedule to 13:00",
    },
    {
      id: "act-dev-service",
      title: "Perform Pixel 8 Battery & Thermal Service",
      description: "Health is at 79%. Battery renewal extends device life by +2 years.",
      module: "devices",
      impactScoreDelta: +5,
      impactCo2SavedKg: 55.0,
      icon: Laptop,
      actionText: "Log Service",
    },
  ];

  const handleToggleWhatIf = (id: string) => {
    setWhatIfPreviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyAction = (item: ActionItem) => {
    if (item.id === "act-duplicates") {
      const ids = duplicates.map((f) => f.id);
      ids.forEach((id) => setFileStatus(id, "deleted", false));
      toast.success(`Purged ${ids.length} duplicates`, {
        description: `Score boosted by +${item.impactScoreDelta} pts!`,
      });
    } else if (item.id === "act-green-shift") {
      const targetJob = jobs.find((j) => j.name.includes("ResNet") || j.name.includes("AI"));
      if (targetJob) {
        rescheduleJobSlot(targetJob.id, 13, 270, 420);
      }
      toast.success("Workload moved to 13:00 solar slot!");
    } else if (item.id === "act-dev-service") {
      const dev = devices.find((d) => d.id === "dev-2");
      if (dev) {
        logDeviceMaintenance(dev.id, {
          date: new Date().toISOString().split("T")[0]!,
          action: "Battery replaced & thermal pad renewed",
          technicianOrNotes: "Quick self-service",
          cost: 35,
          co2SavedKg: 55,
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Smart Priority Action Plan</h3>
            <span className="text-[11px] text-muted-foreground">
              AI recommendations with live "What if?" preview
            </span>
          </div>
        </div>
      </div>

      <div className="my-3 divide-y divide-border/60">
        {ACTIONS.map((item) => {
          const Icon = item.icon;
          const isPreviewing = Boolean(whatIfPreviews[item.id]);

          return (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground mt-0.5">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{item.title}</span>
                      {isPreviewing && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                          <Eye className="size-2.5" /> +{item.impactScoreDelta} pts · -{item.impactCo2SavedKg} kg CO₂
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* What If Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                    <span>Preview</span>
                    <Switch
                      checked={isPreviewing}
                      onCheckedChange={() => handleToggleWhatIf(item.id)}
                      className="scale-75"
                    />
                  </label>

                  <Button
                    size="sm"
                    className="h-7 text-xs font-bold"
                    onClick={() => handleApplyAction(item)}
                  >
                    {item.actionText}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Completing all 3 actions raises score by <strong className="text-emerald-500">+12 pts</strong></span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-primary hover:bg-primary/10"
          onClick={() => setActiveTab("dataDiet")}
        >
          View all tasks <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  );
}
