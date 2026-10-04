import { Laptop, ArrowRight, ShieldCheck, AlertCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";

export function DevicesWidget() {
  const devices = useDataStore((s) => s.devices);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const avgHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );

  const totalSavedCo2 = devices.reduce(
    (sum, d) => sum + d.maintenanceHistory.reduce((mSum, m) => mSum + m.co2SavedKg, 0),
    0
  );

  const needsAttention = devices.filter((d) => d.status === "needs_attention" || d.healthPercent < 80);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
            <Laptop className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">E-Waste Passport</h3>
            <span className="text-[11px] text-muted-foreground">
              {devices.length} registered hardware assets
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-bold"
          onClick={() => setActiveTab("devices")}
        >
          Passport <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>

      <div className="my-3 flex items-center justify-between gap-4 rounded-lg bg-muted/40 p-3">
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground">Fleet Health Average</div>
          <div className="text-2xl font-extrabold text-foreground">{avgHealth}%</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Lifespan Savings</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +{totalSavedCo2} kg
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
        {needsAttention.length > 0 ? (
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <AlertCircle className="size-3.5" />
            {needsAttention.length} device{needsAttention.length > 1 ? "s" : ""} need check-up
          </span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-emerald-500">
            <ShieldCheck className="size-3.5" />
            All registered hardware healthy
          </span>
        )}

        <button
          onClick={() => setActiveTab("devices")}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <Wrench className="size-3" /> Repair vs Replace
        </button>
      </div>
    </div>
  );
}
