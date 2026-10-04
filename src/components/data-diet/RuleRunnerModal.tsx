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
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import { formatStorageValue, formatCarbonValue } from "@/lib/services/CarbonCalculator";
import { toast } from "sonner";

export function RuleRunnerModal() {
  const { isRuleRunnerOpen, setRuleRunnerOpen } = useUIStore();
  const { files, runDietRules } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);

  const [executing, setExecuting] = useState(false);

  // Compute matched files simulation
  const rules = settings.dataDiet.rules.filter((r) => r.enabled);
  const protectedFolders = settings.dataDiet.protectedFolders;

  const matched = files
    .filter((f) => f.status === "active")
    .map((file) => {
      const isProtected = protectedFolders.some(
        (p) => file.folder === p || file.folder.startsWith(`${p}/`)
      );
      if (isProtected) return null;

      for (const rule of rules) {
        if (rule.category !== "Any" && rule.category !== file.category) continue;

        let matches = false;
        if (rule.conditionType === "age_months" && file.ageMonths >= rule.thresholdValue) matches = true;
        if (rule.conditionType === "size_mb" && file.sizeGB * 1024 >= rule.thresholdValue) matches = true;
        if (
          rule.conditionType === "rarely_accessed" &&
          file.accessCount <= rule.thresholdValue &&
          file.lastAccessedDaysAgo >= (rule.thresholdDays || 30)
        )
          matches = true;

        if (matches) {
          return { file, rule };
        }
      }
      return null;
    })
    .filter(Boolean) as { file: (typeof files)[0]; rule: (typeof rules)[0] }[];

  const totalMatchedGb = matched.reduce((sum, m) => sum + m.file.sizeGB, 0);

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      const { affectedCount, savedGb } = runDietRules(rules, protectedFolders);
      setExecuting(false);
      setRuleRunnerOpen(false);
      toast.success(`Rule engine processed ${affectedCount} files!`, {
        description: `Recovered ${formatStorageValue(savedGb, settings.units.storage)} and updated carbon index.`,
      });
    }, 400);
  };

  return (
    <Dialog open={isRuleRunnerOpen} onOpenChange={setRuleRunnerOpen}>
      <DialogContent className="max-w-lg font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Play className="size-4 fill-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Execute Data Diet Rules</DialogTitle>
              <DialogDescription className="text-xs">
                Scan all tracked files against your {rules.length} custom active rules
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3 text-xs">
          {/* Summary Box */}
          <div className="rounded-lg border border-primary/30 bg-primary-soft/30 p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground">{matched.length} files matched</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Eligible for automated Archive / Compress / Purge
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-primary">
                {formatStorageValue(totalMatchedGb, settings.units.storage)}
              </span>
              <div className="text-[10px] text-muted-foreground">Space to be freed</div>
            </div>
          </div>

          {/* Matched Preview List */}
          <div className="rounded-lg border border-border bg-muted/20 p-2 max-h-48 overflow-y-auto space-y-1.5 divide-y divide-border/40">
            {matched.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No active files match the current rule conditions. Everything is compliant!
              </p>
            ) : (
              matched.map(({ file, rule }) => (
                <div key={file.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-bold text-foreground truncate block">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {file.category} · {file.ageMonths}m old · {file.sizeGB.toFixed(1)} GB
                    </span>
                  </div>
                  <span className="rounded bg-muted px-2 py-0.5 font-bold uppercase text-[10px] text-primary shrink-0">
                    {rule.action}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => setRuleRunnerOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={matched.length === 0 || executing}
            className="font-bold gap-1"
          >
            <CheckCircle2 className="size-3.5" />
            {executing ? "Processing…" : `Apply Rules (${matched.length} Files)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
