import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import type { DeviceItem } from "@/lib/types";

export function ChecklistAuditDialog({
  device,
  open,
  onOpenChange,
}: {
  device: DeviceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toggleChecklistAnswer = useDataStore((s) => s.toggleChecklistAnswer);
  const settings = useSettingsStore((s) => s.settings);

  if (!device) return null;

  const checklist = settings.devices.checklistItems;
  const answers = device.checklistAnswers || {};

  const completedCount = Object.values(answers).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">WEEE & Maintenance Audit</DialogTitle>
              <DialogDescription className="text-xs">
                Checklist compliance for <strong className="text-foreground">{device.name}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3 text-xs">
          {/* Progress Header */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground">Compliance Score: {progressPercent}%</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {completedCount} of {checklist.length} audit items verified
              </p>
            </div>
            <div className="size-10 grid place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
              {progressPercent}%
            </div>
          </div>

          {/* Checklist items list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {checklist.map((item) => {
              const isChecked = Boolean(answers[item.id]);
              return (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(c) => toggleChecklistAnswer(device.id, item.id, Boolean(c))}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-foreground block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      {item.category.replace("_", " ")}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button size="sm" onClick={() => onOpenChange(false)} className="w-full font-bold">
            Done Audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
