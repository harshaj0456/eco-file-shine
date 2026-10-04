import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge as BadgePill } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Sparkles, Lock, Check } from "lucide-react";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils";

export function BadgesModal() {
  const { isBadgesModalOpen, setBadgesModalOpen } = useUIStore();
  const badges = useDataStore((s) => s.badges);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const tierColors = {
    bronze: "border-amber-700/30 bg-amber-700/10 text-amber-700 dark:text-amber-400",
    silver: "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    gold: "border-amber-400/40 bg-amber-400/10 text-amber-500",
    platinum: "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  };

  return (
    <Dialog open={isBadgesModalOpen} onOpenChange={setBadgesModalOpen}>
      <DialogContent className="max-w-lg font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Sustainability Badges & Accolades</DialogTitle>
              <DialogDescription className="text-xs">
                {unlockedCount} of {badges.length} badges unlocked
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col justify-between rounded-xl border p-3 text-xs transition-all",
                badge.unlocked
                  ? cn(tierColors[badge.tier], "shadow-2xs")
                  : "border-border/60 bg-muted/20 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-background text-base shadow-2xs">
                    {badge.unlocked ? "🎖️" : "🔒"}
                  </span>
                  <div>
                    <h5 className="font-bold text-foreground">{badge.title}</h5>
                    <span className="text-[10px] uppercase font-semibold opacity-70">
                      {badge.tier} tier
                    </span>
                  </div>
                </div>

                {badge.unlocked && (
                  <span className="rounded-full bg-emerald-500/20 p-0.5 text-emerald-500">
                    <Check className="size-3" />
                  </span>
                )}
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {badge.description}
              </p>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                {badge.unlocked ? (
                  <span className="text-emerald-500 font-semibold">
                    Unlocked on {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : "Recent"}
                  </span>
                ) : (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-bold font-mono">{badge.progressPercent}%</span>
                    </div>
                    <Progress value={badge.progressPercent} className="h-1" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
