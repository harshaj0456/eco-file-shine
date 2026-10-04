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
import { Trophy, Plus, Sparkles, Flame, Check } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { toast } from "sonner";

const CHALLENGE_TEMPLATES = [
  {
    title: "Zero Duplicates Week",
    description: "Scan and purge all duplicate camera and video files",
    module: "dataDiet" as const,
    targetValue: 1,
    unit: "challenge",
    xpReward: 120,
    deadlineDays: 7,
  },
  {
    title: "Night-Owl Compute Challenge",
    description: "Shift 5 heavy batch workloads to 01:00–05:00 green grid hours",
    module: "greenQueue" as const,
    targetValue: 5,
    unit: "jobs",
    xpReward: 250,
    deadlineDays: 14,
  },
  {
    title: "E-Waste Compliance Audit",
    description: "Complete maintenance audit and clean fans for 3 devices",
    module: "devices" as const,
    targetValue: 3,
    unit: "devices",
    xpReward: 180,
    deadlineDays: 10,
  },
  {
    title: "Clean Inbox & 10 GB Storage Reset",
    description: "Archive cold files to reduce active storage by 10 GB",
    module: "dataDiet" as const,
    targetValue: 10,
    unit: "GB",
    xpReward: 200,
    deadlineDays: 30,
  },
];

export function GoalBuilderModal() {
  const { isGoalBuilderOpen, setGoalBuilderOpen } = useUIStore();
  const addGoal = useDataStore((s) => s.addGoal);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<"dataDiet" | "greenQueue" | "devices" | "general">("dataDiet");
  const [targetValue, setTargetValue] = useState(10);
  const [unit, setUnit] = useState("GB");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split("T")[0]!
  );
  const [xpReward, setXpReward] = useState(150);

  const handleApplyTemplate = (template: (typeof CHALLENGE_TEMPLATES)[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setModule(template.module);
    setTargetValue(template.targetValue);
    setUnit(template.unit);
    setXpReward(template.xpReward);
    setDeadline(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * template.deadlineDays).toISOString().split("T")[0]!
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please provide a goal title");
      return;
    }

    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      module,
      targetValue,
      currentValue: 0,
      unit,
      deadline,
      xpReward,
    });

    setGoalBuilderOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={isGoalBuilderOpen} onOpenChange={setGoalBuilderOpen}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Create Goal or Join Challenge</DialogTitle>
              <DialogDescription className="text-xs">
                Earn XP, build streaks, and celebrate milestones
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-3.5 text-xs">
          {/* Challenge Templates */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Featured Challenge Templates</Label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CHALLENGE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`whitespace-nowrap rounded-md border p-2 text-left text-xs transition-colors ${
                    title === tmpl.title
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : "border-border bg-muted/40 hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="font-bold">{tmpl.title}</div>
                  <div className="text-[10px] opacity-80">+{tmpl.xpReward} XP</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="goal-title" className="text-[11px] font-bold">Goal Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Free 20 GB this month"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Target Amount</Label>
              <Input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="GB / jobs / devices"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Target Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">XP Reward</Label>
              <Input
                type="number"
                min={10}
                step={10}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => setGoalBuilderOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="font-bold gap-1">
            <Plus className="size-3.5" /> Start Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
