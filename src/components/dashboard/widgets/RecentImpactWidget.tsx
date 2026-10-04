import { Leaf, Award, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/dataStore";
import { useUIStore } from "@/lib/store/uiStore";

export function RecentImpactWidget() {
  const { badges, files, jobs } = useDataStore();
  const { setActiveTab, setBadgesModalOpen } = useUIStore();

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const cleanedFilesCount = files.filter((f) => f.status !== "active").length;

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Leaf className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Sustainability Impact</h3>
            <span className="text-[11px] text-muted-foreground">
              {cleanedFilesCount} files optimized · {unlockedBadges.length} badges unlocked
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-bold gap-1"
          onClick={() => setBadgesModalOpen(true)}
        >
          <Award className="size-3 text-amber-500" /> Badges
        </Button>
      </div>

      {/* Badges showcase */}
      <div className="my-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {unlockedBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs"
          >
            <span className="grid size-7 place-items-center rounded-full bg-amber-500/10 text-amber-500 font-bold">
              🎖️
            </span>
            <div>
              <div className="font-bold text-foreground text-[11px]">{badge.title}</div>
              <div className="text-[9px] text-muted-foreground">{badge.tier.toUpperCase()} TIER</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Cumulative Decarbonization: <strong className="text-emerald-500">22.4 kg CO₂e</strong></span>
        <button onClick={() => setActiveTab("gamification")} className="text-xs font-bold text-primary hover:underline">
          View XP & Streaks →
        </button>
      </div>
    </div>
  );
}
