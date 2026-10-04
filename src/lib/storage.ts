/**
 * GreenPulse Local Storage Service
 * Centralized, type-safe, versioned localStorage persistence.
 * Provides resilient fallback, corrupted data recovery, and sensible defaults.
 */

import type {
  AppSettings,
  DigitalFile,
  ScheduledJob,
  DeviceItem,
  SustainabilityGoal,
  Badge,
  AppNotification,
  UsageMode,
  RegionId,
} from "./types";
import { DEFAULT_APP_SETTINGS, migrateSettings } from "./settings";

export const STORAGE_VERSION = 3;

export const STORAGE_KEYS = {
  PROFILE: `greenpulse_v${STORAGE_VERSION}_profile`,
  SETTINGS: `greenpulse_v${STORAGE_VERSION}_settings`,
  DATA: `greenpulse_v${STORAGE_VERSION}_data`,
  NOTIFICATIONS: `greenpulse_v${STORAGE_VERSION}_notifications`,
  NOTIF_HISTORY: `greenpulse_v${STORAGE_VERSION}_notif_history`,
  UI: `greenpulse_v${STORAGE_VERSION}_ui`,
} as const;

export interface StoredProfile {
  id: string;
  display_name: string | null;
  usage_mode: UsageMode;
  region: RegionId;
  modules: {
    dataDiet: boolean;
    greenQueue: boolean;
    passport: boolean;
  };
  onboarded: boolean;
  department?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface StoredDataPayload {
  files: DigitalFile[];
  jobs: ScheduledJob[];
  devices: DeviceItem[];
  goals: SustainabilityGoal[];
  badges: Badge[];
  xp: number;
  streakDays: number;
}

export interface StoredNotifHistoryItem {
  id: string;
  timestamp: string;
  trigger: string;
  message: string;
  channel: string;
  status: "delivered" | "snoozed" | "dismissed" | "actioned";
}

/** Safe JSON Parser */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn("[GreenPulse Storage] Corrupted JSON detected, using fallback:", err);
    return fallback;
  }
}

/** Safe getItem */
export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return safeParse<T>(raw, fallback);
  } catch (err) {
    console.warn(`[GreenPulse Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

/** Safe setItem */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[GreenPulse Storage] Failed to write ${key}:`, err);
    return false;
  }
}

/** Safe removeItem */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[GreenPulse Storage] Failed to remove ${key}:`, err);
  }
}

// -------------------------------------------------------------
// Type-Specific Helpers
// -------------------------------------------------------------

export const DEFAULT_PROFILE: StoredProfile = {
  id: "local-user",
  display_name: "Eco Champion",
  usage_mode: "personal",
  region: "eu-average",
  modules: { dataDiet: true, greenQueue: true, passport: true },
  onboarded: true,
};

export function getLocalProfile(): StoredProfile {
  // Check v3 key first, then fallback to legacy key
  const profile = getStorageItem<StoredProfile | null>(STORAGE_KEYS.PROFILE, null);
  if (profile) {
    if (!profile.onboarded) {
      profile.onboarded = true;
      if (!profile.display_name) profile.display_name = "Eco Champion";
      setLocalProfile(profile);
    }
    return profile;
  }

  const legacy = getStorageItem<StoredProfile | null>("greenpulse-user-profile", null);
  if (legacy) {
    legacy.onboarded = true;
    setLocalProfile(legacy);
    return legacy;
  }

  setLocalProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export function setLocalProfile(profile: Partial<StoredProfile>): StoredProfile {
  const current = getLocalProfile();
  const updated: StoredProfile = {
    ...current,
    ...profile,
    updated_at: new Date().toISOString(),
  };
  setStorageItem(STORAGE_KEYS.PROFILE, updated);
  return updated;
}

export function getLocalSettings(): AppSettings {
  const raw = getStorageItem<unknown>(STORAGE_KEYS.SETTINGS, null);
  if (raw) {
    return migrateSettings(raw);
  }
  const legacy = getStorageItem<unknown>("greenpulse_app_settings_v3", null);
  if (legacy) {
    const migrated = migrateSettings(legacy);
    setLocalSettings(migrated);
    return migrated;
  }
  return DEFAULT_APP_SETTINGS;
}

export function setLocalSettings(settings: AppSettings): void {
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);
}

export function getLocalDataStore(): StoredDataPayload | null {
  return getStorageItem<StoredDataPayload | null>(STORAGE_KEYS.DATA, null);
}

export function setLocalDataStore(payload: StoredDataPayload): void {
  setStorageItem(STORAGE_KEYS.DATA, payload);
}

export function getLocalNotifications(): AppNotification[] | null {
  return getStorageItem<AppNotification[] | null>(STORAGE_KEYS.NOTIFICATIONS, null);
}

export function setLocalNotifications(notifs: AppNotification[]): void {
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

export function getLocalNotifHistory(): StoredNotifHistoryItem[] | null {
  return getStorageItem<StoredNotifHistoryItem[] | null>(STORAGE_KEYS.NOTIF_HISTORY, null);
}

export function setLocalNotifHistory(history: StoredNotifHistoryItem[]): void {
  setStorageItem(STORAGE_KEYS.NOTIF_HISTORY, history);
}

/** Reset all local data to factory defaults */
export function resetAllLocalData(): void {
  removeStorageItem(STORAGE_KEYS.PROFILE);
  removeStorageItem(STORAGE_KEYS.SETTINGS);
  removeStorageItem(STORAGE_KEYS.DATA);
  removeStorageItem(STORAGE_KEYS.NOTIFICATIONS);
  removeStorageItem(STORAGE_KEYS.NOTIF_HISTORY);
  removeStorageItem(STORAGE_KEYS.UI);
  removeStorageItem("greenpulse-file-status");
  removeStorageItem("greenpulse-user-profile");
  removeStorageItem("greenpulse_app_settings_v3");
  removeStorageItem("greenpulse_datastore_v3");
}
