import { Droplets, Factory, Info, Leaf, Plug, Gauge, Cpu, Recycle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import {
  computeSustainabilityMetrics,
  HOSTING_NOTE,
  type MetricId,
  type MetricRating,
} from "@/lib/services/SustainabilityMetrics";
import { cn } from "@/lib/utils";

const ICONS: Record<MetricId, typeof Gauge> = {
  pue: Plug,
  cue: Factory,
  wue: Droplets,
  ref: Leaf,
  sci: Cpu,
  energyPerGb: Gauge,
  embodied: Recycle,
};

const RATING_STYLE: Record<MetricRating, string> = {
  excellent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  good: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  poor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function SustainabilityMetricsWidget() {
  const { files, devices } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const metrics = computeSustainabilityMetrics(settings, files, devices);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Gauge className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Sustainability Metrics</h3>
          <span className="text-[11px] text-muted-foreground">PUE · CUE · WUE · REF · SCI and more</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = ICONS[m.id];
          return (
            <div key={m.id} className="flex flex-col justify-between rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-foreground">
                  <Icon className="size-3.5 text-primary" />
                  {m.short}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground"
                      aria-label={`About ${m.short}`}
                    >
                      <Info className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 space-y-1.5 text-xs">
                    <div className="font-bold text-foreground">{m.name}</div>
                    <p className="text-muted-foreground">{m.meaning}</p>
                    <p>
                      <span className="font-bold">Formula: </span>
                      <span className="text-muted-foreground">{m.formula}</span>
                    </p>
                    <p>
                      <span className="font-bold">Benchmark: </span>
                      <span className="text-muted-foreground">{m.benchmark}</span>
                    </p>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-1">
                <span className="text-xl font-extrabold text-foreground">{m.display}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">{m.unit}</span>
              </div>

              <span
                className={cn(
                  "mt-1.5 w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize",
                  RATING_STYLE[m.rating]
                )}
              >
                {m.rating}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">{HOSTING_NOTE}</p>
    </div>
  );
}
