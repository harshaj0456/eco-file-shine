import { create } from "zustand";
import type {
  DigitalFile,
  ScheduledJob,
  DeviceItem,
  SustainabilityGoal,
  Badge,
  LeaderboardUser,
  FileActionStatus,
  JobStatus,
  AppSettings,
} from "../types";
import { fireCelebration, fireConfetti } from "../confetti";
import { toast } from "sonner";
import { useHistoryStore } from "./historyStore";

export const INITIAL_FILES: DigitalFile[] = [
  {
    id: "f1",
    name: "Goa_Trip_4K_Raw_Footage.mp4",
    folder: "Videos/Travel",
    category: "Videos",
    sizeBytes: 3.4 * 1024 * 1024 * 1024,
    sizeGB: 3.4,
    lastModified: "2024-03-12",
    ageMonths: 28,
    accessCount: 1,
    lastAccessedDaysAgo: 450,
    status: "active",
    tags: ["Vacation", "4K"],
    carbonGramsAnnual: 251.6,
  },
  {
    id: "f2",
    name: "Graduation_Ceremony_Uncut.mov",
    folder: "Videos/Events",
    category: "Videos",
    sizeBytes: 2.8 * 1024 * 1024 * 1024,
    sizeGB: 2.8,
    lastModified: "2024-07-20",
    ageMonths: 24,
    accessCount: 2,
    lastAccessedDaysAgo: 380,
    status: "active",
    tags: ["Personal", "Archive"],
    carbonGramsAnnual: 207.2,
  },
  {
    id: "f3",
    name: "Zoom_Screen_Recordings_Oct2025",
    folder: "Videos/Work",
    category: "Videos",
    sizeBytes: 1.5 * 1024 * 1024 * 1024,
    sizeGB: 1.5,
    lastModified: "2025-10-15",
    ageMonths: 9,
    accessCount: 4,
    lastAccessedDaysAgo: 120,
    status: "active",
    tags: ["Work", "Meetings"],
    carbonGramsAnnual: 111.0,
  },
  {
    id: "f4",
    name: "Old_Phone_Full_NAND_Backup.zip",
    folder: "Backups",
    category: "Backups",
    sizeBytes: 4.5 * 1024 * 1024 * 1024,
    sizeGB: 4.5,
    lastModified: "2023-11-05",
    ageMonths: 32,
    accessCount: 0,
    lastAccessedDaysAgo: 800,
    status: "active",
    tags: ["System", "Old"],
    carbonGramsAnnual: 333.0,
  },
  {
    id: "f5",
    name: "Laptop_System_Image_2024.iso",
    folder: "Backups",
    category: "Backups",
    sizeBytes: 3.1 * 1024 * 1024 * 1024,
    sizeGB: 3.1,
    lastModified: "2024-06-18",
    ageMonths: 25,
    accessCount: 1,
    lastAccessedDaysAgo: 500,
    status: "active",
    tags: ["Backup"],
    carbonGramsAnnual: 229.4,
  },
  {
    id: "f6",
    name: "Family_Album_Summer_2023",
    folder: "Photos/Family",
    category: "Photos",
    sizeBytes: 2.6 * 1024 * 1024 * 1024,
    sizeGB: 2.6,
    lastModified: "2023-08-14",
    ageMonths: 35,
    accessCount: 6,
    lastAccessedDaysAgo: 45,
    status: "active",
    tags: ["Family", "Protected"],
    carbonGramsAnnual: 192.4,
  },
  {
    id: "f7",
    name: "Duplicate_Camera_Roll_Burst (1).heic",
    folder: "Photos/Camera",
    category: "Photos",
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    sizeGB: 3.8,
    lastModified: "2025-05-10",
    ageMonths: 14,
    accessCount: 1,
    lastAccessedDaysAgo: 210,
    status: "active",
    isDuplicate: true,
    duplicateGroupId: "dup-1",
    tags: ["Duplicates", "Burst"],
    carbonGramsAnnual: 281.2,
  },
  {
    id: "f8",
    name: "Duplicate_Camera_Roll_Burst.heic",
    folder: "Photos/Camera",
    category: "Photos",
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    sizeGB: 3.8,
    lastModified: "2025-05-10",
    ageMonths: 14,
    accessCount: 3,
    lastAccessedDaysAgo: 100,
    status: "active",
    isDuplicate: true,
    duplicateGroupId: "dup-1",
    tags: ["Primary", "Burst"],
    carbonGramsAnnual: 281.2,
  },
  {
    id: "f9",
    name: "WhatsApp_Media_Temp_Dump",
    folder: "Photos/Chats",
    category: "Photos",
    sizeBytes: 2.1 * 1024 * 1024 * 1024,
    sizeGB: 2.1,
    lastModified: "2025-09-01",
    ageMonths: 10,
    accessCount: 2,
    lastAccessedDaysAgo: 90,
    status: "active",
    tags: ["Chat", "Junk"],
    carbonGramsAnnual: 155.4,
  },
  {
    id: "f10",
    name: "Unused_Software_Installers_x64.dmg",
    folder: "Downloads",
    category: "Downloads",
    sizeBytes: 2.4 * 1024 * 1024 * 1024,
    sizeGB: 2.4,
    lastModified: "2025-08-11",
    ageMonths: 11,
    accessCount: 1,
    lastAccessedDaysAgo: 320,
    status: "active",
    tags: ["Installers"],
    carbonGramsAnnual: 177.6,
  },
  {
    id: "f11",
    name: "Lecture_Recordings_and_Notes.tar",
    folder: "Downloads",
    category: "Downloads",
    sizeBytes: 1.2 * 1024 * 1024 * 1024,
    sizeGB: 1.2,
    lastModified: "2025-12-01",
    ageMonths: 7,
    accessCount: 5,
    lastAccessedDaysAgo: 60,
    status: "active",
    tags: ["Study"],
    carbonGramsAnnual: 88.8,
  },
  {
    id: "f12",
    name: "Expired_Movie_Downloads_1080p.mkv",
    folder: "Downloads",
    category: "Downloads",
    sizeBytes: 2.2 * 1024 * 1024 * 1024,
    sizeGB: 2.2,
    lastModified: "2026-04-10",
    ageMonths: 3,
    accessCount: 1,
    lastAccessedDaysAgo: 85,
    status: "active",
    tags: ["Entertainment"],
    carbonGramsAnnual: 162.8,
  },
  {
    id: "f13",
    name: "Tax_Returns_2020_2024.pdf",
    folder: "Documents/Taxes",
    category: "Documents",
    sizeBytes: 0.5 * 1024 * 1024 * 1024,
    sizeGB: 0.5,
    lastModified: "2023-04-15",
    ageMonths: 39,
    accessCount: 4,
    lastAccessedDaysAgo: 110,
    status: "active",
    tags: ["Taxes", "Important"],
    carbonGramsAnnual: 37.0,
  },
  {
    id: "f14",
    name: "Thesis_Drafts_All_Revisions.docx",
    folder: "Documents/Study",
    category: "Documents",
    sizeBytes: 0.9 * 1024 * 1024 * 1024,
    sizeGB: 0.9,
    lastModified: "2025-03-22",
    ageMonths: 16,
    accessCount: 8,
    lastAccessedDaysAgo: 30,
    status: "active",
    tags: ["Thesis", "Academic"],
    carbonGramsAnnual: 66.6,
  },
  {
    id: "f15",
    name: "Scanned_Receipts_and_Invoices_Archive",
    folder: "Documents/Home",
    category: "Documents",
    sizeBytes: 0.7 * 1024 * 1024 * 1024,
    sizeGB: 0.7,
    lastModified: "2024-10-05",
    ageMonths: 21,
    accessCount: 3,
    lastAccessedDaysAgo: 180,
    status: "active",
    tags: ["Receipts"],
    carbonGramsAnnual: 51.8,
  },
  {
    id: "f16",
    name: "Figma_Design_Cache_and_Exports",
    folder: "Documents/Work",
    category: "Documents",
    sizeBytes: 1.6 * 1024 * 1024 * 1024,
    sizeGB: 1.6,
    lastModified: "2026-02-18",
    ageMonths: 5,
    accessCount: 14,
    lastAccessedDaysAgo: 10,
    status: "active",
    tags: ["Design", "Work"],
    carbonGramsAnnual: 118.4,
  },
];

