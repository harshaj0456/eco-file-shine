import { useState } from "react";
import {
  Laptop,
  Smartphone,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  RotateCw,
  Wrench,
  ShieldCheck,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import type { DeviceItem } from "@/lib/types";
import { formatCurrencyValue } from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DeviceFlipCard({
  device,
  onOpenAudit,
}: {
  device: DeviceItem;
  onOpenAudit?: (device: DeviceItem) => void;
}) {
  const { logDeviceMaintenance, deleteDevice } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [actionText, setActionText] = useState("");
  const [cost, setCost] = useState(25);

  const getDeviceIcon = (typeId: string) => {
    switch (typeId) {
      case "phone":
        return Smartphone;
      case "monitor":
        return Monitor;
      case "server":
        return Server;
      case "rpi":
        return Cpu;
      default:
        return Laptop;
    }
  };

  const Icon = getDeviceIcon(device.deviceTypeId);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;

    logDeviceMaintenance(device.id, {
      date: new Date().toISOString().split("T")[0]!,
      action: actionText.trim(),
      technicianOrNotes: "Service logged in Passport",
      cost,
      co2SavedKg: 30,
    });

    setActionText("");
    setIsAddingLog(false);
  };

  const completedChecks = Object.values(device.checklistAnswers).filter(Boolean).length;
  const totalChecks = settings.devices.checklistItems.length || 7;

  return (
    <div className="relative min-h-[360px] w-full [perspective:1000px] font-sans">
      <div
        className={cn(
          "size-full rounded-2xl transition-all duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* FRONT OF CARD */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs [backface-visibility:hidden]">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Icon className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground truncate max-w-44" title={device.name}>
                  {device.name}
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Purchased {device.purchaseDate} ({device.currentAgeYears} yrs old)
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-semibold gap-1"
              onClick={() => setIsFlipped(true)}
            >
              <RotateCw className="size-3" /> Timeline
            </Button>
          </div>

          {/* Health & Carbon Metrics */}
          <div className="my-3 space-y-3">
            <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-muted-foreground">Operational Health</span>
                <span className="font-extrabold text-foreground font-mono">{device.healthPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    device.healthPercent >= 85
                      ? "bg-emerald-500"
                      : device.healthPercent >= 70
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  )}
                  style={{ width: `${device.healthPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-border/80 bg-background p-2">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Embodied Carbon</span>
                <div className="text-sm font-bold text-foreground font-mono">{device.embodiedCarbonKg} kg CO₂e</div>
              </div>
              <div className="rounded-lg border border-border/80 bg-background p-2">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Expected Life</span>
                <div className="text-sm font-bold text-foreground font-mono">{device.expectedLifeYears} Years</div>
              </div>
            </div>
          </div>

          {/* Bottom Compliance & Actions */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
            <button
              onClick={() => onOpenAudit?.(device)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
            >
              <ShieldCheck className="size-3.5 text-primary" />
              WEEE Audit: {completedChecks}/{totalChecks}
            </button>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-semibold"
                onClick={() => {
                  setIsFlipped(true);
                  setIsAddingLog(true);
                }}
              >
                <Plus className="mr-1 size-3" /> Log Service
              </Button>
            </div>
          </div>
        </div>

        {/* BACK OF CARD: LIFECYCLE TIMELINE */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-primary/40 bg-card p-5 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" /> Lifecycle Passport Timeline
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground"
              onClick={() => setIsFlipped(false)}
            >
              ← Flip Back
            </Button>
          </div>

          {/* Timeline Milestones list */}
          <div className="my-2 flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs no-scrollbar">
            {isAddingLog ? (
              <form onSubmit={handleAddLog} className="space-y-2 rounded-lg border border-primary/40 bg-primary-soft/30 p-2.5">
                <span className="font-bold text-foreground block text-[11px]">Log New Maintenance / Upgrade</span>
                <input
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. Replaced battery, cleaned fans"
                  className="h-7 w-full rounded border border-input bg-background px-2 text-xs"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Cost:</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="h-6 w-16 rounded border border-input bg-background px-1 text-xs"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setIsAddingLog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="h-6 text-[10px] font-bold">
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            ) : null}

            {device.lifecycleTimeline.map((item) => (
              <div key={item.id} className="relative pl-4 border-l-2 border-primary/40 pb-1">
                <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-foreground">{item.title}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">{item.date}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Delete Device */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-rose-500 hover:bg-rose-500/10"
              onClick={() => deleteDevice(device.id)}
            >
              <Trash2 className="mr-1 size-3" /> Remove Device
            </Button>
            <span className="text-[10px] text-muted-foreground">Passport ID: {device.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
