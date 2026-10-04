import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trophy, Flame, Zap, Award, Sparkles } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils";

export function LeaderboardModal() {
  const { isLeaderboardModalOpen, setLeaderboardModalOpen } = useUIStore();
  const { leaderboard, xp, streakDays } = useDataStore();

  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <Dialog open={isLeaderboardModalOpen} onOpenChange={setLeaderboardModalOpen}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Monthly Sustainability Leaderboard</DialogTitle>
              <DialogDescription className="text-xs">
                Compare score and carbon savings with eco peers & teammates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 space-y-2 max-h-80 overflow-y-auto pr-1">
          {leaderboard.map((user, idx) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-xs transition-all",
                user.isCurrentUser
                  ? "border-primary bg-primary-soft/40 shadow-xs"
                  : "border-border bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-extrabold w-5 text-center">
                  {idx < 3 ? rankIcons[idx] : `#${idx + 1}`}
                </span>
                <span className="text-lg">{user.avatar}</span>
                <div>
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Flame className="size-2.5" /> {user.isCurrentUser ? streakDays : user.streakDays}d
                    </span>
                    <span>·</span>
                    <span>-{user.co2SavedKg} kg CO₂</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-foreground font-mono">
                  {user.isCurrentUser ? xp : user.xp} <span className="text-[10px] font-normal text-muted-foreground">XP</span>
                </span>
                <div className="text-[10px] text-emerald-500 font-bold">
                  Score: {user.score}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
