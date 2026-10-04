import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  HardDrive,
  Zap,
  Laptop,
  Trophy,
  User,
  Settings,
  Bell,
  Sparkles,
  Search,
  Plus,
  Moon,
  Sun,
  Play,
  RotateCcw,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { toast } from "sonner";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setAssistantOpen,
    setShortcutsHelpOpen,
    startTour,
    setAddJobModalOpen,
    setAddDeviceModalOpen,
    setGoalBuilderOpen,
    setBadgesModalOpen,
    setLeaderboardModalOpen,
  } = useUIStore();

  const setCenterOpen = useNotificationStore((s) => s.setCenterOpen);
  const { settings, patchSettings } = useSettingsStore();
  const navigate = useNavigate();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setCommandPaletteOpen(!isCommandPaletteOpen);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsHelpOpen(true);
      } else if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey && !isCommandPaletteOpen) {
        e.preventDefault();
        navigate({ to: "/settings" });
      } else if (e.key.toLowerCase() === "d" && !e.ctrlKey && !e.metaKey && !isCommandPaletteOpen) {
        e.preventDefault();
        setActiveTab("dataDiet");
      } else if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey && !isCommandPaletteOpen) {
        e.preventDefault();
        setActiveTab("greenQueue");
      } else if (e.key.toLowerCase() === "e" && !e.ctrlKey && !e.metaKey && !isCommandPaletteOpen) {
        e.preventDefault();
        setActiveTab("devices");
      } else if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey && !isCommandPaletteOpen) {
        e.preventDefault();
        setActiveTab("home");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, navigate, setActiveTab, setCommandPaletteOpen, setShortcutsHelpOpen]);

  const run = (action: () => void) => {
    setCommandPaletteOpen(false);
    action();
  };

  const toggleTheme = () => {
    const nextTheme = settings.appearance.theme === "dark" ? "light" : "dark";
    patchSettings({ appearance: { ...settings.appearance, theme: nextTheme } });
    toast.success(`Theme switched to ${nextTheme}`);
  };

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search everywhere…" />
      <CommandList className="max-h-96">
        <CommandEmpty>No matching results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => setActiveTab("home"))}>
            <HardDrive className="mr-2 size-4 text-emerald-500" />
            <span>Go to Home Dashboard</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">H</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setActiveTab("dataDiet"))}>
            <Search className="mr-2 size-4 text-blue-500" />
            <span>Go to Data Diet (Storage Optimizer)</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">D</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setActiveTab("greenQueue"))}>
            <Zap className="mr-2 size-4 text-amber-500" />
            <span>Go to GreenQueue (Carbon Scheduler)</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">G</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setActiveTab("devices"))}>
            <Laptop className="mr-2 size-4 text-purple-500" />
            <span>Go to E-Waste Passport (Hardware Life)</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">E</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setActiveTab("gamification"))}>
            <Trophy className="mr-2 size-4 text-amber-400" />
            <span>Go to Goals & Leaderboard</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setActiveTab("profile"))}>
            <User className="mr-2 size-4 text-cyan-500" />
            <span>Go to Profile & Impact Card</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/settings" }))}>
            <Settings className="mr-2 size-4 text-muted-foreground" />
            <span>Open All Settings</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">S</kbd>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/report" }))}>
            <FileText className="mr-2 size-4 text-emerald-600" />
            <span>Open Printable Impact Report</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => run(() => setAddJobModalOpen(true))}>
            <Plus className="mr-2 size-4 text-amber-500" />
            <span>Queue New Compute Workload</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setAddDeviceModalOpen(true))}>
            <Plus className="mr-2 size-4 text-purple-500" />
            <span>Register New Hardware Asset</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setGoalBuilderOpen(true))}>
            <Plus className="mr-2 size-4 text-emerald-500" />
            <span>Create New Sustainability Goal</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setAssistantOpen(true))}>
            <Sparkles className="mr-2 size-4 text-primary" />
            <span>Open Green Assistant (AI Advisor)</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setCenterOpen(true))}>
            <Bell className="mr-2 size-4 text-blue-500" />
            <span>Open Notification Center</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* System & Help */}
        <CommandGroup heading="System & Help">
          <CommandItem onSelect={() => run(toggleTheme)}>
            {settings.appearance.theme === "dark" ? (
              <Sun className="mr-2 size-4 text-amber-400" />
            ) : (
              <Moon className="mr-2 size-4 text-slate-700" />
            )}
            <span>Toggle Dark / Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => run(startTour)}>
            <Play className="mr-2 size-4 text-primary" />
            <span>Start Interactive Guided Product Tour</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setShortcutsHelpOpen(true))}>
            <HelpCircle className="mr-2 size-4 text-muted-foreground" />
            <span>View Keyboard Shortcuts Overlay</span>
            <kbd className="ml-auto text-[10px] text-muted-foreground">?</kbd>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