export const INITIAL_JOBS: ScheduledJob[] = [
  {
    id: "job-1",
    name: "ResNet-50 Batch Inference",
    workloadType: "AI Training / Inference",
    powerKw: 1.6,
    durationHours: 3,
    deadlineHour: 22,
    scheduledSlotHour: 13, // Scheduled in clean midday slot
    status: "scheduled",
    estimatedCo2Grams: 816,
    co2SavedGrams: 420,
    costEstimated: 0.86,
    priority: "high",
    tags: ["AI", "Compute"],
    createdAt: "2026-10-01T08:00:00Z",
  },
  {
    id: "job-2",
    name: "Podcast 4K Video Render",
    workloadType: "Video Render",
    powerKw: 0.9,
    durationHours: 2,
    deadlineHour: 20,
    scheduledSlotHour: 14,
    status: "scheduled",
    estimatedCo2Grams: 324,
    co2SavedGrams: 180,
    costEstimated: 0.32,
    priority: "medium",
    tags: ["Media"],
    createdAt: "2026-10-01T09:30:00Z",
  },
  {
    id: "job-3",
    name: "PostgreSQL Database Offsite Sync",
    workloadType: "Database Backup",
    powerKw: 0.4,
    durationHours: 1,
    deadlineHour: 6,
    scheduledSlotHour: 3, // Super clean early morning slot
    status: "queued",
    estimatedCo2Grams: 76,
    co2SavedGrams: 64,
    costEstimated: 0.07,
    priority: "low",
    tags: ["Infrastructure"],
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "job-4",
    name: "End-to-End Cypress Test Matrix",
    workloadType: "Code Build / CI",
    powerKw: 0.75,
    durationHours: 1,
    deadlineHour: 18,
    scheduledSlotHour: 11,
    status: "completed",
    estimatedCo2Grams: 157,
    co2SavedGrams: 95,
    costEstimated: 0.14,
    priority: "high",
    tags: ["CI/CD"],
    createdAt: "2026-10-01T07:15:00Z",
  },
];

