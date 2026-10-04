import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Sliders,
  LayoutDashboard,
  Bell,
  Sun,
  Moon,
  Sparkles,
  HelpCircle,
  Keyboard,
  FileText,
  RotateCcw,
  Building2,
  GraduationCap,
  Flame,
  Settings as SettingsIcon,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { useProfile, useSaveProfile, modeLabels } from "@/lib/profile";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useDataStore } from "@/lib/store/dataStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { calculateCompositeScore } from "@/lib/services/CarbonCalculator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SettingsDrawer() {
  const {
    isSettingsDrawerOpen,
    setSettingsDrawerOpen,
    isEditingDashboard,
    setIsEditingDashboard,
    setActiveTab,
    setAssistantOpen,
    startTour,
    setShortcutsHelpOpen,
  } = useUIStore();

  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();
  const { settings, patchSettings } = useSettingsStore();
  const { files, jobs, devices, xp, streakDays, resetAllData } = useDataStore();
  const { notifications, setCenterOpen } = useNotificationStore();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const currentMode = profile?.usage_mode || settings.general.usageMode || "personal";
  const labels = modeLabels(currentMode);

  // Live Score Calculation
  const storageHealth = Math.min(100, Math.max(20, 100 - files.filter((f) => f.status === "active").length * 2.5));
  const computeHealth = Math.min(100, Math.max(30, 70 + jobs.filter((j) => j.status === "completed").length * 8));
  const deviceHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );
  const liveScore = calculateCompositeScore(storageHealth, computeHealth, deviceHealth, settings.scoring);

  const toggleTheme = () => {
    const nextTheme = settings.appearance.theme === "dark" ? "light" : "dark";
    patchSettings({ appearance: { ...settings.appearance, theme: nextTheme } });
  };

  const handleModeSwitch = (mode: "personal" | "student" | "organization") => {
    saveProfile.mutate({ usage_mode: mode });
    patchSettings({ general: { ...settings.general, usageMode: mode } });
    toast.success(`Switched to ${mode.toUpperCase()} mode`, {
      description: `Updated labels to ${modeLabels(mode).devices} & ${modeLabels(mode).jobs}`,
    });
  };

  const closeDrawer = () => setSettingsDrawerOpen(false);

  return (
    <Sheet open={isSettingsDrawerOpen} onOpenChange={setSettingsDrawerOpen}>
      <SheetContent
        side="right"
        className="w-[85vw] max-w-[320px] p-0 font-sans flex flex-col justify-between overflow-y-auto"
      >
        <div className="p-5 space-y-6">
          <SheetHeader className="text-left pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-extrabold flex items-center gap-2">
                <SettingsIcon className="size-4 text-primary" />
                Settings & Profile
              </SheetTitle>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary">
                App Menu
              </Badge>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Configure your preferences, theme, and profile.
            </SheetDescription>
          </SheetHeader>

          {/* User Profile Card */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary font-extrabold text-sm">
                {(profile?.display_name || "Eco Champion").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {profile?.display_name || "Eco Champion"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                    {currentMode} mode
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate">{profile?.region || "EU"}</span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Chips */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
              <div className="rounded-lg bg-background p-2 border border-border/60">
                <p className="text-[10px] text-muted-foreground">Score</p>
                <p className="text-xs font-bold text-emerald-500">{liveScore}/100</p>
              </div>
              <div className="rounded-lg bg-background p-2 border border-border/60">
                <p className="text-[10px] text-muted-foreground">Streak</p>
                <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  <Flame className="size-3 fill-amber-500" /> {streakDays}d
                </p>
              </div>
              <div className="rounded-lg bg-background p-2 border border-border/60">
                <p className="text-[10px] text-muted-foreground">XP</p>
                <p className="text-xs font-bold text-primary font-mono">{xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}</p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground px-1">Usage Mode</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "personal", label: "Personal", icon: User },
                { id: "student", label: "Student", icon: GraduationCap },
                { id: "organization", label: "Org", icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = currentMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeSwitch(m.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className="text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground px-1">Quick Actions</label>

            {/* Full Settings Page */}
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-xs font-semibold gap-2.5 h-9"
              onClick={closeDrawer}
            >
              <Link to="/settings">
                <SettingsIcon className="size-4 text-primary" />
                <span>Full Settings (8 Tabs)</span>
              </Link>
            </Button>

            {/* Profile Page */}
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-xs font-semibold gap-2.5 h-9"
              onClick={closeDrawer}
            >
              <Link to="/profile">
                <User className="size-4 text-emerald-500" />
                <span>Edit Profile</span>
              </Link>
            </Button>

            {/* Toggle Edit Dashboard */}
            <Button
              variant="ghost"
              className="w-full justify-between text-xs font-semibold h-9"
              onClick={() => {
                setActiveTab("home");
                setIsEditingDashboard(!isEditingDashboard);
                closeDrawer();
                toast.info(isEditingDashboard ? "Finished editing layout" : "Editing dashboard widgets");
              }}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="size-4 text-blue-500" />
                <span>Edit Dashboard Layout</span>
              </span>
              <Badge variant={isEditingDashboard ? "default" : "outline"} className="text-[10px]">
                {isEditingDashboard ? "Editing" : "Off"}
              </Badge>
            </Button>

            {/* Notifications Center */}
            <Button
              variant="ghost"
              className="w-full justify-between text-xs font-semibold h-9"
              onClick={() => {
                setCenterOpen(true);
                closeDrawer();
              }}
            >
              <span className="flex items-center gap-2.5">
                <Bell className="size-4 text-amber-500" />
                <span>Notifications</span>
              </span>
              {unreadNotifs > 0 && (
                <Badge className="size-5 rounded-full bg-rose-500 p-0 text-[10px] grid place-items-center">
                  {unreadNotifs}
                </Badge>
              )}
            </Button>

            {/* Green Assistant */}
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-semibold gap-2.5 h-9"
              onClick={() => {
                setAssistantOpen(true);
                closeDrawer();
              }}
            >
              <Sparkles className="size-4 text-purple-500" />
              <span>Green Assistant AI</span>
            </Button>

            {/* Interactive Tour */}
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-semibold gap-2.5 h-9"
              onClick={() => {
                startTour();
                closeDrawer();
              }}
            >
              <HelpCircle className="size-4 text-teal-500" />
              <span>Take Product Tour</span>
            </Button>

            {/* Sustainability Report */}
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-xs font-semibold gap-2.5 h-9"
              onClick={closeDrawer}
            >
              <Link to="/report">
                <FileText className="size-4 text-orange-500" />
                <span>Export Impact Report</span>
              </Link>
            </Button>
          </div>

          {/* Theme & Display */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                {settings.appearance.theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                Dark Mode
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-bold gap-1.5"
                onClick={toggleTheme}
              >
                {settings.appearance.theme === "dark" ? (
                  <>
                    <Sun className="size-3 text-amber-400" /> Light
                  </>
                ) : (
                  <>
                    <Moon className="size-3 text-slate-700" /> Dark
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-border bg-muted/20 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 h-8"
            onClick={() => {
              if (window.confirm("Reset all GreenPulse demo data back to default?")) {
                resetAllData();
                closeDrawer();
              }
            }}
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Demo Data</span>
          </Button>

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            GreenPulse v3.0 · Mobile First
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
