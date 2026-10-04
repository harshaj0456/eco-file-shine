import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  ShieldAlert,
  Zap,
  HardDrive,
  Laptop,
  CheckCircle2,
} from "lucide-react";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import type { AppNotification, NotificationModule, NotificationPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const {
    notifications,
    isCenterOpen,
    setCenterOpen,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    snoozeNotification,
    moduleFilter,
    setModuleFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
  } = useNotificationStore();

  const setActiveTab = useUIStore((s) => s.setActiveTab);

  // Filter notifications
  const filtered = notifications.filter((n) => {
    if (moduleFilter !== "all" && n.module !== moduleFilter) return false;
    if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group by Today vs Earlier
  const today = new Date().toDateString();
  const todayItems = filtered.filter((n) => new Date(n.timestamp).toDateString() === today);
  const earlierItems = filtered.filter((n) => new Date(n.timestamp).toDateString() !== today);

  const handleDeepLink = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.deepLinkTarget) {
      setActiveTab(notif.deepLinkTarget.tab as NavTab);
      setCenterOpen(false);
    }
  };

  const priorityIcons: Record<NotificationPriority, typeof Info> = {
    info: Info,
    suggestion: Sparkles,
    warning: AlertTriangle,
    critical: ShieldAlert,
  };

  const priorityColors: Record<NotificationPriority, string> = {
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    suggestion: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    critical: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  const moduleIcons: Record<NotificationModule, typeof HardDrive> = {
    dataDiet: HardDrive,
    greenQueue: Zap,
    devices: Laptop,
    goals: CheckCircle2,
    system: Bell,
  };

  return (
    <Sheet open={isCenterOpen} onOpenChange={setCenterOpen}>
      <SheetContent className="flex w-full flex-col font-sans sm:max-w-md">
        <SheetHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">Notifications</SheetTitle>
                <SheetDescription className="text-xs">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="mr-1 size-3.5" />
                Read all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="mr-1 size-3.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications…"
              className="h-8 pl-8 text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {(["all", "dataDiet", "greenQueue", "devices", "goals"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  moduleFilter === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {m === "all" ? "All Modules" : m === "dataDiet" ? "Data Diet" : m === "greenQueue" ? "GreenQueue" : m === "devices" ? "Devices" : "Goals"}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {filtered.length === 0 ? (
            <div className="grid h-64 place-items-center text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                  <Bell className="size-6 opacity-40" />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">No notifications found</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {searchQuery ? "Try refining your search terms" : "All clean! We'll notify you on key eco milestones."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {todayItems.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Today
                  </div>
                  {todayItems.map((n) => (
                    <NotificationCard
                      key={n.id}
                      item={n}
                      onDeepLink={handleDeepLink}
                      onDismiss={dismissNotification}
                      onSnooze={snoozeNotification}
                      priorityColors={priorityColors}
                      priorityIcons={priorityIcons}
                      moduleIcons={moduleIcons}
                    />
                  ))}
                </div>
              )}

              {earlierItems.length > 0 && (
                <div className="space-y-2">
                  <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Earlier
                  </div>
                  {earlierItems.map((n) => (
                    <NotificationCard
                      key={n.id}
                      item={n}
                      onDeepLink={handleDeepLink}
                      onDismiss={dismissNotification}
                      onSnooze={snoozeNotification}
                      priorityColors={priorityColors}
                      priorityIcons={priorityIcons}
                      moduleIcons={moduleIcons}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="border-t border-border pt-2 text-center text-[10px] text-muted-foreground">
          Mode: <span className="font-semibold text-foreground">Local</span> (background delivery active while app is open)
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationCard({
  item,
  onDeepLink,
  onDismiss,
  onSnooze,
  priorityColors,
  priorityIcons,
  moduleIcons,
}: {
  item: AppNotification;
  onDeepLink: (n: AppNotification) => void;
  onDismiss: (id: string) => void;
  onSnooze: (id: string, mins: number) => void;
  priorityColors: Record<NotificationPriority, string>;
  priorityIcons: Record<NotificationPriority, typeof Info>;
  moduleIcons: Record<NotificationModule, typeof HardDrive>;
}) {
  const Icon = priorityIcons[item.priority] || Info;
  const ModIcon = moduleIcons[item.module] || Bell;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 text-left transition-all hover:border-primary/40 hover:shadow-xs",
        item.read ? "border-border/60 bg-card/60 opacity-80" : "border-border bg-card shadow-xs",
        item.wasOffline && "border-l-4 border-l-primary"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn("grid size-7 shrink-0 place-items-center rounded-md border", priorityColors[item.priority])}>
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              {!item.read && <span className="size-1.5 rounded-full bg-primary" />}
              <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatTimeAgo(item.timestamp)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.message}</p>

          {/* Tags & Action Row */}
          <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                <ModIcon className="size-2.5" />
                {item.module === "dataDiet" ? "Storage" : item.module === "greenQueue" ? "Compute" : item.module === "devices" ? "Hardware" : "Goals"}
              </span>
              {item.wasOffline && (
                <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded">
                  While away
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {item.deepLinkTarget && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
                  onClick={() => onDeepLink(item)}
                >
                  Open <ArrowRight className="ml-1 size-3" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Snooze 1h"
                onClick={() => onSnooze(item.id, 60)}
              >
                <Clock className="size-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-muted-foreground hover:text-destructive"
                title="Dismiss"
                onClick={() => onDismiss(item.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