export const INITIAL_DEVICES: DeviceItem[] = [
  {
    id: "dev-1",
    name: "MacBook Pro 16\" (M2 Max)",
    deviceTypeId: "laptop",
    serialNumber: "C02G849XMD6R",
    purchaseDate: "2023-03-15",
    expectedLifeYears: 6,
    currentAgeYears: 3.5,
    healthPercent: 88,
    status: "good",
    lastMaintenanceDate: "2026-04-10",
    warrantyExpiryDate: "2026-03-15",
    embodiedCarbonKg: 290,
    annualOperationalCarbonKg: 24,
    weightKg: 2.15,
    tags: ["Primary", "Development"],
    maintenanceHistory: [
      {
        id: "m-1",
        date: "2026-04-10",
        action: "Cleaned internal dual fans & refreshed thermal grease",
        technicianOrNotes: "Self-service kit",
        cost: 25,
        co2SavedKg: 45,
      },
      {
        id: "m-2",
        date: "2025-06-18",
        action: "Battery health diagnostic & cycle calibration (89% health)",
        technicianOrNotes: "Authorized center",
        cost: 0,
        co2SavedKg: 20,
      },
    ],
    lifecycleTimeline: [
      { id: "lc-1", date: "2023-03-15", title: "Device Purchased & Registered", type: "purchase", description: "Initial setup with carbon baseline of 290 kg CO₂" },
      { id: "lc-2", date: "2024-09-01", title: "Storage Optimization", type: "upgrade", description: "Cleared 40 GB duplicate caches" },
      { id: "lc-3", date: "2026-04-10", title: "Full Thermal Service", type: "repair", description: "Extended expected operational lifetime by +1.5 years" },
    ],
    customFieldValues: {
      "f-asset-tag": "ENG-LAP-042",
      "f-battery-cycles": 214,
      "f-assigned-owner": "Lead Engineer",
    },
    checklistAnswers: {
      "chk-1": true,
      "chk-2": true,
      "chk-3": true,
      "chk-4": false,
      "chk-5": true,
      "chk-6": false,
      "chk-7": true,
    },
  },
  {
    id: "dev-2",
    name: "Pixel 8 Pro (128GB)",
    deviceTypeId: "phone",
    serialNumber: "354928104829103",
    purchaseDate: "2023-10-20",
    expectedLifeYears: 5,
    currentAgeYears: 2.9,
    healthPercent: 79,
    status: "needs_attention",
    lastMaintenanceDate: "2025-10-01",
    warrantyExpiryDate: "2025-10-20",
    embodiedCarbonKg: 75,
    annualOperationalCarbonKg: 8,
    weightKg: 0.21,
    tags: ["Mobile", "Personal"],
    maintenanceHistory: [
      {
        id: "m-3",
        date: "2025-10-01",
        action: "Replaced degraded battery with OEM replacement",
        technicianOrNotes: "iFixit Repair Kit",
        cost: 49,
        co2SavedKg: 55,
      },
    ],
    lifecycleTimeline: [
      { id: "lc-4", date: "2023-10-20", title: "Purchased New", type: "purchase", description: "7-year OS update guarantee model" },
      { id: "lc-5", date: "2025-10-01", title: "Battery Replacement", type: "battery", description: "Avoided premature device disposal" },
    ],
    customFieldValues: {
      "f-asset-tag": "MOB-DEV-008",
      "f-battery-cycles": 520,
    },
    checklistAnswers: {
      "chk-1": true,
      "chk-2": true,
      "chk-4": false,
      "chk-7": true,
    },
  },
  {
    id: "dev-3",
    name: "Dell UltraSharp 32\" 4K USB-C Hub",
    deviceTypeId: "monitor",
    serialNumber: "CN-0R567M-74261",
    purchaseDate: "2021-06-10",
    expectedLifeYears: 9,
    currentAgeYears: 5.3,
    healthPercent: 94,
    status: "excellent",
    embodiedCarbonKg: 220,
    annualOperationalCarbonKg: 35,
    weightKg: 8.5,
    tags: ["Workspace", "Display"],
    maintenanceHistory: [],
    lifecycleTimeline: [
      { id: "lc-6", date: "2021-06-10", title: "Workstation Deployed", type: "purchase", description: "High-efficiency IPS Black panel" },
    ],
    customFieldValues: {
      "f-asset-tag": "MON-DESK-019",
    },
    checklistAnswers: {
      "chk-1": true,
      "chk-5": true,
    },
  },
  {
    id: "dev-4",
    name: "Raspberry Pi 4 Home Assistant Node",
    deviceTypeId: "rpi",
    serialNumber: "RPi4-B-8GB-981",
    purchaseDate: "2022-01-14",
    expectedLifeYears: 7,
    currentAgeYears: 4.7,
    healthPercent: 96,
    status: "excellent",
    embodiedCarbonKg: 15,
    annualOperationalCarbonKg: 6,
    weightKg: 0.12,
    tags: ["IoT", "Server"],
    maintenanceHistory: [],
    lifecycleTimeline: [
      { id: "lc-7", date: "2022-01-14", title: "IoT Hub Provisioned", type: "purchase", description: "Low-energy 5W standby server" },
    ],
    customFieldValues: {
      "f-asset-tag": "IOT-NODE-001",
    },
    checklistAnswers: {
      "chk-1": true,
      "chk-2": true,
    },
  },
];

