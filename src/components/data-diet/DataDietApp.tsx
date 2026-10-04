import { useState } from "react";
import {
  HardDrive,
  Play,
  Layers,
  Sparkles,
  Shield,
  Trash2,
  Minimize2,
  Archive,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataDietTreemap } from "./DataDietTreemap";
import { DropZones } from "./DropZones";
import { FileManagementTable } from "./FileManagementTable";
import { RuleRunnerModal } from "./RuleRunnerModal";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import { formatStorageValue, formatCarbonValue } from "@/lib/services/CarbonCalculator";

export function DataDietApp({
  topBar,
}: {
  skipOnboarding?: boolean;
  topBar?: React.ReactNode;
} = {}) {
  const { files, setFileStatus } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const setRuleRunnerOpen = useUIStore((s) => s.setRuleRunnerOpen);

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const activeFiles = files.filter((f) => f.status === "active");
  const cleanedFiles = files.filter((f) => f.status !== "active");

  const totalActiveGb = activeFiles.reduce((sum, f) => sum + f.sizeGB, 0);
  const totalCleanedGb = cleanedFiles.reduce((sum, f) => sum + f.sizeGB, 0);
  const totalCarbonGrams = activeFiles.reduce((sum, f) => sum + f.carbonGramsAnnual, 0);
  const savedCarbonGrams = cleanedFiles.reduce((sum, f) => sum + f.carbonGramsAnnual, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
              <HardDrive className="size-4" />
            </span>
            <h1 className="text-xl font-extrabold text-foreground">Data Diet Storage Optimizer</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Eliminate dark data, duplicate bursts, and dormant cold files to slash your digital footprint.
          </p>
        </div>

        {/* Action Button: Run Rules Now */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setRuleRunnerOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs"
          >
            <Play className="size-3.5 fill-primary-foreground" /> Run Rules Now
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Tracked Storage
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">
              {formatStorageValue(totalActiveGb, settings.units.storage)}
            </span>
            <span className="text-xs text-muted-foreground">({activeFiles.length} files)</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            Recovered Space
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatStorageValue(totalCleanedGb, settings.units.storage)}
            </span>
            <span className="text-xs text-muted-foreground">({cleanedFiles.length} optimized)</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold text-primary uppercase">
            Annual Footprint
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-primary">
              {formatCarbonValue(totalCarbonGrams, settings.units.weight)}
            </span>
            <span className="text-xs text-emerald-500 font-bold">
              (-{formatCarbonValue(savedCarbonGrams, settings.units.weight)} avoided)
            </span>
          </div>
        </div>
      </div>

      {/* Treemap Category Distribution */}
      <DataDietTreemap />

      {/* Action Drop Targets */}
      <DropZones selectedFileIds={selectedFileIds} onActionComplete={() => setSelectedFileIds([])} />

      {/* Searchable File Management Table */}
      <FileManagementTable
        selectedIds={selectedFileIds}
        onSelectionChange={setSelectedFileIds}
      />

      {/* Rule Runner Modal */}
      <RuleRunnerModal />
    </div>
  );
}