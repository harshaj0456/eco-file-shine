import { HardDrive, ArrowRight, Sparkles, Filter, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { formatStorageValue } from "@/lib/services/CarbonCalculator";

export function DataDietWidget() {
  const files = useDataStore((s) => s.files);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const settings = useSettingsStore((s) => s.settings);

  const activeFiles = files.filter((f) => f.status === "active");
  const cleanedFiles = files.filter((f) => f.status !== "active");

  const totalActiveGb = activeFiles.reduce((sum, f) => sum + f.sizeGB, 0);
  const totalCleanedGb = cleanedFiles.reduce((sum, f) => sum + f.sizeGB, 0);

  // Group by categories
  const categories = settings.dataDiet.categories;
  const categoryBreakdown = categories.map((cat) => {
    const catFiles = activeFiles.filter((f) => f.category === cat.name);
    const size = catFiles.reduce((sum, f) => sum + f.sizeGB, 0);
    return {
      name: cat.name,
      color: cat.color,
      size,
      percent: totalActiveGb > 0 ? (size / totalActiveGb) * 100 : 0,
    };
  });

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
            <HardDrive className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Data Diet Storage</h3>
            <span className="text-[11px] text-muted-foreground">
              {formatStorageValue(totalActiveGb, settings.units.storage)} tracked · {activeFiles.length} items
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-bold"
          onClick={() => setActiveTab("dataDiet")}
        >
          Manage <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>

      {/* Multi-color storage bar */}
      <div className="my-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-foreground">Category Breakdown</span>
          <span className="font-bold text-emerald-500">
            +{formatStorageValue(totalCleanedGb, settings.units.storage)} cleaned
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted gap-0.5">
          {categoryBreakdown.map((cat) =>
            cat.percent > 0 ? (
              <div
                key={cat.name}
                style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                title={`${cat.name}: ${cat.size.toFixed(1)} GB (${Math.round(cat.percent)}%)`}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Category legends grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {categoryBreakdown.slice(0, 6).map((c) => (
          <div key={c.name} className="flex items-center gap-1.5 truncate">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="truncate text-muted-foreground">{c.name}:</span>
            <span className="font-bold text-foreground text-[11px]">{c.size.toFixed(1)}G</span>
          </div>
        ))}
      </div>
    </div>
  );
}
