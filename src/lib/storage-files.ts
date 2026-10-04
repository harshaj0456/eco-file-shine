import type { DietRule, RuleAction, Settings } from "./settings";

export type StoredFile = { id: string; name: string; folder: string; category: string; sizeGB: number; ageMonths: number };
export type FileStatus = "active" | "kept" | "compressed" | "archived" | "deleted";

export const DEMO_FILES: StoredFile[] = [
  { id: "f1", name: "Goa trip 4K.mp4", folder: "Videos/Travel", category: "Videos", sizeGB: 3.2, ageMonths: 26 },
  { id: "f2", name: "Graduation raw.mov", folder: "Videos/Events", category: "Videos", sizeGB: 2.6, ageMonths: 18 },
  { id: "f3", name: "Screen recordings", folder: "Videos/Work", category: "Videos", sizeGB: 1.4, ageMonths: 8 },
  { id: "f4", name: "Old phone backup.zip", folder: "Backups", category: "Backups", sizeGB: 4.1, ageMonths: 30 },
  { id: "f5", name: "Laptop backup 2024", folder: "Backups", category: "Backups", sizeGB: 2.9, ageMonths: 20 },
  { id: "f6", name: "Family album 2023", folder: "Photos/Family", category: "Photos", sizeGB: 2.4, ageMonths: 28 },
  { id: "f7", name: "Duplicate camera roll", folder: "Photos/Camera", category: "Photos", sizeGB: 3.6, ageMonths: 14 },
  { id: "f8", name: "WhatsApp images", folder: "Photos/Chats", category: "Photos", sizeGB: 1.8, ageMonths: 10 },
  { id: "f9", name: "Burst shots", folder: "Photos/Camera", category: "Photos", sizeGB: 1.1, ageMonths: 30 },
  { id: "f10", name: "Installers (.dmg/.exe)", folder: "Downloads", category: "Downloads", sizeGB: 2.2, ageMonths: 11 },
  { id: "f11", name: "Course PDFs", folder: "Downloads", category: "Downloads", sizeGB: 0.9, ageMonths: 7 },
  { id: "f12", name: "Movie downloads", folder: "Downloads", category: "Downloads", sizeGB: 1.9, ageMonths: 3 },
  { id: "f13", name: "Tax returns", folder: "Documents/Taxes", category: "Documents", sizeGB: 0.4, ageMonths: 36 },
  { id: "f14", name: "Thesis drafts", folder: "Documents/Study", category: "Documents", sizeGB: 0.8, ageMonths: 16 },
  { id: "f15", name: "Scanned receipts", folder: "Documents/Home", category: "Documents", sizeGB: 0.6, ageMonths: 22 },
  { id: "f16", name: "Design exports", folder: "Documents/Work", category: "Documents", sizeGB: 1.3, ageMonths: 5 },
];

/** First enabled rule (top to bottom) that matches the file wins. Protected folders are never touched. */
export function suggestedAction(file: StoredFile, settings: Settings): { action: RuleAction; rule: DietRule } | null {
  if (isProtected(file, settings)) return null;
  for (const rule of settings.rules) {
    if (!rule.enabled) continue;
    if ((rule.category === "Any" || rule.category === file.category) && file.ageMonths >= rule.months) return { action: rule.action, rule };
  }
  return null;
}

export function isProtected(file: StoredFile, settings: Settings) {
  return settings.protectedFolders.some((p) => file.folder === p || file.folder.startsWith(`${p}/`));
}

export function filesToCsv(files: StoredFile[], status: Record<string, FileStatus>) {
  const rows = [["name", "folder", "category", "size_gb", "age_months", "status"]];
  files.forEach((f) => rows.push([f.name, f.folder, f.category, String(f.sizeGB), String(f.ageMonths), status[f.id] ?? "active"]));
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export const STATUS_KEY = "greenpulse-file-status";

export function loadStatus(): Record<string, FileStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}"); } catch { return {}; }
}

export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
