import { Trophy, Plus, Flame, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";

export function GoalsWidget() {
  const { goals, xp, streakDays, completeGoal } = useDataStore();
  const { setActiveTab, setGoalBuilderOpen } = useUIStore();

  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Trophy className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Active Goals & Streaks</h3>
            <span className="text-[11px] text-muted-foreground">
              {streakDays} Day Activity Streak 🔥 · {xp} Total XP
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-bold gap-1"
          onClick={() => setGoalBuilderOpen(true)}
        >
          <Plus className="size-3" /> New Goal
        </Button>
      </div>

      {/* Goals Progress Stack */}
      <div className="my-3 space-y-3">
        {activeGoals.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">All goals completed! Create a new one to earn XP.</p>
        ) : (
          activeGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <div key={goal.id} className="rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{goal.title}</span>
                  <span className="font-mono text-muted-foreground font-semibold shrink-0">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={percent} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-bold text-primary shrink-0">{percent}%</span>
                  {percent >= 100 && (
                    <Button
                      size="sm"
                      className="h-5 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => completeGoal(goal.id)}
                    >
                      Claim XP
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Level: <strong className="text-foreground">Gold Tier (Level 4)</strong></span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-primary hover:bg-primary/10"
          onClick={() => setActiveTab("gamification")}
        >
          Leaderboard <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  );
}