export const INITIAL_GOALS: SustainabilityGoal[] = [
  {
    id: "goal-1",
    title: "Free 15 GB Unused Storage",
    description: "Audit legacy downloads, burst photos, and obsolete backups",
    module: "dataDiet",
    targetValue: 15,
    currentValue: 8.4,
    unit: "GB",
    deadline: "2026-10-31",
    completed: false,
    streakDays: 5,
    xpReward: 150,
  },
  {
    id: "goal-2",
    title: "Shift 10 Jobs to Low-Carbon Hours",
    description: "Queue heavy tasks in clean solar / wind grid windows",
    module: "greenQueue",
    targetValue: 10,
    currentValue: 7,
    unit: "jobs",
    deadline: "2026-10-25",
    completed: false,
    streakDays: 7,
    xpReward: 250,
  },
  {
    id: "goal-3",
    title: "Complete Annual Device Check-ups",
    description: "Run thermal & battery audit on all registered hardware",
    module: "devices",
    targetValue: 4,
    currentValue: 3,
    unit: "devices",
    deadline: "2026-11-15",
    completed: false,
    streakDays: 3,
    xpReward: 200,
  },
  {
    id: "goal-4",
    title: "Zero Duplicates Week Challenge",
    description: "Clean up all duplicate photo batches",
    module: "dataDiet",
    targetValue: 1,
    currentValue: 1,
    unit: "challenge",
    deadline: "2026-09-30",
    completed: true,
    completedAt: "2026-09-29",
    streakDays: 7,
    xpReward: 100,
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-first-cleanup",
    title: "First Cleanup",
    description: "Cleaned over 5 GB of digital waste",
    category: "storage",
    tier: "bronze",
    icon: "Sparkles",
    unlocked: true,
    unlockedAt: "2026-09-15",
    progressPercent: 100,
  },
  {
    id: "badge-green-commuter",
    title: "Green Scheduler",
    description: "Shifted 5 compute jobs to clean grid windows",
    category: "compute",
    tier: "silver",
    icon: "Zap",
    unlocked: true,
    unlockedAt: "2026-09-22",
    progressPercent: 100,
  },
  {
    id: "badge-device-guardian",
    title: "Device Guardian",
    description: "Completed maintenance & extended lifespan of 3 devices",
    category: "devices",
    tier: "silver",
    icon: "ShieldCheck",
    unlocked: true,
    unlockedAt: "2026-09-28",
    progressPercent: 100,
  },
  {
    id: "badge-night-owl",
    title: "Night-Owl Compute",
    description: "Run a heavy batch job in high-wind overnight slots",
    category: "compute",
    tier: "gold",
    icon: "Moon",
    unlocked: false,
    progressPercent: 60,
  },
  {
    id: "badge-carbon-slayer",
    title: "Carbon Slayer",
    description: "Save a cumulative 25 kg of CO₂e across all modules",
    category: "mastery",
    tier: "platinum",
    icon: "Trophy",
    unlocked: false,
    progressPercent: 72,
  },
  {
    id: "badge-streak-flame",
    title: "Eco Consistency Master",
    description: "Maintain a 14-day sustainability activity streak",
    category: "streak",
    tier: "gold",
    icon: "Flame",
    unlocked: false,
    progressPercent: 50,
  },
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: "u-1", name: "Aria Chen", avatar: "🌱", mode: "personal", score: 94, xp: 2450, co2SavedKg: 38.2, streakDays: 21 },
  { id: "u-curr", name: "You (Eco Champion)", avatar: "⚡", mode: "personal", score: 86, xp: 1850, co2SavedKg: 22.4, streakDays: 7, isCurrentUser: true },
  { id: "u-2", name: "DevLab Ops Team", avatar: "🚀", mode: "organization", score: 83, xp: 1620, co2SavedKg: 19.8, streakDays: 12 },
  { id: "u-3", name: "Lucas Vance", avatar: "🎓", mode: "student", score: 79, xp: 1340, co2SavedKg: 14.6, streakDays: 4 },
  { id: "u-4", name: "Sophia Miller", avatar: "🍃", mode: "personal", score: 76, xp: 1190, co2SavedKg: 12.1, streakDays: 3 },
];

