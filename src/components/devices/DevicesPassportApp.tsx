import { useState } from "react";
import { Laptop, Plus, Wrench, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairVsReplaceSlider } from "./RepairVsReplaceSlider";
import { DeviceFlipCard } from "./DeviceFlipCard";
import { AddDeviceModal } from "./AddDeviceModal";
import { ChecklistAuditDialog } from "./ChecklistAuditDialog";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import type { DeviceItem } from "@/lib/types";

export function DevicesPassportApp() {
  const { devices } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const { setAddDeviceModalOpen } = useUIStore();

  const [auditDevice, setAuditDevice] = useState<DeviceItem | null>(null);

  const avgHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );

  const totalEmbodiedCo2 = devices.reduce((sum, d) => sum + d.embodiedCarbonKg, 0);
  const totalSavedCo2 = devices.reduce(
    (sum, d) => sum + d.maintenanceHistory.reduce((mSum, m) => mSum + m.co2SavedKg, 0),
    0
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
              <Laptop className="size-4" />
            </span>
            <h1 className="text-xl font-extrabold text-foreground">
              E-Waste Passport & Hardware Lifespan Manager
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Track device health, schedule thermal care & battery service, and prevent premature e-waste.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddDeviceModalOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs text-xs"
          >
            <Plus className="size-3.5" /> Register Device
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Registered Assets
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">{devices.length}</span>
            <span className="text-xs text-muted-foreground">devices in passport</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            Lifespan Carbon Saved
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{totalSavedCo2} kg CO₂e
            </span>
            <span className="text-xs text-emerald-500 font-bold">via repairs & audits</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
            Fleet Health Score
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {avgHealth}%
            </span>
            <span className="text-xs text-muted-foreground">average index</span>
          </div>
        </div>
      </div>

      {/* Repair vs Replace Interactive Slider */}
      <RepairVsReplaceSlider />

      {/* Grid of Flip Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Hardware Digital Passports ({devices.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            Click "Timeline" on any card to view maintenance logs or log a service
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((device) => (
            <DeviceFlipCard
              key={device.id}
              device={device}
              onOpenAudit={(d) => setAuditDevice(d)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddDeviceModal />
      <ChecklistAuditDialog
        device={auditDevice}
        open={Boolean(auditDevice)}
        onOpenChange={(open) => !open && setAuditDevice(null)}
      />
    </div>
  );
}
