export type UsageMode = "personal" | "student" | "organization";

export type RegionId = "us-average" | "eu-average" | "india" | "uk" | "nordics" | "custom";

export interface RegionConfig {
  id: RegionId;
  label: string;
  intensityGramsPerKwh: number;
}

export type AccentColor = "leaf" | "teal" | "ocean" | "amber" | "plum";

// Units & Display Settings
export interface UnitsSettings {
  weight: "kg" | "g" | "lb";
  energy: "kWh" | "MWh";
  storage: "GB" | "TB" | "MB";
  timeFormat: "12h" | "24h";
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  currency: "USD" | "EUR" | "INR" | "GBP";
  pricePerKwh: number;
}

// Scoring Weights
export interface ScoringWeights {
  dataDiet: number;
  greenQueue: number;
  devices: number;
}

// Data Diet Rules
export type RuleAction = "keep" | "compress" | "archive" | "delete";

export type RuleConditionType = "age_months" | "size_mb" | "rarely_accessed";

export interface DietRule {
  id: string;
  name: string;
  category: string; // "Any" or specific category
  conditionType: RuleConditionType;
  thresholdValue: number; // e.g., 12 months, 100 MB, or 2 opens
  thresholdDays?: number; // for rarely accessed, e.g., in 30 days
  action: RuleAction;
  enabled: boolean;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  defaultAction: RuleAction;
}

// GreenQueue Configuration
export interface CustomHourlyIntensity {
  hour: number; // 0 - 23
  gramsCo2PerKwh: number;
}

export interface CustomJobType {
  id: string;
  name: string;
  defaultPowerKw: number;
  defaultDurationHours: number;
  defaultDeadlineHours: number;
  maxAcceptableDelayHours: number;
}

export interface GreenQueueSettings {
  profileId: RegionId;
  customHourlyIntensity: number[]; // 24 numbers for 0-23 hours
  workingHours: {
    start: number; // 0 - 23
    end: number; // 0 - 23
    daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  quietHours: {
    start: number; // 0 - 23
    end: number; // 0 - 23
    enabled: boolean;
  };
  customJobTypes: CustomJobType[];
  autoShift: boolean;
}

// Devices & E-Waste Passport Configuration
export interface DeviceTypeConfig {
  id: string;
  name: string;
  expectedLifeYears: number;
  maintenanceIntervalMonths: number;
  icon: string;
  embodiedCarbonKg: number;
}

export interface PassportCustomFieldDef {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

export interface PassportChecklistItemDef {
  id: string;
  label: string;
  category: "maintenance" | "weee_compliance" | "security" | "refurbish";
  defaultChecked: boolean;
}

export interface DevicesSettings {
  deviceTypes: DeviceTypeConfig[];
  checklistItems: PassportChecklistItemDef[];
  customFields: PassportCustomFieldDef[];
  trackWarranty: boolean;
  maintenanceReminderDays: number;
}

// Appearance Settings
export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  accent: AccentColor;
  density: "comfortable" | "compact";
  textSize: "small" | "medium" | "large";
  reduceMotion: boolean;
}

// Notification Channel & Triggers
export interface NotificationChannelSettings {
  inAppToasts: boolean;
  notificationCenter: boolean;
  browser: boolean;
  emailDigest: "off" | "daily" | "weekly";
  mobilePush: boolean;
}

export interface NotificationTriggerSettings {
  // Data Diet
  scanFinished: boolean;
  newDuplicatesFound: boolean;
  storageGrowing: boolean;
  storageThresholdGb: number;
  monthlyCleanupReminder: boolean;
  downloadsGrowing: boolean;
  downloadsThresholdGb: number;
  recommendedActionsWaiting: boolean;
  
  // GreenQueue
  greenerWindowStarting: boolean;
  greenerWindowMinutes: number;
  jobAboutToStart: boolean;
  jobRunning: boolean;
  jobFinished: boolean;
  jobDeadlineMissed: boolean;
  carbonIntensityAlert: boolean;
  weeklyCarbonSummary: boolean;
  
  // Devices
  maintenanceDue: boolean;
  maintenanceDueDays: number;
  warrantyEnding: boolean;
  warrantyEndingDays: number;
  eolApproaching: boolean;
  reuseRefurbishOpportunity: boolean;
  weeeComplianceReminder: boolean;
  recyclingPickupReminder: boolean;

