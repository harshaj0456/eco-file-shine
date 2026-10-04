import { LayoutDashboard, HardDrive, Zap, Laptop, Trophy } from "lucide-react";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import { useProfile, modeLabels } from "@/lib/profile";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn } from "@/lib/utils";

interface BottomTabItem {
  id: NavTab;
  label: string;
  shortLabel?: string;
  icon: typeof LayoutDashboard;
}

export function BottomNav() {
  const { activeTab, setActiveTab } = useUIStore();
  const { data: profile } = useProfile();
  const settings = useSettingsStore((s) => s.settings);

  const currentMode = profile?.usage_mode || settings.general.usageMode || "personal";
  const labels = modeLabels(currentMode);

  const TABS: BottomTabItem[] = [
    {
      id: "home",
      label: "Dashboard",
      shortLabel: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "dataDiet",
      label: "Data Diet",
      shortLabel: "Storage",
      icon: HardDrive,
    },
    {
      id: "greenQueue",
      label: labels.jobs,
      shortLabel: currentMode === "organization" ? "Compute" : "Jobs",
      icon: Zap,
    },
    {
      id: "devices",
      label: labels.devices,
      shortLabel: currentMode === "organization" ? "Assets" : "Devices",
      icon: Laptop,
    },
    {
      id: "gamification",
      label: "Goals & XP",
      shortLabel: "Goals",
      icon: Trophy,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-card/95 px-1 pb-safe backdrop-blur-md transition-colors md:hidden shadow-lg select-none"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary animate-in fade-in zoom-in-75 duration-200" />
            )}

            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary scale-105 shadow-xs"
                  : "hover:bg-muted/50"
              )}
            >
              <Icon className="size-5 transition-transform" />
            </div>

            <span
              className={cn(
                "mt-0.5 text-[11px] leading-tight transition-all",
                isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"
              )}
            >
              {tab.shortLabel || tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
