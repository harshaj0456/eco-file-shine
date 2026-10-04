import { useState } from "react";
import { Shield, Minimize2, Archive, Trash2, CheckCircle2 } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import type { FileActionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DropZoneConfig {
  id: FileActionStatus;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  borderColor: string;
  hoverBg: string;
}

const DROP_ZONES: DropZoneConfig[] = [
  {
    id: "kept",
    label: "Keep Active",
    description: "Mark as important, prevent cleanup alerts",
    icon: Shield,
    color: "text-emerald-500",
    borderColor: "border-emerald-500/40",
    hoverBg: "bg-emerald-500/10",
  },
  {
    id: "compressed",
    label: "Compress 50%",
    description: "Reduce footprint with lossless encoding",
    icon: Minimize2,
    color: "text-blue-500",
    borderColor: "border-blue-500/40",
    hoverBg: "bg-blue-500/10",
  },
  {
    id: "archived",
    label: "Archive Cold",
    description: "Move to glacier storage (90% lower CO₂)",
    icon: Archive,
    color: "text-amber-500",
    borderColor: "border-amber-500/40",
    hoverBg: "bg-amber-500/10",
  },
  {
    id: "deleted",
    label: "Purge & Delete",
    description: "Permanent space & carbon recovery",
    icon: Trash2,
    color: "text-rose-500",
    borderColor: "border-rose-500/40",
    hoverBg: "bg-rose-500/10",
  },
];

export function DropZones({
  selectedFileIds = [],
  onActionComplete,
}: {
  selectedFileIds?: string[];
  onActionComplete?: () => void;
}) {
  const { setFileStatus, batchSetFileStatus } = useDataStore();
  const [activeZone, setActiveZone] = useState<FileActionStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, zoneId: FileActionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setActiveZone(zoneId);
  };

  const handleDragLeave = () => {
    setActiveZone(null);
  };

  const handleDrop = (e: React.DragEvent, zoneId: FileActionStatus) => {
    e.preventDefault();
    setActiveZone(null);

    const droppedFileId = e.dataTransfer.getData("text/plain");

    if (selectedFileIds.length > 0 && (selectedFileIds.includes(droppedFileId) || !droppedFileId)) {
      // Batch drop
      batchSetFileStatus(selectedFileIds, zoneId);
    } else if (droppedFileId) {
      // Single file drop
      setFileStatus(droppedFileId, zoneId);
    }
    onActionComplete?.();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs font-sans">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Action Drop Targets
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Drag individual files or multi-selected rows onto a drop zone below
          </p>
        </div>
        {selectedFileIds.length > 0 && (
          <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
            {selectedFileIds.length} items selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DROP_ZONES.map((zone) => {
          const Icon = zone.icon;
          const isHovered = activeZone === zone.id;

          return (
            <div
              key={zone.id}
              onDragOver={(e) => handleDragOver(e, zone.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 min-h-28 select-none",
                zone.borderColor,
                isHovered
                  ? cn(zone.hoverBg, "scale-105 shadow-md border-solid")
                  : "bg-muted/10 hover:bg-muted/30"
              )}
            >
              <div className={cn("grid size-9 place-items-center rounded-full mb-1.5", zone.hoverBg, zone.color)}>
                <Icon className="size-4" />
              </div>
              <span className="text-xs font-bold text-foreground">{zone.label}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                {zone.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