  // Score & Goals
  scoreChanged: boolean;
  scoreChangeDelta: number;
  goalMilestone: boolean;
  goalDeadlineApproaching: boolean;
  streakAtRisk: boolean;
  badgeUnlocked: boolean;
  weeklyImpactSummary: boolean;
  monthlyImpactSummary: boolean;
}

export interface CustomReminder {
  id: string;
  title: string;
  message: string;
  dateTime: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  targetType?: "file" | "job" | "device";
  targetId?: string;
  completed: boolean;
}

export interface NotificationSettings {
  masterEnabled: boolean;
  channels: NotificationChannelSettings;
  triggers: NotificationTriggerSettings;
  moduleToggles: {
    dataDiet: boolean;
    greenQueue: boolean;
    devices: boolean;
    goals: boolean;
  };
  priorityFilter: "all" | "suggestion" | "warning" | "critical";
  quietHours: {
    start: number;
    end: number;
    enabled: boolean;
  };
  digestTime: string; // e.g., "08:00"
  templates: {
    storageAlert: string;
    greenWindow: string;
    deviceMaintenance: string;
    goalMilestone: string;
  };
  customReminders: CustomReminder[];
}

// Master Settings Structure
export interface AppSettings {
  version: number;
  general: {
    displayName: string;
    usageMode: UsageMode;
    region: RegionId;
    customRegionIntensity: number;
  };
  units: UnitsSettings;
  scoring: ScoringWeights;
  dataDiet: {
    rules: DietRule[];
    protectedFolders: string[];
    protectedExtensions: string[];
    categories: CustomCategory[];
  };
  greenQueue: GreenQueueSettings;
  devices: DevicesSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
}

// Files & Data Storage
export type FileActionStatus = "active" | "kept" | "compressed" | "archived" | "deleted";

export interface DigitalFile {
  id: string;
  name: string;
  folder: string;
  category: string;
  sizeBytes: number;
  sizeGB: number;
  lastModified: string;
  ageMonths: number;
  accessCount: number;
  lastAccessedDaysAgo: number;
  status: FileActionStatus;
  tags: string[];
  notes?: string;
  carbonGramsAnnual: number;
  isDuplicate?: boolean;
  duplicateGroupId?: string;
}

// Workloads / Jobs
export type JobStatus = "queued" | "scheduled" | "running" | "completed" | "cancelled";

export interface ScheduledJob {
  id: string;
  name: string;
  workloadType: string;
  powerKw: number;
  durationHours: number;
  deadlineHour: number; // 0 - 23 (or timestamp)
  scheduledSlotHour: number; // 0 - 23
  status: JobStatus;
  estimatedCo2Grams: number;
  co2SavedGrams: number;
  costEstimated: number;
  priority: "low" | "medium" | "high";
  tags: string[];
  notes?: string;
  createdAt: string;
}

// Devices & E-Waste Passport
export type DeviceHealthStatus = "excellent" | "good" | "fair" | "needs_attention" | "end_of_life" | "recycled";

export interface MaintenanceLogEntry {
  id: string;
  date: string;
  action: string;
  technicianOrNotes: string;
  cost: number;
  co2SavedKg: number;
}

export interface LifecycleMilestone {
  id: string;
  date: string;
  title: string;
  type: "purchase" | "upgrade" | "battery" | "repair" | "audit" | "recycle";
  description: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  deviceTypeId: string;
  serialNumber?: string;
  purchaseDate: string;
  expectedLifeYears: number;
  currentAgeYears: number;
  healthPercent: number;
  status: DeviceHealthStatus;
  lastMaintenanceDate?: string;
  warrantyExpiryDate?: string;
  embodiedCarbonKg: number;
  annualOperationalCarbonKg: number;
  weightKg: number;
  maintenanceHistory: MaintenanceLogEntry[];
  lifecycleTimeline: LifecycleMilestone[];
  customFieldValues: Record<string, string | number | boolean>;
  checklistAnswers: Record<string, boolean>;
  tags: string[];
  notes?: string;
}

// Notifications Item
export type NotificationPriority = "info" | "suggestion" | "warning" | "critical";
export type NotificationModule = "dataDiet" | "greenQueue" | "devices" | "goals" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  module: NotificationModule;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  channel: "in_app" | "browser" | "email" | "push";
  actionType?: "deep_link" | "inline_button";
  deepLinkTarget?: {
    tab: "home" | "dataDiet" | "greenQueue" | "devices" | "settings" | "profile";
    itemId?: string;
  };
  inlineActions?: {
    label: string;
    actionKey: "schedule_cleanest" | "archive_file" | "snooze" | "dismiss";
    payload?: Record<string, unknown>;
  }[];
  wasOffline?: boolean;
}

// Gamification: XP, Badges, Streaks, Goals
export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: "storage" | "compute" | "devices" | "streak" | "mastery";
  tier: BadgeTier;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export interface SustainabilityGoal {
  id: string;
  title: string;
  description?: string;
  module: "dataDiet" | "greenQueue" | "devices" | "general";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
  completedAt?: string;
  streakDays: number;
  xpReward: number;
  isTemplate?: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  mode: UsageMode;
  score: number;
  xp: number;
  co2SavedKg: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

// Undo/Redo Action History
export interface HistoryAction {
  id: string;
  description: string;
  timestamp: number;
  module: "dataDiet" | "greenQueue" | "devices";
  undo: () => void;
  redo: () => void;
}
