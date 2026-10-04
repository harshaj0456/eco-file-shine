import { useEffect } from "react";
import { z } from "zod";
import type {
  AppSettings,
  AccentColor,
  DietRule,
  ScoringWeights,
  UnitsSettings,
  CustomCategory,
  CustomJobType,
  DeviceTypeConfig,
  PassportChecklistItemDef,
  PassportCustomFieldDef,
} from "./types";
import { REGIONAL_GRID_PROFILES } from "./services/CarbonCalculator";

export const SCHEMA_VERSION = 3;

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: "cat-photos", name: "Photos", color: "#10b981", defaultAction: "compress" },
  { id: "cat-videos", name: "Videos", color: "#06b6d4", defaultAction: "archive" },
  { id: "cat-docs", name: "Documents", color: "#3b82f6", defaultAction: "keep" },
  { id: "cat-downloads", name: "Downloads", color: "#f59e0b", defaultAction: "delete" },
  { id: "cat-backups", name: "Backups", color: "#8b5cf6", defaultAction: "archive" },
  { id: "cat-other", name: "Other", color: "#64748b", defaultAction: "keep" },
];

export const DEFAULT_RULES: DietRule[] = [
  {
    id: "r1",
    name: "Clean old downloads",
    category: "Downloads",
    conditionType: "age_months",
    thresholdValue: 6,
    action: "delete",
    enabled: true,
  },
  {
    id: "r2",
    name: "Archive legacy videos",
    category: "Videos",
    conditionType: "age_months",
    thresholdValue: 18,
    action: "archive",
    enabled: true,
  },
  {
    id: "r3",
    name: "Compress huge photo albums",
    category: "Photos",
    conditionType: "size_mb",
    thresholdValue: 50,
    action: "compress",
    enabled: true,
  },
  {
    id: "r4",
    name: "Archive cold files",
    category: "Any",
    conditionType: "rarely_accessed",
    thresholdValue: 1, // opened <= 1 time
    thresholdDays: 60, // in 60 days
    action: "archive",
    enabled: true,
  },
];

export const DEFAULT_JOB_TYPES: CustomJobType[] = [
  {
    id: "job-ai-training",
    name: "AI Model Fine-tuning",
    defaultPowerKw: 1.8,
    defaultDurationHours: 3,
    defaultDeadlineHours: 23,
    maxAcceptableDelayHours: 8,
  },
  {
    id: "job-video-render",
    name: "4K Video Render & Export",
    defaultPowerKw: 0.85,
    defaultDurationHours: 2,
    defaultDeadlineHours: 20,
    maxAcceptableDelayHours: 6,
  },
  {
    id: "job-db-backup",
    name: "Nightly Database Backup & Sync",
    defaultPowerKw: 0.4,
    defaultDurationHours: 1,
    defaultDeadlineHours: 6,
    maxAcceptableDelayHours: 4,
  },
  {
    id: "job-code-build",
    name: "Full Test Suite & Docker Build",
    defaultPowerKw: 0.6,
    defaultDurationHours: 1,
    defaultDeadlineHours: 18,
    maxAcceptableDelayHours: 3,
  },
  {
    id: "job-crypto-node",
    name: "Node Verification / Batch Crunch",
    defaultPowerKw: 1.2,
    defaultDurationHours: 4,
    defaultDeadlineHours: 24,
    maxAcceptableDelayHours: 12,
  },
];

export const DEFAULT_DEVICE_TYPES: DeviceTypeConfig[] = [
  {
    id: "laptop",
    name: "Laptop",
    expectedLifeYears: 5,
    maintenanceIntervalMonths: 6,
    icon: "Laptop",
    embodiedCarbonKg: 280,
  },
  {
    id: "phone",
    name: "Smartphone",
    expectedLifeYears: 4,
    maintenanceIntervalMonths: 6,
    icon: "Smartphone",
    embodiedCarbonKg: 70,
  },
  {
    id: "monitor",
    name: "Monitor / Display",
    expectedLifeYears: 8,
    maintenanceIntervalMonths: 12,
    icon: "Monitor",
    embodiedCarbonKg: 200,
  },
  {
    id: "server",
    name: "Server / Workstation",
    expectedLifeYears: 7,
    maintenanceIntervalMonths: 4,
    icon: "Server",
    embodiedCarbonKg: 650,
  },
  {
    id: "rpi",
    name: "Raspberry Pi / IoT Node",
    expectedLifeYears: 6,
    maintenanceIntervalMonths: 12,
    icon: "Cpu",
    embodiedCarbonKg: 15,
  },
  {
    id: "custom-dev",
    name: "Custom Device",
    expectedLifeYears: 4,
    maintenanceIntervalMonths: 6,
    icon: "HardDrive",
    embodiedCarbonKg: 100,
  },
];

