import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SCHEMA_VERSION = 2;

export type RuleAction = "keep" | "compress" | "archive" | "delete";
export type DietRule = { id: string; months: number; category: string; action: RuleAction; enabled: boolean };
export type Weights = { storage: number; energy: number; cleanup: number; habits: number };
export type Accent = "leaf" | "teal" | "ocean" | "amber" | "plum";

export type Settings = {
  units: { storage: "GB" | "MB"; carbon: "kg" | "lb"; currency: "INR" | "USD" | "EUR" | "GBP"; pricePerKwh: number };
  weights: Weights;
  rules: DietRule[];
  protectedFolders: string[];
  categories: string[];
  queue: { quietStart: number; quietEnd: number; autoShift: boolean };
  devices: { reminderMonths: number; trackWarranty: boolean };
  notifications: { inApp: boolean; browser: boolean; digest: "off" | "daily" | "weekly" };
  appearance: { theme: "light" | "dark" | "system"; accent: Accent; density: "comfortable" | "compact"; textSize: "small" | "medium" | "large"; reduceMotion: boolean };
};

export const DEFAULT_SETTINGS: Settings = {
  units: { storage: "GB", carbon: "kg", currency: "INR", pricePerKwh: 8 },
  weights: { storage: 30, energy: 30, cleanup: 25, habits: 15 },
  rules: [
    { id: "r1", months: 12, category: "Videos", action: "archive", enabled: true },
    { id: "r2", months: 6, category: "Downloads", action: "delete", enabled: true },
    { id: "r3", months: 24, category: "Photos", action: "compress", enabled: true },
  ],
  protectedFolders: ["Documents/Taxes", "Photos/Family"],
  categories: ["Photos", "Videos", "Documents", "Downloads", "Backups"],
  queue: { quietStart: 22, quietEnd: 7, autoShift: true },
  devices: { reminderMonths: 6, trackWarranty: true },
  notifications: { inApp: true, browser: false, digest: "weekly" },
  appearance: { theme: "light", accent: "leaf", density: "comfortable", textSize: "medium", reduceMotion: false },
};

export const SUB_SCORES: Weights = { storage: 62, energy: 70, cleanup: 81, habits: 74 };
export const WEIGHT_LABELS: Record<keyof Weights, string> = { storage: "Storage size", energy: "Energy use", cleanup: "Cleanup progress", habits: "Habits & goals" };

export function weightedScore(w: Weights, sub: Weights = SUB_SCORES) {
  const total = w.storage + w.energy + w.cleanup + w.habits || 1;
  return Math.round((w.storage * sub.storage + w.energy * sub.energy + w.cleanup * sub.cleanup + w.habits * sub.habits) / total);
}

/** Change one weight and rescale the others so the total stays exactly 100. */
export function rebalance(w: Weights, key: keyof Weights, value: number): Weights {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const others = (Object.keys(w) as (keyof Weights)[]).filter((k) => k !== key);
  const otherSum = others.reduce((s, k) => s + w[k], 0);
  const remaining = 100 - v;
  const next = { ...w, [key]: v } as Weights;
  let assigned = 0;
  others.forEach((k, i) => {
    if (i === others.length - 1) next[k] = remaining - assigned;
    else {
      const share = otherSum === 0 ? Math.round(remaining / others.length) : Math.round((w[k] / otherSum) * remaining);
      next[k] = share;
      assigned += share;
    }
  });
  return next;
}

function merge(raw: unknown): Settings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    units: { ...DEFAULT_SETTINGS.units, ...s.units },
    weights: { ...DEFAULT_SETTINGS.weights, ...s.weights },
    queue: { ...DEFAULT_SETTINGS.queue, ...s.queue },
    devices: { ...DEFAULT_SETTINGS.devices, ...s.devices },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...s.notifications },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...s.appearance },
    rules: Array.isArray(s.rules) ? s.rules : DEFAULT_SETTINGS.rules,
    protectedFolders: Array.isArray(s.protectedFolders) ? s.protectedFolders : DEFAULT_SETTINGS.protectedFolders,
    categories: Array.isArray(s.categories) ? s.categories : DEFAULT_SETTINGS.categories,
  };
}

export function parseSettings(raw: unknown) {
  return merge(raw);
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("user_state").select("state").eq("user_id", auth.user.id).maybeSingle();
      if (error) throw error;
      const state = (data?.state ?? {}) as { settings?: unknown };
      return merge(state.settings);
    },
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("user_state")
        .upsert({ user_id: auth.user.id, schema_version: SCHEMA_VERSION, state: { settings } as never, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onMutate: (settings) => qc.setQueryData(["settings"], settings),
  });
}

export function applyAppearance(a: Settings["appearance"]) {
  const root = document.documentElement;
  const dark = a.theme === "dark" || (a.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.dataset.accent = a.accent;
  root.dataset.density = a.density;
  root.dataset.motion = a.reduceMotion ? "reduce" : "full";
  root.style.fontSize = a.textSize === "small" ? "93.75%" : a.textSize === "large" ? "112.5%" : "";
}

export function useAppearanceSync() {
  const { data } = useSettings();
  useEffect(() => {
    if (data) applyAppearance(data.appearance);
  }, [data]);
}

export function formatCarbon(kg: number, unit: Settings["units"]["carbon"]) {
  return unit === "lb" ? `${(kg * 2.2046).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
}

export function formatSize(gb: number, unit: Settings["units"]["storage"]) {
  return unit === "MB" ? `${Math.round(gb * 1024).toLocaleString()} MB` : `${gb.toFixed(1)} GB`;
}

export const CURRENCY_SYMBOL = { INR: "₹", USD: "$", EUR: "€", GBP: "£" } as const;
