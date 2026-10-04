import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Sparkles, Clock, Calendar } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import {
  getHourlyCarbonIntensity,
  findCleanestSlotForJob,
  calculateJobEmission,
} from "@/lib/services/CarbonCalculator";
import { toast } from "sonner";

export function AddJobModal() {
  const { isAddJobModalOpen, setAddJobModalOpen } = useUIStore();
  const scheduleJob = useDataStore((s) => s.scheduleJob);
  const settings = useSettingsStore((s) => s.settings);

  const customJobTypes = settings.greenQueue.customJobTypes;

  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState(customJobTypes[0]?.name || "Compute Job");
  const [powerKw, setPowerKw] = useState(1.0);
  const [durationHours, setDurationHours] = useState(2);
  const [deadlineHour, setDeadlineHour] = useState(22);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const hourlyIntensities = getHourlyCarbonIntensity(settings);
  const quietHours = settings.greenQueue.quietHours;

  const handleSelectJobType = (typeName: string) => {
    const found = customJobTypes.find((t) => t.name === typeName);
    setSelectedType(typeName);
    if (found) {
      setName(found.name);
      setPowerKw(found.defaultPowerKw);
      setDurationHours(found.defaultDurationHours);
      setDeadlineHour(found.defaultDeadlineHours);
    }
  };

  const handleSchedule = () => {
    if (!name.trim()) {
      toast.error("Please provide a workload name");
      return;
    }

    const cleanest = findCleanestSlotForJob(
      { powerKw, durationHours, deadlineHour },
      hourlyIntensities,
      quietHours
    );

    const calculatedCo2 = calculateJobEmission(powerKw, durationHours, cleanest.slot, hourlyIntensities);
    const worstEmission = calculateJobEmission(powerKw, durationHours, 18, hourlyIntensities);
    const saved = Math.max(0, worstEmission - calculatedCo2);

    const pricePerKwh = settings.units.pricePerKwh;
    const cost = powerKw * durationHours * pricePerKwh;

    scheduleJob({
      name: name.trim(),
      workloadType: selectedType,
      powerKw,
      durationHours,
      deadlineHour,
      scheduledSlotHour: cleanest.slot,
      status: "scheduled",
      estimatedCo2Grams: calculatedCo2,
      co2SavedGrams: saved,
      costEstimated: cost,
      priority,
      tags: [selectedType.split(" ")[0] || "Task"],
    });

    setAddJobModalOpen(false);
    setName("");
  };

  return (
    <Dialog open={isAddJobModalOpen} onOpenChange={setAddJobModalOpen}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Queue Compute Workload</DialogTitle>
              <DialogDescription className="text-xs">
                Automatically schedule in the cleanest grid window before your deadline
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3.5 text-xs">
          {/* Preset templates */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Preset Workload Template</Label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {customJobTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectJobType(type.name)}
                  className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedType === type.name
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : "border-border bg-muted/40 hover:bg-muted text-foreground"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="job-name" className="text-[11px] font-bold">Workload Name</Label>
            <Input
              id="job-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4K Video Encoding / PyTorch Model Train"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Power Draw (kW)</Label>
              <Input
                type="number"
                min={0.05}
                max={50}
                step={0.1}
                value={powerKw}
                onChange={(e) => setPowerKw(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Duration (Hours)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                step={1}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Must Finish By (Deadline)</Label>
              <select
                value={deadlineHour}
                onChange={(e) => setDeadlineHour(Number(e.target.value))}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00 ({h <= 12 ? `${h} AM` : `${h - 12} PM`})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
              >
                <option value="low">Low (Flexible)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => setAddJobModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSchedule} className="font-bold gap-1">
            <Sparkles className="size-3.5" /> Auto-Schedule in Green Slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
