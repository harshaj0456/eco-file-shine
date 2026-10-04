import { useState } from "react";
import { Wrench, ShoppingBag, Leaf, Trash2, DollarSign, Clock, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { formatCurrencyValue } from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";

export function RepairVsReplaceSlider() {
  const settings = useSettingsStore((s) => s.settings);
  const [deviceType, setDeviceType] = useState<"laptop" | "phone" | "monitor">("laptop");

  // Slider value 0 to 100 (e.g. repair priority vs replace frequency)
  const [repairRatio, setRepairRatio] = useState(70);

  // Baseline device specs
  const SPECS = {
    laptop: {
      name: "High-Performance Laptop",
      newCost: 1800,
      repairCost: 120, // Battery + thermal service
      newEmbodiedCo2Kg: 290,
      repairCo2Kg: 8,
      eWasteWeightKg: 2.2,
      yearsExtended: 2.5,
    },
    phone: {
      name: "Smartphone (Flagship)",
      newCost: 900,
      repairCost: 55, // Battery replacement
      newEmbodiedCo2Kg: 75,
      repairCo2Kg: 3,
      eWasteWeightKg: 0.22,
      yearsExtended: 2.0,
    },
    monitor: {
      name: "32\" 4K Workspace Monitor",
      newCost: 650,
      repairCost: 45, // Power board capacitor repair
      newEmbodiedCo2Kg: 220,
      repairCo2Kg: 5,
      eWasteWeightKg: 8.5,
      yearsExtended: 4.0,
    },
  };

  const current = SPECS[deviceType];

  // Calculations
  const co2AvoidedKg = Math.round(current.newEmbodiedCo2Kg - current.repairCo2Kg);
  const moneySaved = current.newCost - current.repairCost;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs font-sans space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Wrench className="size-4 text-purple-500" />
            Repair vs. Replace Interactive ROI Calculator
          </h3>
          <p className="text-xs text-muted-foreground">
            Compare financial cost, e-waste avoided, and embodied manufacturing carbon footprint
          </p>
        </div>

        {/* Device selector pill buttons */}
        <div className="flex gap-1">
          {(["laptop", "phone", "monitor"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDeviceType(t)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors",
                deviceType === t
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Slider Bar */}
      <div className="space-y-1.5 bg-muted/20 p-3 rounded-lg border border-border/60">
        <div className="flex justify-between text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Wrench className="size-3.5" /> Scenario A: Repair & Extend ({repairRatio}%)
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            Scenario B: Buy New ({100 - repairRatio}%) <ShoppingBag className="size-3.5" />
          </span>
        </div>
        <Slider
          value={[repairRatio]}
          max={100}
          step={5}
          onValueChange={([v]) => setRepairRatio(v ?? 50)}
          className="my-2"
        />
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Repair */}
        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="size-3.5" /> Recommended: Repair Pathway
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              +{current.yearsExtended} Years Life
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">Total Service Cost:</span>
              <span className="font-extrabold text-foreground font-mono">
                {formatCurrencyValue(current.repairCost, settings.units.currency)}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">Carbon Generated:</span>
              <span className="font-bold text-foreground font-mono">{current.repairCo2Kg} kg CO₂e</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">E-Waste Diverted:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{current.eWasteWeightKg} kg saved
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-500/15 p-2.5 text-center text-xs">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block uppercase">Net Decarbonization ROI</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              -{co2AvoidedKg} kg CO₂e saved
            </span>
          </div>
        </div>

        {/* Right: Replace */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 opacity-90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="size-3.5" /> Premature Replacement
            </span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
              Heavy Footprint
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">New Device Cost:</span>
              <span className="font-extrabold text-foreground font-mono">
                {formatCurrencyValue(current.newCost, settings.units.currency)}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">Manufacturing Carbon:</span>
              <span className="font-bold text-rose-500 font-mono">+{current.newEmbodiedCo2Kg} kg CO₂e</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">E-Waste Generated:</span>
              <span className="font-bold text-rose-500 font-mono">+{current.eWasteWeightKg} kg</span>
            </div>
          </div>

          <div className="rounded-lg bg-rose-500/10 p-2.5 text-center text-xs">
            <span className="text-[10px] text-rose-600 font-bold block uppercase">Financial Premium</span>
            <span className="text-lg font-extrabold text-rose-500 font-mono">
              +{formatCurrencyValue(moneySaved, settings.units.currency)} higher cost
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
