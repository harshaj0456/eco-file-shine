import { useState } from "react";
import {
  HardDrive,
  Folder,
  FileText,
  Archive,
  Trash2,
  Minimize2,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { formatStorageValue, formatCarbonValue } from "@/lib/services/CarbonCalculator";
import type { DigitalFile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DataDietTreemap({
  onSelectCategory,
  onSelectFile,
}: {
  onSelectCategory?: (category: string) => void;
  onSelectFile?: (file: DigitalFile) => void;
}) {
  const { files, setFileStatus } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);

  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  const activeFiles = files.filter((f) => f.status === "active");
  const totalActiveGb = activeFiles.reduce((sum, f) => sum + f.sizeGB, 0);

  // Group by category
  const categories = settings.dataDiet.categories;
  const blocks = categories
    .map((cat) => {
      const catFiles = activeFiles.filter((f) => f.category === cat.name);
      const sizeGB = catFiles.reduce((sum, f) => sum + f.sizeGB, 0);
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        sizeGB,
        count: catFiles.length,
        percent: totalActiveGb > 0 ? (sizeGB / totalActiveGb) * 100 : 0,
        files: catFiles,
      };
    })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.sizeGB - a.sizeGB);

  const categoryFiles = selectedCategory
    ? activeFiles.filter((f) => f.category === selectedCategory)
    : [];

  return (
    <div className="space-y-4 font-sans">
      {/* Category Treemap Visual Blocks */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-primary" />
              Storage Treemap & Category Distribution
            </h3>
            <p className="text-xs text-muted-foreground">
              Click any block to drill into files or drag items onto action drop zones
            </p>
          </div>

          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-bold"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back to All Categories
            </Button>
          )}
        </div>

        {/* Dynamic proportional blocks */}
        {!selectedCategory ? (
          <div className="grid grid-cols-12 gap-2.5 h-64 w-full">
            {blocks.map((block) => {
              // Calculate col-span based on percentage (min 3, max 12)
              const colSpan = Math.max(3, Math.min(12, Math.round((block.percent / 100) * 12)));
              return (
                <button
                  key={block.name}
                  onClick={() => {
                    setSelectedCategory(block.name);
                    onSelectCategory?.(block.name);
                  }}
                  onMouseEnter={() => setHoveredBlock(block.name)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  style={{
                    backgroundColor: `${block.color}18`,
                    borderColor: `${block.color}50`,
                  }}
                  className={cn(
                    "group relative col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 rounded-xl border p-3.5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col justify-between overflow-hidden",
                    hoveredBlock === block.name && "ring-2 ring-primary/60"
                  )}
                >
                  {/* Color Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: block.color }}
                  />

                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-foreground">{block.name}</span>
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        {Math.round(block.percent)}%
                      </span>
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-foreground">
                      {formatStorageValue(block.sizeGB, settings.units.storage)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span>{block.count} files</span>
                    <span className="font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Drill Down <ArrowRight className="ml-1 size-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Drilled-in Category View */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border">
              <span className="text-xs font-bold text-foreground">
                Showing {categoryFiles.length} items in category: <strong className="text-primary">{selectedCategory}</strong>
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Total: {formatStorageValue(categoryFiles.reduce((s, f) => s + f.sizeGB, 0), settings.units.storage)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {categoryFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", file.id);
                    setDraggedFileId(file.id);
                  }}
                  onDragEnd={() => setDraggedFileId(null)}
                  className="group rounded-lg border border-border bg-card p-3 shadow-2xs hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-foreground truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                      {file.sizeGB.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    📁 {file.folder} · {file.ageMonths}m old
                  </div>

                  {/* Quick Action Badges */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {formatCarbonValue(file.carbonGramsAnnual, settings.units.weight)}/yr
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-emerald-500"
                        title="Keep safe"
                        onClick={() => setFileStatus(file.id, "kept")}
                      >
                        <Shield className="size-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-blue-500"
                        title="Compress"
                        onClick={() => setFileStatus(file.id, "compressed")}
                      >
                        <Minimize2 className="size-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-amber-500"
                        title="Archive"
                        onClick={() => setFileStatus(file.id, "archived")}
                      >
                        <Archive className="size-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        title="Delete"
                        onClick={() => setFileStatus(file.id, "deleted")}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
