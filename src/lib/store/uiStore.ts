import { create } from "zustand";

export type NavTab = "home" | "dataDiet" | "greenQueue" | "devices" | "gamification" | "profile";

export type WidgetId =
  | "score_gauge"
  | "data_diet_card"
  | "green_queue_card"
  | "devices_card"
  | "action_plan"
  | "trend_chart"
  | "goals_card"
  | "upcoming_schedule"
  | "recent_impact"
  | "green_tips";

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  enabled: boolean;
  colSpan: "full" | "half" | "third";
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "score_gauge", title: "Digital Sustainability Gauge", enabled: true, colSpan: "half" },
  { id: "action_plan", title: "Smart Priority Action Plan", enabled: true, colSpan: "half" },
  { id: "data_diet_card", title: "Data Diet Storage Pulse", enabled: true, colSpan: "third" },
  { id: "green_queue_card", title: "GreenQueue Live Grid", enabled: true, colSpan: "third" },
  { id: "devices_card", title: "E-Waste Passport Health", enabled: true, colSpan: "third" },
  { id: "trend_chart", title: "6-Month Carbon & Storage Trend", enabled: true, colSpan: "full" },
  { id: "goals_card", title: "Active Goals & Streaks", enabled: true, colSpan: "half" },
  { id: "upcoming_schedule", title: "Today's Workload Schedule", enabled: true, colSpan: "half" },
  { id: "recent_impact", title: "Recent Sustainability Impact", enabled: true, colSpan: "half" },
  { id: "green_tips", title: "Green Computing Tip of the Day", enabled: true, colSpan: "half" },
];

export const NAMED_LAYOUTS: Record<string, WidgetConfig[]> = {
  standard: DEFAULT_WIDGETS,
  student: [
    { id: "score_gauge", title: "My Eco Score", enabled: true, colSpan: "half" },
    { id: "goals_card", title: "Coursework & Challenges", enabled: true, colSpan: "half" },
    { id: "data_diet_card", title: "Files & Storage", enabled: true, colSpan: "half" },
    { id: "green_queue_card", title: "Lab Compute Scheduler", enabled: true, colSpan: "half" },
    { id: "devices_card", title: "My Laptops & Gear", enabled: true, colSpan: "full" },
    { id: "green_tips", title: "Study Green Tips", enabled: true, colSpan: "full" },
  ],
  admin: [
    { id: "score_gauge", title: "Fleet Sustainability Index", enabled: true, colSpan: "third" },
    { id: "data_diet_card", title: "Org Storage Overhead", enabled: true, colSpan: "third" },
    { id: "green_queue_card", title: "Cluster Workload Grid", enabled: true, colSpan: "third" },
    { id: "action_plan", title: "High-ROI Decarbonization Plan", enabled: true, colSpan: "half" },
    { id: "devices_card", title: "Asset Lifecycle & WEEE Compliance", enabled: true, colSpan: "half" },
    { id: "trend_chart", title: "Enterprise Carbon Trajectory", enabled: true, colSpan: "full" },
    { id: "upcoming_schedule", title: "Batch Pipeline Jobs", enabled: true, colSpan: "full" },
  ],
};

interface UIState {
  activeTab: NavTab;
  widgets: WidgetConfig[];
  isEditingDashboard: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsHelpOpen: boolean;
  isAssistantOpen: boolean;
  isTourActive: boolean;
  tourStep: number;
  isBadgesModalOpen: boolean;
  isLeaderboardModalOpen: boolean;
  isGoalBuilderOpen: boolean;
  isAddJobModalOpen: boolean;
  isAddDeviceModalOpen: boolean;
  isRuleRunnerOpen: boolean;
  isDaySimulationOpen: boolean;
  isSettingsDrawerOpen: boolean;