interface DataStoreState {
  files: DigitalFile[];
  jobs: ScheduledJob[];
  devices: DeviceItem[];
  goals: SustainabilityGoal[];
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  xp: number;
  streakDays: number;
  activeScanBusy: boolean;

  // File Actions
  setFileStatus: (id: string, status: FileActionStatus, showToast?: boolean) => void;
  batchSetFileStatus: (ids: string[], status: FileActionStatus) => void;
  runDietRules: (rules: AppSettings["dataDiet"]["rules"], protectedFolders: string[]) => { affectedCount: number; savedGb: number };
  addFile: (file: Omit<DigitalFile, "id">) => void;
  deleteFilePermanently: (id: string) => void;
  updateFileTags: (id: string, tags: string[]) => void;
  updateFileNotes: (id: string, notes: string) => void;

  // Job Actions
  scheduleJob: (job: Omit<ScheduledJob, "id" | "createdAt">) => void;
  rescheduleJobSlot: (jobId: string, newSlotHour: number, calculatedCo2: number, savedCo2: number) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  deleteJob: (jobId: string) => void;

  // Device Actions
  addDevice: (device: Omit<DeviceItem, "id">) => void;
  updateDevice: (id: string, patch: Partial<DeviceItem>) => void;
  logDeviceMaintenance: (deviceId: string, entry: Omit<DeviceItem["maintenanceHistory"][0], "id">) => void;
  addLifecycleMilestone: (deviceId: string, milestone: Omit<DeviceItem["lifecycleTimeline"][0], "id">) => void;
  toggleChecklistAnswer: (deviceId: string, checkId: string, checked: boolean) => void;
  deleteDevice: (id: string) => void;

  // Goals & Gamification
  addGoal: (goal: Omit<SustainabilityGoal, "id" | "completed" | "streakDays">) => void;
  updateGoalProgress: (id: string, addValue: number) => void;
  completeGoal: (id: string) => void;
  awardXP: (amount: number, reason?: string) => void;
  checkBadges: () => void;
  resetAllData: () => void;
}

const DATA_STORE_STORAGE_KEY = "greenpulse_datastore_v3";