export const DEFAULT_PASSPORT_CHECKLIST: PassportChecklistItemDef[] = [
  { id: "chk-1", label: "Clean dust and fans", category: "maintenance", defaultChecked: false },
  { id: "chk-2", label: "Inspect battery health (>80%)", category: "maintenance", defaultChecked: false },
  { id: "chk-3", label: "Thermal paste renewal", category: "maintenance", defaultChecked: false },
  { id: "chk-4", label: "Full cryptographic wipe before handoff", category: "security", defaultChecked: false },
  { id: "chk-5", label: "WEEE / RoHS hazardous component audit", category: "weee_compliance", defaultChecked: false },
  { id: "chk-6", label: "Certified e-stewards recycler verified", category: "weee_compliance", defaultChecked: false },
  { id: "chk-7", label: "Refurbish opportunity assessed (RAM/SSD upgrade)", category: "refurbish", defaultChecked: false },
];

export const DEFAULT_PASSPORT_CUSTOM_FIELDS: PassportCustomFieldDef[] = [
  { id: "f-asset-tag", name: "Asset Tag / QR Code", type: "text", required: false },
  { id: "f-battery-cycles", name: "Battery Cycle Count", type: "number", required: false },
  { id: "f-assigned-owner", name: "Assigned User / Team", type: "text", required: false },
  { id: "f-next-audit", name: "Next Audit Date", type: "date", required: false },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  version: SCHEMA_VERSION,
  general: {
    displayName: "Eco Champion",
    usageMode: "personal",
    region: "eu-average",
    customRegionIntensity: 250,
  },
  units: {
    weight: "kg",
    energy: "kWh",
    storage: "GB",
    timeFormat: "24h",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    pricePerKwh: 0.18,
  },
  scoring: {
    dataDiet: 35,
    greenQueue: 35,
    devices: 30,
  },
  dataDiet: {
    rules: DEFAULT_RULES,
    protectedFolders: ["Documents/Taxes", "Photos/Family", "Projects/Core"],
    protectedExtensions: [".key", ".pem", ".env"],
    categories: DEFAULT_CATEGORIES,
  },
  greenQueue: {
    profileId: "eu-average",
    customHourlyIntensity: REGIONAL_GRID_PROFILES["eu-average"].hourlyProfile,
    workingHours: {
      start: 9,
      end: 18,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    quietHours: {
      start: 22,
      end: 7,
      enabled: true,
    },
    customJobTypes: DEFAULT_JOB_TYPES,
    autoShift: true,
  },
  devices: {
    deviceTypes: DEFAULT_DEVICE_TYPES,
    checklistItems: DEFAULT_PASSPORT_CHECKLIST,
    customFields: DEFAULT_PASSPORT_CUSTOM_FIELDS,
    trackWarranty: true,
    maintenanceReminderDays: 30,
  },
  appearance: {
    theme: "light",
    accent: "leaf",
    density: "comfortable",
    textSize: "medium",
    reduceMotion: false,
  },
  notifications: {
    masterEnabled: true,
    channels: {
      inAppToasts: true,
      notificationCenter: true,
      browser: false,
      emailDigest: "weekly",
      mobilePush: false,
    },
    triggers: {
      scanFinished: true,
      newDuplicatesFound: true,
      storageGrowing: true,
      storageThresholdGb: 50,
      monthlyCleanupReminder: true,
      downloadsGrowing: true,
      downloadsThresholdGb: 5,
      recommendedActionsWaiting: true,
      greenerWindowStarting: true,
      greenerWindowMinutes: 30,
      jobAboutToStart: true,
      jobRunning: true,
      jobFinished: true,
      jobDeadlineMissed: true,
      carbonIntensityAlert: true,
      weeklyCarbonSummary: true,
      maintenanceDue: true,
      maintenanceDueDays: 30,
      warrantyEnding: true,
      warrantyEndingDays: 30,
      eolApproaching: true,
      reuseRefurbishOpportunity: true,
      weeeComplianceReminder: true,
      recyclingPickupReminder: true,
      scoreChanged: true,
      scoreChangeDelta: 5,
      goalMilestone: true,
      goalDeadlineApproaching: true,
      streakAtRisk: true,
      badgeUnlocked: true,
      weeklyImpactSummary: true,
      monthlyImpactSummary: true,
    },
    moduleToggles: {
      dataDiet: true,
      greenQueue: true,
      devices: true,
      goals: true,
    },
    priorityFilter: "all",
    quietHours: {
      start: 22,
      end: 8,
      enabled: false,
    },
    digestTime: "08:00",
    templates: {
      storageAlert: "Storage reached {gb} GB. Ready for a quick cleanup?",
      greenWindow: "Super clean grid slot starting in {time} ({kg_co2} CO₂/kWh)!",
      deviceMaintenance: "Check-up scheduled for {device} in {time} days.",
      goalMilestone: "You reached {gb} of your target! Keep it up!",
    },
    customReminders: [],
  },
};

// Zod Validation Schema
export const settingsValidator = z.object({
  version: z.number(),
  general: z.object({
    displayName: z.string().min(1, "Name cannot be empty").max(100),
    usageMode: z.enum(["personal", "student", "organization"]),
    region: z.string(),
    customRegionIntensity: z.number().min(0).max(2000),
  }),
  units: z.object({
    weight: z.enum(["kg", "g", "lb"]),
    energy: z.enum(["kWh", "MWh"]),
    storage: z.enum(["GB", "TB", "MB"]),
    timeFormat: z.enum(["12h", "24h"]),
    dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
    currency: z.enum(["USD", "EUR", "INR", "GBP"]),
    pricePerKwh: z.number().min(0).max(100),
  }),
  scoring: z.object({
    dataDiet: z.number().min(0).max(100),
    greenQueue: z.number().min(0).max(100),
    devices: z.number().min(0).max(100),
  }),
});

/** Auto-normalize 3 sliders so their sum equals exactly 100% */
export function rebalanceScoringWeights(
  current: ScoringWeights,
  modifiedKey: keyof ScoringWeights,
  newValue: number
): ScoringWeights {
  const val = Math.max(0, Math.min(100, Math.round(newValue)));
  const keys = (Object.keys(current) as (keyof ScoringWeights)[]).filter((k) => k !== modifiedKey);
  const remaining = 100 - val;
  const currentOtherSum = keys.reduce((sum, k) => sum + current[k], 0);

  const next = { ...current, [modifiedKey]: val } as ScoringWeights;

  if (currentOtherSum === 0) {
    const half = Math.floor(remaining / 2);
    next[keys[0]!] = half;
    next[keys[1]!] = remaining - half;
  } else {
    let assigned = 0;
    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        next[k] = remaining - assigned;
      } else {
        const share = Math.round((current[k] / currentOtherSum) * remaining);
        next[k] = share;
        assigned += share;
      }
    });
  }
  return next;
}