  // Actions
  setActiveTab: (tab: NavTab) => void;
  setWidgets: (widgets: WidgetConfig[]) => void;
  toggleWidget: (id: WidgetId) => void;
  setWidgetColSpan: (id: WidgetId, colSpan: WidgetConfig["colSpan"]) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  applyNamedLayout: (layoutName: "standard" | "student" | "admin") => void;
  setIsEditingDashboard: (editing: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsHelpOpen: (open: boolean) => void;
  setAssistantOpen: (open: boolean) => void;
  setSettingsDrawerOpen: (open: boolean) => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
  setBadgesModalOpen: (open: boolean) => void;
  setLeaderboardModalOpen: (open: boolean) => void;
  setGoalBuilderOpen: (open: boolean) => void;
  setAddJobModalOpen: (open: boolean) => void;
  setAddDeviceModalOpen: (open: boolean) => void;
  setRuleRunnerOpen: (open: boolean) => void;
  setDaySimulationOpen: (open: boolean) => void;
}

const UI_STORAGE_KEY = "greenpulse_ui_settings_v2";

function loadSavedWidgets(): WidgetConfig[] {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.widgets)) return parsed.widgets;
    }
  } catch {}
  return DEFAULT_WIDGETS;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTab: "home",
  widgets: loadSavedWidgets(),
  isEditingDashboard: false,
  isCommandPaletteOpen: false,
  isShortcutsHelpOpen: false,
  isAssistantOpen: false,
  isTourActive: false,
  tourStep: 0,
  isBadgesModalOpen: false,
  isLeaderboardModalOpen: false,
  isGoalBuilderOpen: false,
  isAddJobModalOpen: false,
  isAddDeviceModalOpen: false,
  isRuleRunnerOpen: false,
  isDaySimulationOpen: false,
  isSettingsDrawerOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSettingsDrawerOpen: (open) => set({ isSettingsDrawerOpen: open }),
  setWidgets: (widgets) => {
    set({ widgets });
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ widgets }));
  },
  toggleWidget: (id) => {
    set((s) => {
      const next = s.widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ widgets: next }));
      return { widgets: next };
    });
  },
  setWidgetColSpan: (id, colSpan) => {
    set((s) => {
      const next = s.widgets.map((w) => (w.id === id ? { ...w, colSpan } : w));
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ widgets: next }));
      return { widgets: next };
    });
  },
  reorderWidgets: (fromIndex, toIndex) => {
    set((s) => {
      const list = [...s.widgets];
      const [moved] = list.splice(fromIndex, 1);
      if (moved) list.splice(toIndex, 0, moved);
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ widgets: list }));
      return { widgets: list };
    });
  },
  applyNamedLayout: (layoutName) => {
    const layout = NAMED_LAYOUTS[layoutName] || DEFAULT_WIDGETS;
    set({ widgets: layout });
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ widgets: layout }));
  },
  setIsEditingDashboard: (editing) => set({ isEditingDashboard: editing }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShortcutsHelpOpen: (open) => set({ isShortcutsHelpOpen: open }),
  setAssistantOpen: (open) => set({ isAssistantOpen: open }),
  startTour: () => set({ isTourActive: true, tourStep: 0 }),
  nextTourStep: () => set((s) => ({ tourStep: s.tourStep + 1 })),
  prevTourStep: () => set((s) => ({ tourStep: Math.max(0, s.tourStep - 1) })),
  endTour: () => set({ isTourActive: false, tourStep: 0 }),
  setBadgesModalOpen: (open) => set({ isBadgesModalOpen: open }),
  setLeaderboardModalOpen: (open) => set({ isLeaderboardModalOpen: open }),
  setGoalBuilderOpen: (open) => set({ isGoalBuilderOpen: open }),
  setAddJobModalOpen: (open) => set({ isAddJobModalOpen: open }),
  setAddDeviceModalOpen: (open) => set({ isAddDeviceModalOpen: open }),
  setRuleRunnerOpen: (open) => set({ isRuleRunnerOpen: open }),
  setDaySimulationOpen: (open) => set({ isDaySimulationOpen: open }),
}));
