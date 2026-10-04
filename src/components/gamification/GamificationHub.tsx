import {
  Trophy,
  Flame,
  Award,
  Plus,
  CheckCircle2,
  Sparkles,
  Zap,
  HardDrive,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { GoalBuilderModal } from "./GoalBuilderModal";
import { BadgesModal } from "./BadgesModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { cn } from "@/lib/utils";

export function GamificationHub() {
  const { goals, badges, leaderboard, xp, streakDays, completeGoal } = useDataStore();
  const { setGoalBuilderOpen, setBadgesModalOpen, setLeaderboardModalOpen } = useUIStore();

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  // Level computation: 0-500 Bronze, 501-1500 Silver, 1501-3000 Gold, 3001+ Platinum
  const getTier = (pts: number) => {
    if (pts >= 3000) return { name: "Platinum Vanguard", level: 4, min: 3000, max: 5000, color: "text-purple-500" };
    if (pts >= 1500) return { name: "Gold Optimizer", level: 3, min: 1500, max: 3000, color: "text-amber-500" };
    if (pts >= 500) return { name: "Silver Practitioner", level: 2, min: 500, max: 1500, color: "text-slate-400" };
    return { name: "Bronze Eco Starter", level: 1, min: 0, max: 500, color: "text-amber-700" };
  };

  const currentTier = getTier(xp);
  const tierProgress = Math.min(
    100,
    Math.round(((xp - currentTier.min) / (currentTier.max - currentTier.min)) * 100)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="size-4" />
            </span>
            <h1 className="text-xl font-extrabold text-foreground">
              Sustainability Goals, XP & Accolades
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete high-impact digital cleanup quests, earn badges, and climb the eco leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeaderboardModalOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs text-xs"
          >
            <Trophy className="size-3.5 text-amber-500" /> Leaderboard
          </Button>
          <Button
            size="sm"
            onClick={() => setGoalBuilderOpen(true)}
            className="h-9 gap-1.5 font-bold shadow-xs text-xs"
          >
            <Plus className="size-3.5" /> Start Goal
          </Button>
        </div>
      </div>

      {/* XP Level Progress Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-sm font-extrabold text-lg">
              L{currentTier.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">{currentTier.name}</h3>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                  <Flame className="size-3 fill-amber-500" /> {streakDays}-Day Streak
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {xp} Total XP · {currentTier.max - xp} XP to Next Tier
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-muted-foreground">Level Progress</span>
            <div className="text-lg font-extrabold text-foreground font-mono">{tierProgress}%</div>
          </div>
        </div>

        <div className="space-y-1">
          <Progress value={tierProgress} className="h-2.5 w-full bg-muted" />
        </div>
      </div>

      {/* Active Goals Grid */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Active Challenges & Goals ({activeGoals.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-bold text-primary"
            onClick={() => setGoalBuilderOpen(true)}
          >
            <Plus className="mr-1 size-3.5" /> Add Challenge
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGoals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 text-xs space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-foreground text-sm">{goal.title}</h4>
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                      +{goal.xpReward} XP
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-muted-foreground">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-bold text-foreground">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-2 w-full" />
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                  <span>Due: {goal.deadline}</span>
                  {percent >= 100 ? (
                    <Button
                      size="sm"
                      className="h-6 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => completeGoal(goal.id)}
                    >
                      Claim XP 🎉
                    </Button>
                  ) : (
                    <span className="font-semibold text-primary">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Overview Grid */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Badges & Achievements</h3>
            <span className="text-xs text-muted-foreground">
              {unlockedBadges.length} of {badges.length} unlocked
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold"
            onClick={() => setBadgesModalOpen(true)}
          >
            <Award className="mr-1.5 size-3.5" /> View All Badges
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              onClick={() => setBadgesModalOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-3 text-center cursor-pointer transition-all hover:scale-105",
                b.unlocked
                  ? "border-amber-400/40 bg-amber-400/5 shadow-2xs"
                  : "border-border/60 bg-muted/10 opacity-50"
              )}
            >
              <span className="text-2xl mb-1">{b.unlocked ? "🎖️" : "🔒"}</span>
              <span className="text-[11px] font-bold text-foreground truncate max-w-full block">
                {b.title}
              </span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground">
                {b.tier}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <GoalBuilderModal />
      <BadgesModal />
      <LeaderboardModal />
    </div>
  );
}