/** Migration logic for legacy settings */
export function migrateSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_APP_SETTINGS;
  const data = raw as Record<string, unknown>;

  // If already at latest schema version
  if (data.version === SCHEMA_VERSION && data.general && data.scoring && data.dataDiet) {
    return {
      ...DEFAULT_APP_SETTINGS,
      ...data,
      general: { ...DEFAULT_APP_SETTINGS.general, ...(data.general as object) },
      units: { ...DEFAULT_APP_SETTINGS.units, ...(data.units as object) },
      scoring: { ...DEFAULT_APP_SETTINGS.scoring, ...(data.scoring as object) },
      dataDiet: { ...DEFAULT_APP_SETTINGS.dataDiet, ...(data.dataDiet as object) },
      greenQueue: { ...DEFAULT_APP_SETTINGS.greenQueue, ...(data.greenQueue as object) },
      devices: { ...DEFAULT_APP_SETTINGS.devices, ...(data.devices as object) },
      appearance: { ...DEFAULT_APP_SETTINGS.appearance, ...(data.appearance as object) },
      notifications: { ...DEFAULT_APP_SETTINGS.notifications, ...(data.notifications as object) },
    } as AppSettings;
  }

  // Handle v1 / v2 legacy migration
  const legacyUnits = (data.units ?? {}) as Record<string, unknown>;
  const legacyWeights = (data.weights ?? {}) as Record<string, number>;
  const legacyAppearance = (data.appearance ?? {}) as Record<string, unknown>;
  const legacyQueue = (data.queue ?? {}) as Record<string, unknown>;

  return {
    ...DEFAULT_APP_SETTINGS,
    version: SCHEMA_VERSION,
    units: {
      ...DEFAULT_APP_SETTINGS.units,
      storage: (legacyUnits.storage as "GB" | "MB") || "GB",
      weight: (legacyUnits.carbon as "kg" | "lb") || "kg",
      currency: (legacyUnits.currency as "USD" | "EUR" | "INR" | "GBP") || "USD",
      pricePerKwh: Number(legacyUnits.pricePerKwh ?? 0.18),
    },
    scoring: {
      dataDiet: legacyWeights.storage ?? 35,
      greenQueue: legacyWeights.energy ?? 35,
      devices: legacyWeights.cleanup ?? 30,
    },
    appearance: {
      ...DEFAULT_APP_SETTINGS.appearance,
      theme: (legacyAppearance.theme as "light" | "dark" | "system") || "light",
      accent: (legacyAppearance.accent as AccentColor) || "leaf",
      density: (legacyAppearance.density as "comfortable" | "compact") || "comfortable",
      textSize: (legacyAppearance.textSize as "small" | "medium" | "large") || "medium",
      reduceMotion: Boolean(legacyAppearance.reduceMotion),
    },
    greenQueue: {
      ...DEFAULT_APP_SETTINGS.greenQueue,
      quietHours: {
        start: Number(legacyQueue.quietStart ?? 22),
        end: Number(legacyQueue.quietEnd ?? 7),
        enabled: true,
      },
      autoShift: Boolean(legacyQueue.autoShift ?? true),
    },
  };
}

export function applyAppearance(appearance: AppSettings["appearance"]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark =
    appearance.theme === "dark" ||
    (appearance.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", isDark);
  root.dataset["accent"] = appearance.accent;
  root.dataset["density"] = appearance.density;
  root.dataset["motion"] = appearance.reduceMotion ? "reduce" : "full";

  if (appearance.textSize === "small") {
    root.style.fontSize = "93.75%";
  } else if (appearance.textSize === "large") {
    root.style.fontSize = "112.5%";
  } else {
    root.style.fontSize = "100%";
  }
}