function loadSavedDataStore() {
  try {
    const raw = localStorage.getItem(DATA_STORE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export const useDataStore = create<DataStoreState>((set, get) => {
  const saved = loadSavedDataStore();

  return {
    files: saved?.files || INITIAL_FILES,
    jobs: saved?.jobs || INITIAL_JOBS,
    devices: saved?.devices || INITIAL_DEVICES,
    goals: saved?.goals || INITIAL_GOALS,
    badges: saved?.badges || INITIAL_BADGES,
    leaderboard: INITIAL_LEADERBOARD,
    xp: saved?.xp ?? 1850,
    streakDays: saved?.streakDays ?? 7,
    activeScanBusy: false,

    setFileStatus: (id, status, showToast = true) => {
      const state = get();
      const target = state.files.find((f) => f.id === id);
      if (!target) return;

      const prevStatus = target.status;
      const history = useHistoryStore.getState();

      history.pushAction({
        id: `file-status-${Date.now()}`,
        description: `Set ${target.name} to ${status}`,
        module: "dataDiet",
        undo: () => {
          set((s) => ({
            files: s.files.map((f) => (f.id === id ? { ...f, status: prevStatus } : f)),
          }));
          saveDataStoreDebounced(get());
        },
        redo: () => {
          set((s) => ({
            files: s.files.map((f) => (f.id === id ? { ...f, status } : f)),
          }));
          saveDataStoreDebounced(get());
        },
      });

      set((s) => {
        const nextFiles = s.files.map((f) => (f.id === id ? { ...f, status } : f));
        return { files: nextFiles };
      });
      saveDataStoreDebounced(get());

      if (status === "deleted" || status === "compressed" || status === "archived") {
        const xpEarned = Math.max(5, Math.round(target.sizeGB * 10));
        get().awardXP(xpEarned, `${status} ${target.sizeGB.toFixed(1)} GB`);
      }

      if (showToast) {
        toast.success(`Action applied: ${status}`, {
          description: `${target.name} (${target.sizeGB.toFixed(1)} GB)`,
          action: {
            label: "Undo (10s)",
            onClick: () => useHistoryStore.getState().undo(),
          },
          duration: 10000,
        });
      }
    },

    batchSetFileStatus: (ids, status) => {
      const state = get();
      const affected = state.files.filter((f) => ids.includes(f.id));
      if (affected.length === 0) return;

      const prevMap = new Map(affected.map((f) => [f.id, f.status]));
      const history = useHistoryStore.getState();

      history.pushAction({
        id: `batch-file-${Date.now()}`,
        description: `Batch set ${affected.length} files to ${status}`,
        module: "dataDiet",
        undo: () => {
          set((s) => ({
            files: s.files.map((f) => (prevMap.has(f.id) ? { ...f, status: prevMap.get(f.id)! } : f)),
          }));
          saveDataStoreDebounced(get());
        },
        redo: () => {
          set((s) => ({
            files: s.files.map((f) => (ids.includes(f.id) ? { ...f, status } : f)),
          }));
          saveDataStoreDebounced(get());
        },
      });

      set((s) => ({
        files: s.files.map((f) => (ids.includes(f.id) ? { ...f, status } : f)),
      }));
      saveDataStoreDebounced(get());

      const totalGb = affected.reduce((sum, f) => sum + f.sizeGB, 0);
      const xpEarned = Math.round(totalGb * 10);
      get().awardXP(xpEarned, `Batch ${status} ${totalGb.toFixed(1)} GB`);

      toast.success(`Updated ${affected.length} files to ${status}`, {
        description: `${totalGb.toFixed(1)} GB processed`,
        action: {
          label: "Undo",
          onClick: () => useHistoryStore.getState().undo(),
        },
        duration: 10000,
      });
    },

    runDietRules: (rules, protectedFolders) => {
      let count = 0;
      let savedGb = 0;

      const nextFiles = get().files.map((file) => {
        // Check protected folders
        const isProtected = protectedFolders.some(
          (p) => file.folder === p || file.folder.startsWith(`${p}/`)
        );
        if (isProtected) return file;

        // Check active rules
        for (const rule of rules) {
          if (!rule.enabled) continue;
          if (rule.category !== "Any" && rule.category !== file.category) continue;

          let matches = false;
          if (rule.conditionType === "age_months" && file.ageMonths >= rule.thresholdValue) {
            matches = true;
          } else if (rule.conditionType === "size_mb" && file.sizeGB * 1024 >= rule.thresholdValue) {
            matches = true;
          } else if (
            rule.conditionType === "rarely_accessed" &&
            file.accessCount <= rule.thresholdValue &&
            file.lastAccessedDaysAgo >= (rule.thresholdDays || 30)
          ) {
            matches = true;
          }

          if (matches && file.status === "active") {
            count++;
            savedGb += file.sizeGB;
            return { ...file, status: rule.action as FileActionStatus };
          }
        }
        return file;
      });

      set({ files: nextFiles });
      saveDataStoreDebounced(get());

      if (count > 0) {
        get().awardXP(Math.round(savedGb * 10), `Rule engine applied to ${count} files`);
      }
      return { affectedCount: count, savedGb };
    },

    addFile: (file) => {
      const newFile: DigitalFile = {
        ...file,
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      set((s) => ({ files: [newFile, ...s.files] }));
      saveDataStoreDebounced(get());
      toast.success(`File added: ${newFile.name}`);
    },

    deleteFilePermanently: (id) => {
      set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
      saveDataStoreDebounced(get());
      toast.info("File removed from tracking");
    },

    updateFileTags: (id, tags) => {
      set((s) => ({
        files: s.files.map((f) => (f.id === id ? { ...f, tags } : f)),
      }));
      saveDataStoreDebounced(get());
    },

    updateFileNotes: (id, notes) => {
      set((s) => ({
        files: s.files.map((f) => (f.id === id ? { ...f, notes } : f)),
      }));
      saveDataStoreDebounced(get());
    },

    // Job Actions
    scheduleJob: (job) => {
      const newJob: ScheduledJob = {
        ...job,
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ jobs: [newJob, ...s.jobs] }));
      saveDataStoreDebounced(get());
      get().awardXP(25, `Scheduled job: ${newJob.name}`);
      toast.success(`Workload scheduled for ${String(newJob.scheduledSlotHour).padStart(2, "0")}:00`);
    },

    rescheduleJobSlot: (jobId, newSlotHour, calculatedCo2, savedCo2) => {
      const currentJob = get().jobs.find((j) => j.id === jobId);
      if (!currentJob) return;

      const prevSlot = currentJob.scheduledSlotHour;
      const prevCo2 = currentJob.estimatedCo2Grams;
      const prevSaved = currentJob.co2SavedGrams;

      useHistoryStore.getState().pushAction({
        id: `job-shift-${Date.now()}`,
        description: `Shift ${currentJob.name} to ${newSlotHour}:00`,
        module: "greenQueue",
        undo: () => {
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id === jobId
                ? { ...j, scheduledSlotHour: prevSlot, estimatedCo2Grams: prevCo2, co2SavedGrams: prevSaved }
                : j
            ),
          }));
          saveDataStoreDebounced(get());
        },
        redo: () => {
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id === jobId
                ? { ...j, scheduledSlotHour: newSlotHour, estimatedCo2Grams: calculatedCo2, co2SavedGrams: savedCo2 }
                : j
            ),
          }));
          saveDataStoreDebounced(get());
        },
      });

      set((s) => ({
        jobs: s.jobs.map((j) =>
          j.id === jobId
            ? { ...j, scheduledSlotHour: newSlotHour, estimatedCo2Grams: calculatedCo2, co2SavedGrams: savedCo2 }
            : j
        ),
      }));
      saveDataStoreDebounced(get());

      if (savedCo2 > 0) {
        get().awardXP(30, `Shifted to cleaner slot (${savedCo2} g CO₂ saved)`);
      }
      toast.success(`Job shifted to ${String(newSlotHour).padStart(2, "0")}:00`, {
        description: `Estimated footprint: ${Math.round(calculatedCo2)} g CO₂`,
      });
    },

    updateJobStatus: (jobId, status) => {
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
      }));
      saveDataStoreDebounced(get());
    },

    deleteJob: (jobId) => {
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== jobId) }));
      saveDataStoreDebounced(get());
      toast.info("Workload deleted");
    },

    // Device Actions
    addDevice: (device) => {
      const newDev: DeviceItem = {
        ...device,
        id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      set((s) => ({ devices: [newDev, ...s.devices] }));
      saveDataStoreDebounced(get());
      get().awardXP(50, `Registered device: ${newDev.name}`);
      toast.success(`Device added to Passport: ${newDev.name}`);
    },

    updateDevice: (id, patch) => {
      set((s) => ({
        devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      }));
      saveDataStoreDebounced(get());
    },

    logDeviceMaintenance: (deviceId, entry) => {
      const logItem = {
        ...entry,
        id: `m-${Date.now()}`,
      };
      set((s) => ({
        devices: s.devices.map((d) => {
          if (d.id !== deviceId) return d;
          return {
            ...d,
            healthPercent: Math.min(100, d.healthPercent + 10),
            lastMaintenanceDate: entry.date,
            maintenanceHistory: [logItem, ...d.maintenanceHistory],
            lifecycleTimeline: [
              {
                id: `lc-${Date.now()}`,
                date: entry.date,
                title: "Maintenance / Service Performed",
                type: "repair",
                description: entry.action,
              },
              ...d.lifecycleTimeline,
            ],
          };
        }),
      }));
      saveDataStoreDebounced(get());
      get().awardXP(50, `Logged maintenance (+${entry.co2SavedKg} kg CO₂ saved)`);
      toast.success("Maintenance logged & health improved!");
    },

    addLifecycleMilestone: (deviceId, milestone) => {
      const item = { ...milestone, id: `lc-${Date.now()}` };
      set((s) => ({
        devices: s.devices.map((d) =>
          d.id === deviceId
            ? { ...d, lifecycleTimeline: [item, ...d.lifecycleTimeline] }
            : d
        ),
      }));
      saveDataStoreDebounced(get());
      toast.success("Lifecycle milestone added");
    },

    toggleChecklistAnswer: (deviceId, checkId, checked) => {
      set((s) => ({
        devices: s.devices.map((d) => {
          if (d.id !== deviceId) return d;
          return {
            ...d,
            checklistAnswers: { ...d.checklistAnswers, [checkId]: checked },
          };
        }),
      }));
      saveDataStoreDebounced(get());
    },

    deleteDevice: (id) => {
      set((s) => ({ devices: s.devices.filter((d) => d.id !== id) }));
      saveDataStoreDebounced(get());
      toast.info("Device removed from passport");
    },

    // Goals & Gamification
    addGoal: (goal) => {
      const newGoal: SustainabilityGoal = {
        ...goal,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
        streakDays: 1,
      };
      set((s) => ({ goals: [newGoal, ...s.goals] }));
      saveDataStoreDebounced(get());
      toast.success(`Goal created: ${newGoal.title}`);
    },

    updateGoalProgress: (id, addValue) => {
      set((s) => ({
        goals: s.goals.map((g) => {
          if (g.id !== id) return g;
          const nextVal = g.currentValue + addValue;
          const isDone = nextVal >= g.targetValue;
          if (isDone && !g.completed) {
            fireConfetti();
            toast.success(`🎉 Goal Completed: ${g.title}!`, {
              description: `+${g.xpReward} XP earned!`,
            });
            get().awardXP(g.xpReward, `Completed goal: ${g.title}`);
          }
          return {
            ...g,
            currentValue: nextVal,
            completed: isDone,
            completedAt: isDone ? new Date().toISOString() : g.completedAt,
          };
        }),
      }));
      saveDataStoreDebounced(get());
    },

    completeGoal: (id) => {
      const target = get().goals.find((g) => g.id === id);
      if (!target || target.completed) return;

      fireCelebration();
      set((s) => ({
        goals: s.goals.map((g) =>
          g.id === id
            ? { ...g, completed: true, currentValue: g.targetValue, completedAt: new Date().toISOString() }
            : g
        ),
      }));
      saveDataStoreDebounced(get());
      get().awardXP(target.xpReward, `Completed goal: ${target.title}`);
      toast.success(`🏆 Milestone Unlocked: ${target.title}!`, {
        description: `+${target.xpReward} XP awarded. Keep leading the way!`,
      });
    },

    awardXP: (amount, reason) => {
      set((s) => {
        const nextXP = s.xp + amount;
        return { xp: nextXP };
      });
      saveDataStoreDebounced(get());
      get().checkBadges();
      if (reason) {
        toast.info(`+${amount} XP`, { description: reason });
      }
    },

    checkBadges: () => {
      const state = get();
      let newlyUnlocked = false;

      const nextBadges = state.badges.map((b) => {
        if (b.unlocked) return b;
        let shouldUnlock = false;

        if (b.id === "badge-night-owl" && state.jobs.some((j) => (j.scheduledSlotHour <= 5 || j.scheduledSlotHour >= 23))) {
          shouldUnlock = true;
        } else if (b.id === "badge-carbon-slayer" && state.xp >= 2000) {
          shouldUnlock = true;
        } else if (b.id === "badge-streak-flame" && state.streakDays >= 14) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          newlyUnlocked = true;
          fireConfetti();
          toast.success(`🎖️ Badge Unlocked: ${b.title}!`, {
            description: b.description,
          });
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString(), progressPercent: 100 };
        }
        return b;
      });

      if (newlyUnlocked) {
        set({ badges: nextBadges });
        saveDataStoreDebounced(get());
      }
    },

    resetAllData: () => {
      set({
        files: INITIAL_FILES,
        jobs: INITIAL_JOBS,
        devices: INITIAL_DEVICES,
        goals: INITIAL_GOALS,
        badges: INITIAL_BADGES,
        xp: 1850,
        streakDays: 7,
      });
      localStorage.removeItem(DATA_STORE_STORAGE_KEY);
      toast.success("Demo data reset to default");
    },
  };
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function saveDataStoreDebounced(state: DataStoreState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload = {
        files: state.files,
        jobs: state.jobs,
        devices: state.devices,
        goals: state.goals,
        badges: state.badges,
        xp: state.xp,
        streakDays: state.streakDays,
      };
      localStorage.setItem(DATA_STORE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not write dataStore to localStorage:", e);
    }
  }, 300);
}
