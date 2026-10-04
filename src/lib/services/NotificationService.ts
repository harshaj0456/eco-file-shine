import { useNotificationStore } from "../store/notificationStore";
import { useSettingsStore } from "../store/settingsStore";
import { useDataStore } from "../store/dataStore";
import type { AppNotification, NotificationPriority } from "../types";
import { getHourlyCarbonIntensity } from "./CarbonCalculator";

class NotificationService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastTriggeredTimes: Map<string, number> = new Map();
  private throttleMinutes = 15; // Don't re-fire same rule within 15 min
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Run first evaluation shortly after startup
    setTimeout(() => {
      this.evaluateAllRules(true);
    }, 2000);

    // Run periodic evaluation every 45 seconds
    this.timer = setInterval(() => {
      this.evaluateAllRules(false);
    }, 45000);
  }

  public cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isInitialized = false;
  }

  public async requestBrowserPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    } catch {
      return false;
    }
  }

  public evaluateAllRules(isInitialLoad: boolean = false) {
    const settings = useSettingsStore.getState().settings;
    if (!settings.notifications.masterEnabled) return;

    const data = useDataStore.getState();
    const notifStore = useNotificationStore.getState();
    const currentHour = new Date().getHours();

    // Check quiet hours
    if (settings.notifications.quietHours.enabled) {
      const qStart = settings.notifications.quietHours.start;
      const qEnd = settings.notifications.quietHours.end;
      if (qStart <= qEnd && currentHour >= qStart && currentHour < qEnd) return;
      if (qStart > qEnd && (currentHour >= qStart || currentHour < qEnd)) return;
    }

    const triggers = settings.notifications.triggers;
    const modules = settings.notifications.moduleToggles;

    // 1. DATA DIET RULES
    if (modules.dataDiet) {
      // Total Storage threshold
      const totalStorageGb = data.files.reduce((s, f) => s + f.sizeGB, 0);
      if (triggers.storageGrowing && totalStorageGb >= triggers.storageThresholdGb) {
        this.dispatch(
          "trigger-storage-threshold",
          {
            title: "Storage Threshold Crossed",
            message: `Total digital storage is at ${totalStorageGb.toFixed(1)} GB (limit: ${triggers.storageThresholdGb} GB). Run a cleanup to recover space!`,
            module: "dataDiet",
            priority: "warning",
            channel: "in_app",
            deepLinkTarget: { tab: "dataDiet" },
            inlineActions: [{ label: "Clean Files", actionKey: "archive_file" }],
          },
          isInitialLoad
        );
      }

      // Downloads threshold
      const downloadsGb = data.files
        .filter((f) => f.category === "Downloads")
        .reduce((s, f) => s + f.sizeGB, 0);

      if (triggers.downloadsGrowing && downloadsGb >= triggers.downloadsThresholdGb) {
        this.dispatch(
          "trigger-downloads-threshold",
          {
            title: "Downloads Folder Bloated",
            message: `Downloads contain ${downloadsGb.toFixed(1)} GB of temporary installers and unzipped packages.`,
            module: "dataDiet",
            priority: "suggestion",
            channel: "in_app",
            deepLinkTarget: { tab: "dataDiet" },
          },
          isInitialLoad
        );
      }

      // Duplicates
      const duplicates = data.files.filter((f) => f.isDuplicate);
      if (triggers.newDuplicatesFound && duplicates.length > 0) {
        const dupGb = duplicates.reduce((s, f) => s + f.sizeGB, 0);
        this.dispatch(
          "trigger-duplicates",
          {
            title: "Duplicate Media Waiting",
            message: `${duplicates.length} duplicate items detected (${dupGb.toFixed(1)} GB). One-click cleanup ready.`,
            module: "dataDiet",
            priority: "suggestion",
            channel: "in_app",
            deepLinkTarget: { tab: "dataDiet" },
          },
          isInitialLoad
        );
      }
    }

    // 2. GREENQUEUE RULES
    if (modules.greenQueue) {
      const hourlyIntensities = getHourlyCarbonIntensity(settings);
      const currentIntensity = hourlyIntensities[currentHour] ?? 300;
      const nextHour = (currentHour + 1) % 24;
      const nextIntensity = hourlyIntensities[nextHour] ?? 300;

      // Low Carbon Alert
      if (triggers.greenerWindowStarting && nextIntensity < currentIntensity * 0.8) {
        this.dispatch(
          "trigger-green-window",
          {
            title: "Clean Grid Window Starting Soon",
            message: `Carbon intensity will drop to ${nextIntensity} g/kWh in the next hour. Great time for background batch compute!`,
            module: "greenQueue",
            priority: "suggestion",
            channel: "in_app",
            deepLinkTarget: { tab: "greenQueue" },
            inlineActions: [{ label: "Schedule Workload", actionKey: "schedule_cleanest" }],
          },
          isInitialLoad
        );
      }

      // Check upcoming scheduled jobs
      data.jobs.forEach((job) => {
        if (job.status === "scheduled" && job.scheduledSlotHour === nextHour && triggers.jobAboutToStart) {
          this.dispatch(
            `trigger-job-start-${job.id}`,
            {
              title: `Workload Starting Soon: ${job.name}`,
              message: `Scheduled in clean slot ${nextHour}:00 with estimated ${Math.round(job.estimatedCo2Grams)} g CO₂e footprint.`,
              module: "greenQueue",
              priority: "info",
              channel: "in_app",
              deepLinkTarget: { tab: "greenQueue" },
            },
            isInitialLoad
          );
        }
      });
    }

    // 3. DEVICES & PASSPORT RULES
    if (modules.devices) {
      data.devices.forEach((dev) => {
        // EoL approaching (>= 80% life)
        const lifeRatio = dev.currentAgeYears / dev.expectedLifeYears;
        if (triggers.eolApproaching && lifeRatio >= 0.8 && dev.status !== "end_of_life" && dev.status !== "recycled") {
          this.dispatch(
            `trigger-dev-eol-${dev.id}`,
            {
              title: `End-of-Life Approaching: ${dev.name}`,
              message: `${dev.name} has reached ${Math.round(lifeRatio * 100)}% of its expected life. Check repair & battery options to extend it!`,
              module: "devices",
              priority: "warning",
              channel: "in_app",
              deepLinkTarget: { tab: "devices" },
            },
            isInitialLoad
          );
        }

        // Incomplete compliance checklist
        const totalChecks = Object.keys(dev.checklistAnswers).length;
        const checkedCount = Object.values(dev.checklistAnswers).filter(Boolean).length;
        if (triggers.weeeComplianceReminder && checkedCount < totalChecks) {
          this.dispatch(
            `trigger-dev-audit-${dev.id}`,
            {
              title: `WEEE Checklist Incomplete: ${dev.name}`,
              message: `${totalChecks - checkedCount} passport compliance items pending audit.`,
              module: "devices",
              priority: "suggestion",
              channel: "in_app",
              deepLinkTarget: { tab: "devices" },
            },
            isInitialLoad
          );
        }
      });
    }

    // 4. GOALS & STREAKS
    if (modules.goals) {
      data.goals.forEach((goal) => {
        const ratio = goal.currentValue / goal.targetValue;
        if (triggers.goalMilestone && ratio >= 0.5 && ratio < 1.0 && !goal.completed) {
          this.dispatch(
            `trigger-goal-half-${goal.id}`,
            {
              title: `Goal 50% Milestone Reached!`,
              message: `You are halfway to completing "${goal.title}" (${goal.currentValue}/${goal.targetValue} ${goal.unit}).`,
              module: "goals",
              priority: "info",
              channel: "in_app",
              deepLinkTarget: { tab: "home" },
            },
            isInitialLoad
          );
        }
      });
    }
  }

  private dispatch(
    key: string,
    notification: Omit<AppNotification, "id" | "timestamp" | "read" | "dismissed">,
    isInitialLoad: boolean
  ) {
    const now = Date.now();
    const lastTime = this.lastTriggeredTimes.get(key) || 0;
    const throttleMs = this.throttleMinutes * 60 * 1000;

    if (now - lastTime < throttleMs) return;

    this.lastTriggeredTimes.set(key, now);

    const store = useNotificationStore.getState();
    const settings = useSettingsStore.getState().settings;

    // Filter by priority
    if (settings.notifications.priorityFilter === "critical" && notification.priority !== "critical") return;
    if (
      settings.notifications.priorityFilter === "warning" &&
      notification.priority !== "warning" &&
      notification.priority !== "critical"
    )
      return;

    const notif = store.addNotification({
      ...notification,
      wasOffline: isInitialLoad,
    });

    // Browser Notification dispatch if enabled
    if (
      settings.notifications.channels.browser &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: "/favicon.ico",
        });
      } catch (err) {
        console.warn("Browser notification delivery failed:", err);
      }
    }
  }
}

export const notificationService = new NotificationService();
