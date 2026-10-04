import { create } from "zustand";
import type { AppSettings, ScoringWeights } from "../types";
import { DEFAULT_APP_SETTINGS, applyAppearance, rebalanceScoringWeights } from "../settings";
import { getLocalSettings, setLocalSettings, resetAllLocalData } from "../storage";

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  loadSettings: () => Promise<void>;
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  patchSettings: (patch: Partial<AppSettings>) => void;
  setScoringWeight: (key: keyof ScoringWeights, value: number) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: typeof window !== "undefined" ? getLocalSettings() : DEFAULT_APP_SETTINGS,
  isLoaded: true,
  isSaving: false,
  lastSavedAt: null,

  loadSettings: async () => {
    const finalSettings = getLocalSettings();
    set({ settings: finalSettings, isLoaded: true });
    applyAppearance(finalSettings.appearance);
  },

  updateSettings: (updater) => {
    const current = get().settings;
    const next = updater(current);
    set({ settings: next, isSaving: false, lastSavedAt: Date.now() });
    applyAppearance(next.appearance);
    setLocalSettings(next);
  },

  patchSettings: (patch) => {
    const current = get().settings;
    const next: AppSettings = {
      ...current,
      ...patch,
      general: { ...current.general, ...(patch.general || {}) },
      units: { ...current.units, ...(patch.units || {}) },
      scoring: { ...current.scoring, ...(patch.scoring || {}) },
      dataDiet: { ...current.dataDiet, ...(patch.dataDiet || {}) },
      greenQueue: { ...current.greenQueue, ...(patch.greenQueue || {}) },
      devices: { ...current.devices, ...(patch.devices || {}) },
      appearance: { ...current.appearance, ...(patch.appearance || {}) },
      notifications: { ...current.notifications, ...(patch.notifications || {}) },
    };
    set({ settings: next, isSaving: false, lastSavedAt: Date.now() });
    applyAppearance(next.appearance);
    setLocalSettings(next);
  },

  setScoringWeight: (key, value) => {
    const current = get().settings;
    const newWeights = rebalanceScoringWeights(current.scoring, key, value);
    get().patchSettings({ scoring: newWeights });
  },

  resetSettings: () => {
    set({ settings: DEFAULT_APP_SETTINGS, isSaving: false, lastSavedAt: Date.now() });
    applyAppearance(DEFAULT_APP_SETTINGS.appearance);
    setLocalSettings(DEFAULT_APP_SETTINGS);
  },
}));
