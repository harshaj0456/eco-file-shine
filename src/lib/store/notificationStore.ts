import { create } from "zustand";
import type { AppNotification, NotificationModule, NotificationPriority } from "../types";
import { toast } from "sonner";

interface NotificationHistoryEntry {
  id: string;
  timestamp: string;
  trigger: string;
  message: string;
  channel: string;
  status: "delivered" | "snoozed" | "dismissed" | "actioned";
}

interface NotificationState {
  notifications: AppNotification[];
  history: NotificationHistoryEntry[];
  recentlyDismissed: AppNotification | null;
  moduleFilter: NotificationModule | "all";
  priorityFilter: NotificationPriority | "all";
  searchQuery: string;
  isCenterOpen: boolean;

  // Actions
  setCenterOpen: (open: boolean) => void;
  setModuleFilter: (filter: NotificationModule | "all") => void;
  setPriorityFilter: (filter: NotificationPriority | "all") => void;
  setSearchQuery: (query: string) => void;
  
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read" | "dismissed">) => AppNotification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  undoDismiss: () => void;
  clearAll: () => void;
  snoozeNotification: (id: string, minutes: number) => void;
  logHistory: (entry: Omit<NotificationHistoryEntry, "id" | "timestamp">) => void;
}

const NOTIFICATIONS_STORAGE_KEY = "greenpulse_notifications_v2";
const NOTIF_HISTORY_STORAGE_KEY = "greenpulse_notif_history_v2";

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Welcome to GreenPulse",
    message: "Your Digital Carbon & Storage Optimizer is ready. Check your Score & start with Data Diet!",
    module: "system",
    priority: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    dismissed: false,
    channel: "in_app",
  },
  {
    id: "notif-2",
    title: "Ultra-Green Compute Window",
    message: "Low carbon intensity (170 g/kWh) predicted between 13:00 - 15:00 today. Ideal time for heavy rendering!",
    module: "greenQueue",
    priority: "suggestion",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    dismissed: false,
    channel: "in_app",
    deepLinkTarget: { tab: "greenQueue" },
    inlineActions: [{ label: "Schedule Job", actionKey: "schedule_cleanest" }],
  },
  {
    id: "notif-3",
    title: "436 Duplicates Detected",
    message: "Data Diet scan found 12.0 GB of duplicate media. Cleaning them can save ~0.9 kg CO₂/yr.",
    module: "dataDiet",
    priority: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    dismissed: false,
    channel: "in_app",
    deepLinkTarget: { tab: "dataDiet" },
    inlineActions: [{ label: "Review Now", actionKey: "archive_file" }],
  },
];

function loadSavedNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return INITIAL_NOTIFICATIONS;
}

function loadSavedHistory(): NotificationHistoryEntry[] {
  try {
    const data = localStorage.getItem(NOTIF_HISTORY_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [
    {
      id: "hist-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      trigger: "Onboarding",
      message: "Welcome to GreenPulse initialized",
      channel: "in_app",
      status: "delivered",
    },
    {
      id: "hist-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      trigger: "Greener window starting",
      message: "Low carbon window 13:00-15:00",
      channel: "in_app",
      status: "delivered",
    },
  ];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadSavedNotifications(),
  history: loadSavedHistory(),
  recentlyDismissed: null,
  moduleFilter: "all",
  priorityFilter: "all",
  searchQuery: "",
  isCenterOpen: false,

  setCenterOpen: (open) => set({ isCenterOpen: open }),
  setModuleFilter: (filter) => set({ moduleFilter: filter }),
  setPriorityFilter: (filter) => set({ priorityFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addNotification: (item) => {
    const notif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false,
    };

    set((state) => {
      const next = [notif, ...state.notifications].slice(0, 100);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      return { notifications: next };
    });

    get().logHistory({
      trigger: item.title,
      message: item.message,
      channel: item.channel,
      status: "delivered",
    });

    return notif;
  },

  markAsRead: (id) => {
    set((state) => {
      const next = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      return { notifications: next };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const next = state.notifications.map((n) => ({ ...n, read: true }));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      toast.success("All notifications marked as read");
      return { notifications: next };
    });
  },

  dismissNotification: (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target) return;

    set((state) => {
      const next = state.notifications.filter((n) => n.id !== id);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      return { notifications: next, recentlyDismissed: target };
    });

    toast("Notification dismissed", {
      action: {
        label: "Undo",
        onClick: () => get().undoDismiss(),
      },
      duration: 6000,
    });
  },

  undoDismiss: () => {
    const dismissed = get().recentlyDismissed;
    if (!dismissed) return;

    set((state) => {
      const next = [dismissed, ...state.notifications];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      return { notifications: next, recentlyDismissed: null };
    });
    toast.success("Notification restored");
  },

  clearAll: () => {
    set({ notifications: [] });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    toast.success("All notifications cleared");
  },

  snoozeNotification: (id, minutes) => {
    get().dismissNotification(id);
    toast.info(`Snoozed for ${minutes} minutes`);
    setTimeout(() => {
      const dismissed = get().recentlyDismissed;
      if (dismissed && dismissed.id === id) {
        get().addNotification({
          ...dismissed,
          title: `[Snoozed] ${dismissed.title}`,
        });
      }
    }, minutes * 60 * 1000);
  },

  logHistory: (entry) => {
    const logItem: NotificationHistoryEntry = {
      ...entry,
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const next = [logItem, ...state.history].slice(0, 200);
      localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return { history: next };
    });
  },
}));
