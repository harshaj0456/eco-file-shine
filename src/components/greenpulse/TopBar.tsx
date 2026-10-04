import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Command as CommandIcon,
  Leaf,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Zap,
  HardDrive,
  Laptop,
  Trophy,
  User,
  LayoutDashboard,
  Flame,
  HelpCircle,
  GraduationCap,
  Building2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { modeLabels, useProfile, useSaveProfile } from "@/lib/profile";
import { calculateCompositeScore } from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TopBar() {
  const navigate_unused = undefined;
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();

  const {
    activeTab,
    setActiveTab,
    setCommandPaletteOpen,
    setAssistantOpen,
    startTour,
    setSettingsDrawerOpen,
  } = useUIStore();
  const { notifications, setCenterOpen } = useNotificationStore();
  const { files, jobs, devices, xp, streakDays } = useDataStore();
  const { settings, patchSettings } = useSettingsStore();

  const unread = notifications.filter((n) => !n.read).length;
  const currentMode = profile?.usage_mode || settings.general.usageMode || "personal";
  const labels = modeLabels(currentMode);

  // Compute live score
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
      description: `Labels updated to ${modeLabels(mode).devices} & ${modeLabels(mode).jobs}`,
    });
  };

  const NAV_ITEMS: { id: NavTab; label: string; icon: typeof HardDrive }[] = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "dataDiet", label: "Data Diet", icon: HardDrive },
    { id: "greenQueue", label: labels.jobs, icon: Zap },
    { id: "devices", label: labels.devices, icon: Laptop },
    { id: "gamification", label: "Goals & XP", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-border bg-background/95 backdrop-blur">
      {/* Primary Header Bar */}
      <div className="flex h-14 items-center justify-between px-3 md:px-6">

        {/* Left: Brand + Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 font-extrabold text-foreground hover:opacity-90 transition-opacity"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground shadow-xs">
              <Leaf className="size-4" />
            </span>
            <span className="text-base tracking-tight hidden sm:inline">GreenPulse</span>
          </button>

          {/* Mode Selector Pill — desktop only */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full border-border/80 bg-muted/50 px-2.5 text-xs font-semibold hover:bg-muted"
                >
                  {currentMode === "organization" ? (
                    <Building2 className="size-3 text-purple-500" />
                  ) : currentMode === "student" ? (
                    <GraduationCap className="size-3 text-blue-500" />
                  ) : (
                    <User className="size-3 text-emerald-500" />
                  )}
                  <span className="capitalize">{currentMode}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 font-sans">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Select Usage Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleModeSwitch("personal")} className="text-xs font-medium">
                  <User className="mr-2 size-3.5 text-emerald-500" />
                  Personal Mode
                  {currentMode === "personal" && <Check className="ml-auto size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSwitch("student")} className="text-xs font-medium">
                  <GraduationCap className="mr-2 size-3.5 text-blue-500" />
                  Student / Campus
                  {currentMode === "student" && <Check className="ml-auto size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSwitch("organization")} className="text-xs font-medium">
                  <Building2 className="mr-2 size-3.5 text-purple-500" />
                  Organization / Team
                  {currentMode === "organization" && <Check className="ml-auto size-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Live Score Pill — large screens only */}
          <div
            onClick={() => setActiveTab("home")}
            className="cursor-pointer hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Composite Digital Carbon Score"
          >
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Score: {liveScore}/100</span>
          </div>
        </div>

        {/* Mobile Center: Active Tab Name */}
        <div className="absolute left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
          <span className="text-sm font-bold text-foreground">
            {NAV_ITEMS.find((t) => t.id === activeTab)?.label ?? "GreenPulse"}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">

          {/* XP & Streak Pill — hidden on small mobile */}
          <button
            onClick={() => setActiveTab("gamification")}
            className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold shadow-2xs hover:border-primary/50 transition-colors"
          >
            <span className="flex items-center gap-1 text-amber-500">
              <Flame className="size-3.5 fill-amber-500" />
              <span className="hidden md:inline">{streakDays}d</span>
              <span className="md:hidden">🔥</span>
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="text-primary font-mono">
              <span className="hidden md:inline">{xp} XP</span>
              <span className="md:hidden">{xp >= 1000 ? `${Math.round(xp / 1000)}k` : xp}</span>
            </span>
          </button>

          {/* Search / Command Palette — desktop only */}
          <Button
            size="sm"
            variant="outline"
            className="hidden md:flex h-8 gap-2 rounded-lg border-border px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <CommandIcon className="size-3.5" />
            <span>Search & Actions</span>
            <kbd className="rounded border bg-muted px-1 text-[10px] font-mono">⌘K</kbd>
          </Button>

          {/* Green Assistant — shown on desktop, icon only on mobile */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold px-2 md:px-2.5"
            onClick={() => setAssistantOpen(true)}
          >
            <Sparkles className="size-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Assistant</span>
          </Button>

          {/* Notifications Bell */}
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Notifications, ${unread} unread`}
            className="relative size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setCenterOpen(true)}
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-xs">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>

          {/* Theme Toggle — shown on mobile too */}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground hidden sm:flex"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            {settings.appearance.theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </Button>

          {/* Settings — mobile opens drawer, desktop navigates to /settings */}
          {/* On mobile: opens slide-out drawer */}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground md:hidden"
            title="Settings"
            onClick={() => setSettingsDrawerOpen(true)}
          >
            <Settings className="size-4" />
          </Button>

          {/* On desktop: navigate to settings page */}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground hidden md:flex"
            title="Settings"
            asChild
          >
            <Link to="/settings">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar — DESKTOP ONLY (md+), hidden on mobile (bottom nav handles it) */}
      <div className="hidden md:flex h-10 items-center overflow-x-auto px-3 md:px-6 gap-1 border-t border-border/40 bg-muted/20 no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
