import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  X,
  GripVertical,
  SlidersHorizontal,
  Check,
  Eye,
  Bell,
  Sparkles,
  Zap,
  HardDrive,
  Laptop,
  Palette,
  Shield,
  FileText,
  Clock,
  ChevronDown,
  Sun,
  Moon,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useDataStore } from "@/lib/store/dataStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useProfile, useSaveProfile, REGIONS, modeLabels } from "@/lib/profile";
import {
  DEFAULT_APP_SETTINGS,
  rebalanceScoringWeights,
  type DEFAULT_RULES,
} from "@/lib/settings";
import {
  calculateCompositeScore,
  formatCarbonValue,
  formatStorageValue,
  formatCurrencyValue,
  REGIONAL_GRID_PROFILES,
} from "@/lib/services/CarbonCalculator";
import type {
  AppSettings,
  DietRule,
  RuleAction,
  RuleConditionType,
  AccentColor,
  CustomJobType,
  DeviceTypeConfig,
  PassportChecklistItemDef,
  PassportCustomFieldDef,
  CustomCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GreenPulse" },
      { name: "description", content: "Customize scoring, Data Diet rules, GreenQueue, hardware passports and notifications." },
    ],
  }),
  component: SettingsPage,
});

const TABS = [
  { id: "general", label: "1. General" },
  { id: "scoring", label: "2. Scoring" },
  { id: "diet", label: "3. Data Diet Rules" },
  { id: "queue", label: "4. GreenQueue" },
  { id: "devices", label: "5. Devices" },
  { id: "units", label: "6. Units & Display" },
  { id: "appearance", label: "7. Appearance" },
  { id: "data", label: "8. Data & Privacy" },
] as const;

function SettingsPage() {
  const { settings, patchSettings, resetSettings, isSaving } = useSettingsStore();
  const data = useDataStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-shell px-3 py-6 font-sans text-foreground md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-phone md:p-8">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-semibold text-muted-foreground">
            {isSaving ? "Saving to account…" : "All changes saved locally & synced"}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            User-Defined Settings & Preferences
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure every parameter of your digital carbon optimizer across 8 dedicated tabs.
          </p>
        </div>

        {/* 8 Tabs Navigation */}
        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1.5 rounded-xl border border-border/60">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="text-xs font-bold px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <GeneralSettingsTab />
          </TabsContent>

          <TabsContent value="scoring" className="mt-6 space-y-6">
            <ScoringSettingsTab />
          </TabsContent>

          <TabsContent value="diet" className="mt-6 space-y-6">
            <DataDietRulesTab />
          </TabsContent>

          <TabsContent value="queue" className="mt-6 space-y-6">
            <GreenQueueSettingsTab />
          </TabsContent>

          <TabsContent value="devices" className="mt-6 space-y-6">
            <DevicesSettingsTab />
          </TabsContent>

          <TabsContent value="units" className="mt-6 space-y-6">
            <UnitsDisplayTab />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6 space-y-6">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="data" className="mt-6 space-y-6">
            <DataPrivacyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 1: GENERAL
 * ------------------------------------------------------------- */
function GeneralSettingsTab() {
  const { settings, patchSettings } = useSettingsStore();
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState(settings.general.displayName);
  const [mode, setMode] = useState(settings.general.usageMode);
  const [region, setRegion] = useState(settings.general.region);
  const [customIntensity, setCustomIntensity] = useState(settings.general.customRegionIntensity);

  const handleSave = () => {
    patchSettings({
      general: {
        displayName: name.trim(),
        usageMode: mode,
        region,
        customRegionIntensity: customIntensity,
      },
    });
    saveProfile.mutate({
      display_name: name.trim(),
      usage_mode: mode,
      region,
    });
    toast.success("General settings updated!");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">User Profile & Usage Mode</h3>
        <p className="text-xs text-muted-foreground">
          Usage mode adapts labels throughout the application (e.g. "Devices" vs "Lab Assets").
        </p>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Your Name / Organization</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Usage Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(["personal", "student", "organization"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    mode === m
                      ? "border-primary bg-primary-soft text-primary font-bold shadow-2xs"
                      : "border-border bg-muted/20 hover:bg-muted/40 text-foreground"
                  )}
                >
                  <div className="capitalize text-xs">{m} Mode</div>
                  <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                    {modeLabels(m).devices} & {modeLabels(m).jobs}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Region Selector */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Electricity Grid Profile</h3>
        <p className="text-xs text-muted-foreground">
          Select your local electrical grid to calibrate carbon emission computations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Grid Region</Label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {region === "custom" && (
            <div className="space-y-1">
              <Label className="text-xs font-bold">Custom Grid Intensity (g CO₂ / kWh)</Label>
              <Input
                type="number"
                min={10}
                max={2000}
                value={customIntensity}
                onChange={(e) => setCustomIntensity(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleSave} className="font-bold">
        Save General Settings
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 2: SCORING
 * ------------------------------------------------------------- */
function ScoringSettingsTab() {
  const { settings, setScoringWeight, resetSettings } = useSettingsStore();
  const { files, jobs, devices } = useDataStore();

  const w = settings.scoring;

  const storageHealth = Math.min(100, Math.max(20, 100 - files.filter((f) => f.status === "active").length * 2.5));
  const computeHealth = Math.min(100, Math.max(30, 70 + jobs.filter((j) => j.status === "completed").length * 8));
  const deviceHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );

  const liveScore = calculateCompositeScore(storageHealth, computeHealth, deviceHealth, w);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Scoring Weights & Auto-Normalization</h3>
            <p className="text-xs text-muted-foreground">
              Sliders auto-balance so their sum equals exactly 100%. Watch the live score recalculate instantly.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => resetSettings()} className="h-7 text-xs font-semibold">
            <RotateCcw className="mr-1 size-3" /> Reset Defaults
          </Button>
        </div>

        {/* Live Score Preview Box with Delta Chip */}
        <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary-soft/40 p-4">
          <div className="grid size-16 place-items-center rounded-xl bg-primary text-primary-foreground text-2xl font-extrabold font-mono shadow-xs">
            {liveScore}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground">Composite Sustainability Score</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                100% Normalized
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Data Diet ({w.dataDiet}%) · GreenQueue ({w.greenQueue}%) · Hardware Passport ({w.devices}%)
            </p>
          </div>
        </div>

        {/* 3 Auto-normalizing sliders */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">Data Diet (Storage Weight)</span>
              <span className="font-bold text-blue-500 font-mono">{w.dataDiet}%</span>
            </div>
            <Slider
              value={[w.dataDiet]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("dataDiet", v ?? 35)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">GreenQueue (Compute Workload Weight)</span>
              <span className="font-bold text-amber-500 font-mono">{w.greenQueue}%</span>
            </div>
            <Slider
              value={[w.greenQueue]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("greenQueue", v ?? 35)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">E-Waste Passport (Hardware Life Weight)</span>
              <span className="font-bold text-purple-500 font-mono">{w.devices}%</span>
            </div>
            <Slider
              value={[w.devices]}
              max={100}
              step={1}
              onValueChange={([v]) => setScoringWeight("devices", v ?? 30)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 3: DATA DIET RULES
 * ------------------------------------------------------------- */
function DataDietRulesTab() {
  const { settings, patchSettings } = useSettingsStore();
  const setRuleRunnerOpen = useDataStore((s) => useUIStore.getState().setRuleRunnerOpen);

  const rules = settings.dataDiet.rules;
  const categories = settings.dataDiet.categories;
  const protectedFolders = settings.dataDiet.protectedFolders;

  const [newFolderName, setNewFolderName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  const updateRules = (next: DietRule[]) => {
    patchSettings({
      dataDiet: {
        ...settings.dataDiet,
        rules: next,
      },
    });
  };

  const handleAddRule = () => {
    const newRule: DietRule = {
      id: `r-${Date.now()}`,
      name: "Custom Cleanup Rule",
      category: "Any",
      conditionType: "age_months",
      thresholdValue: 12,
      action: "archive",
      enabled: true,
    };
    updateRules([...rules, newRule]);
  };

  const handleMoveRule = (from: number, to: number) => {
    if (to < 0 || to >= rules.length) return;
    const list = [...rules];
    const [item] = list.splice(from, 1);
    if (item) list.splice(to, 0, item);
    updateRules(list);
  };

  const handleAddProtectedFolder = () => {
    if (!newFolderName.trim()) return;
    const clean = newFolderName.trim().replace(/\/$/, "");
    if (protectedFolders.includes(clean)) return;
    patchSettings({
      dataDiet: {
        ...settings.dataDiet,
        protectedFolders: [...protectedFolders, clean],
      },
    });
    setNewFolderName("");
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const clean = newCatName.trim();
    if (categories.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return;

    const newCat: CustomCategory = {
      id: `cat-${Date.now()}`,
      name: clean,
      color: newCatColor,
      defaultAction: "compress",
    };
    patchSettings({
      dataDiet: {
        ...settings.dataDiet,
        categories: [...categories, newCat],
      },
    });
    setNewCatName("");
  };

  return (
    <div className="space-y-6">
      {/* Rule Builder Section */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">IF / THEN Rule Builder</h3>
            <p className="text-xs text-muted-foreground">
              Evaluated top to bottom. Move rules up or down to set priority.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => useUIStore.getState().setRuleRunnerOpen(true)}
              className="h-7 text-xs font-bold"
            >
              Run Rules Now
            </Button>
            <Button size="sm" onClick={handleAddRule} className="h-7 text-xs font-bold gap-1">
              <Plus className="size-3" /> Add Rule
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-2.5 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-0.5">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveRule(idx, idx - 1)}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <MoveUp className="size-3" />
                </button>
                <button
                  disabled={idx === rules.length - 1}
                  onClick={() => handleMoveRule(idx, idx + 1)}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <MoveDown className="size-3" />
                </button>
              </div>

              <span className="font-extrabold text-primary">IF</span>

              {/* Category */}
              <select
                value={rule.category}
                onChange={(e) =>
                  updateRules(
                    rules.map((r) => (r.id === rule.id ? { ...r, category: e.target.value } : r))
                  )
                }
                className="h-7 rounded border border-input bg-background px-2 text-xs font-medium text-foreground"
              >
                <option value="Any">Any Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Condition type */}
              <select
                value={rule.conditionType}
                onChange={(e) =>
                  updateRules(
                    rules.map((r) =>
                      r.id === rule.id
                        ? { ...r, conditionType: e.target.value as RuleConditionType }
                        : r
                    )
                  )
                }
                className="h-7 rounded border border-input bg-background px-2 text-xs font-medium text-foreground"
              >
                <option value="age_months">Not modified in [N] months</option>
                <option value="size_mb">Size is larger than [N] MB</option>
                <option value="rarely_accessed">Rarely accessed (&le; [N] opens)</option>
              </select>

              {/* Threshold */}
              <Input
                type="number"
                min={1}
                value={rule.thresholdValue}
                onChange={(e) =>
                  updateRules(
                    rules.map((r) =>
                      r.id === rule.id ? { ...r, thresholdValue: Number(e.target.value) } : r
                    )
                  )
                }
                className="h-7 w-16 text-xs font-mono"
              />

              <span className="font-extrabold text-primary">THEN</span>

              {/* Action */}
              <select
                value={rule.action}
                onChange={(e) =>
                  updateRules(
                    rules.map((r) =>
                      r.id === rule.id ? { ...r, action: e.target.value as RuleAction } : r
                    )
                  )
                }
                className="h-7 rounded border border-input bg-background px-2 text-xs font-bold text-foreground"
              >
                <option value="keep">Keep</option>
                <option value="compress">Compress</option>
                <option value="archive">Archive</option>
                <option value="delete">Delete (Purge)</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(c) =>
                    updateRules(rules.map((r) => (r.id === rule.id ? { ...r, enabled: c } : r)))
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => updateRules(rules.filter((r) => r.id !== rule.id))}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protected Folders */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Protected Folders (Always Kept Safe)</h3>
        <p className="text-xs text-muted-foreground">
          Files in these folders will never be suggested for deletion or compression.
        </p>

        <div className="flex flex-wrap gap-2">
          {protectedFolders.map((folder) => (
            <span
              key={folder}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              📁 {folder}
              <button
                onClick={() =>
                  patchSettings({
                    dataDiet: {
                      ...settings.dataDiet,
                      protectedFolders: protectedFolders.filter((f) => f !== folder),
                    },
                  })
                }
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProtectedFolder();
          }}
          className="flex gap-2 pt-1"
        >
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="e.g. Documents/Legal or Photos/Weddings"
            className="h-8 text-xs flex-1"
          />
          <Button type="submit" variant="outline" size="sm" className="h-8 text-xs font-bold">
            <Plus className="mr-1 size-3" /> Protect Folder
          </Button>
        </form>
      </div>

      {/* Custom Categories */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Custom Storage Categories</h3>
        <p className="text-xs text-muted-foreground">
          Define custom tags, category color markers, and default actions.
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs shadow-2xs"
            >
              <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="font-bold text-foreground">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">
                ({cat.defaultAction})
              </span>
              <button
                onClick={() =>
                  patchSettings({
                    dataDiet: {
                      ...settings.dataDiet,
                      categories: categories.filter((c) => c.id !== cat.id),
                    },
                  })
                }
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category Name (e.g. Design Raw)"
            className="h-8 text-xs flex-1"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-input p-0.5 bg-background"
          />
          <Button onClick={handleAddCategory} variant="outline" size="sm" className="h-8 text-xs font-bold">
            <Plus className="mr-1 size-3" /> Add Category
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 4: GREENQUEUE
 * ------------------------------------------------------------- */
function GreenQueueSettingsTab() {
  const { settings, patchSettings } = useSettingsStore();
  const queue = settings.greenQueue;

  const [quietStart, setQuietStart] = useState(queue.quietHours.start);
  const [quietEnd, setQuietEnd] = useState(queue.quietHours.end);
  const [quietEnabled, setQuietEnabled] = useState(queue.quietHours.enabled);
  const [autoShift, setAutoShift] = useState(queue.autoShift);

  const [hourlyIntensities, setHourlyIntensities] = useState<number[]>(
    queue.customHourlyIntensity?.length === 24
      ? queue.customHourlyIntensity
      : REGIONAL_GRID_PROFILES[queue.profileId]?.hourlyProfile || REGIONAL_GRID_PROFILES["eu-average"].hourlyProfile
  );

  const [customJobs, setCustomJobs] = useState<CustomJobType[]>(queue.customJobTypes);
  const [newJobName, setNewJobName] = useState("");
  const [newJobPower, setNewJobPower] = useState(1.0);
  const [newJobDuration, setNewJobDuration] = useState(2);

  const handleSaveProfile = () => {
    patchSettings({
      greenQueue: {
        ...queue,
        customHourlyIntensity: hourlyIntensities,
        quietHours: {
          start: quietStart,
          end: quietEnd,
          enabled: quietEnabled,
        },
        autoShift,
        customJobTypes: customJobs,
      },
    });
    toast.success("GreenQueue profile & custom intensity saved!");
  };

  const handleAddJobType = () => {
    if (!newJobName.trim()) return;
    const newType: CustomJobType = {
      id: `job-${Date.now()}`,
      name: newJobName.trim(),
      defaultPowerKw: newJobPower,
      defaultDurationHours: newJobDuration,
      defaultDeadlineHours: 22,
      maxAcceptableDelayHours: 6,
    };
    setCustomJobs([...customJobs, newType]);
    setNewJobName("");
  };

  return (
    <div className="space-y-6">
      {/* 24-Hour Intensity Editor */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Interactive 24-Hour Carbon Intensity Curve</h3>
            <p className="text-xs text-muted-foreground">
              Adjust hourly carbon emission factors (g CO₂/kWh) across the 24-hour cycle.
            </p>
          </div>
          <Button size="sm" onClick={handleSaveProfile} className="h-7 text-xs font-bold">
            Save Curve
          </Button>
        </div>

        {/* 24 Hour Sliders Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 text-center text-xs">
          {hourlyIntensities.map((val, h) => (
            <div key={h} className="rounded-lg border border-border bg-muted/20 p-2 space-y-1">
              <span className="font-mono text-[10px] font-bold text-muted-foreground">
                {String(h).padStart(2, "0")}h
              </span>
              <div className="text-xs font-extrabold font-mono text-foreground">{val}</div>
              <input
                type="range"
                min={20}
                max={900}
                step={10}
                value={val}
                onChange={(e) => {
                  const next = [...hourlyIntensities];
                  next[h] = Number(e.target.value);
                  setHourlyIntensities(next);
                }}
                className="h-1.5 w-full cursor-pointer accent-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours & Working Hours */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Quiet Hours & Automation</h3>
        <p className="text-xs text-muted-foreground">
          Define when heavy batch jobs must NOT be scheduled to avoid heat or noise disruptions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Quiet Hours Start</Label>
            <select
              value={quietStart}
              onChange={(e) => setQuietStart(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Quiet Hours End</Label>
            <select
              value={quietEnd}
              onChange={(e) => setQuietEnd(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 mt-auto">
            <div>
              <span className="font-bold text-foreground block text-xs">Enforce Quiet Hours</span>
              <span className="text-[10px] text-muted-foreground">Block jobs during quiet time</span>
            </div>
            <Switch checked={quietEnabled} onCheckedChange={setQuietEnabled} />
          </div>
        </div>
      </div>

      {/* Custom Job Types */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Custom Compute Workload Types</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {customJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs shadow-2xs"
            >
              <div>
                <span className="font-bold text-foreground block">{job.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {job.defaultPowerKw} kW · {job.defaultDurationHours} hrs · Max delay {job.maxAcceptableDelayHours}h
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => setCustomJobs(customJobs.filter((j) => j.id !== job.id))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Input
            value={newJobName}
            onChange={(e) => setNewJobName(e.target.value)}
            placeholder="New Workload Name (e.g. 3D Blender Bake)"
            className="h-8 text-xs flex-1 min-w-40"
          />
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={newJobPower}
            onChange={(e) => setNewJobPower(Number(e.target.value))}
            placeholder="kW"
            className="h-8 w-20 text-xs font-mono"
          />
          <Input
            type="number"
            min={1}
            value={newJobDuration}
            onChange={(e) => setNewJobDuration(Number(e.target.value))}
            placeholder="Hours"
            className="h-8 w-20 text-xs font-mono"
          />
          <Button onClick={handleAddJobType} variant="outline" size="sm" className="h-8 text-xs font-bold">
            <Plus className="mr-1 size-3" /> Add Workload Type
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 5: DEVICES
 * ------------------------------------------------------------- */
function DevicesSettingsTab() {
  const { settings, patchSettings } = useSettingsStore();
  const devSettings = settings.devices;

  const [newChecklistText, setNewChecklistText] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "boolean">("text");

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    const item: PassportChecklistItemDef = {
      id: `chk-${Date.now()}`,
      label: newChecklistText.trim(),
      category: "maintenance",
      defaultChecked: false,
    };
    patchSettings({
      devices: {
        ...devSettings,
        checklistItems: [...devSettings.checklistItems, item],
      },
    });
    setNewChecklistText("");
    toast.success("Checklist item added");
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const field: PassportCustomFieldDef = {
      id: `f-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      required: false,
    };
    patchSettings({
      devices: {
        ...devSettings,
        customFields: [...devSettings.customFields, field],
      },
    });
    setNewFieldName("");
    toast.success("Passport custom field added");
  };

  return (
    <div className="space-y-6">
      {/* Device Types Defaults */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Device Types & Expected Lifespan Defaults</h3>
        <p className="text-xs text-muted-foreground">
          Configure expected operational lifespan in years and embodied carbon baselines.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
          {devSettings.deviceTypes.map((type) => (
            <div key={type.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
              <span className="font-bold text-foreground block">{type.name}</span>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Default Lifespan:</span>
                <span className="font-bold font-mono text-foreground">{type.expectedLifeYears} Years</span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Embodied CO₂:</span>
                <span className="font-bold font-mono text-foreground">{type.embodiedCarbonKg} kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Passport Custom Checklist Items */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">WEEE & Maintenance Passport Checklist</h3>
        <p className="text-xs text-muted-foreground">
          Checklist items used for device audits, health grading, and refurbishment certification.
        </p>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {devSettings.checklistItems.map((chk) => (
            <div
              key={chk.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-2 text-xs"
            >
              <span className="font-medium text-foreground">{chk.label}</span>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-muted-foreground hover:text-destructive"
                onClick={() =>
                  patchSettings({
                    devices: {
                      ...devSettings,
                      checklistItems: devSettings.checklistItems.filter((i) => i.id !== chk.id),
                    },
                  })
                }
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddChecklist();
          }}
          className="flex gap-2 pt-1"
        >
          <Input
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            placeholder="New checklist requirement (e.g. Inspect CMOS battery)"
            className="h-8 text-xs flex-1"
          />
          <Button type="submit" variant="outline" size="sm" className="h-8 text-xs font-bold">
            <Plus className="mr-1 size-3" /> Add Item
          </Button>
        </form>
      </div>

      {/* Custom Fields Builder */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Custom Passport Metadata Fields</h3>
        <p className="text-xs text-muted-foreground">
          Add custom tracking fields (e.g. QR code, department tag, warranty carrier).
        </p>

        <div className="flex flex-wrap gap-2">
          {devSettings.customFields.map((field) => (
            <span
              key={field.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground"
            >
              {field.name} ({field.type})
              <button
                onClick={() =>
                  patchSettings({
                    devices: {
                      ...devSettings,
                      customFields: devSettings.customFields.filter((f) => f.id !== field.id),
                    },
                  })
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Field Name (e.g. Inventory QR Code)"
            className="h-8 text-xs flex-1"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as any)}
            className="h-8 rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
          </select>
          <Button onClick={handleAddCustomField} variant="outline" size="sm" className="h-8 text-xs font-bold">
            <Plus className="mr-1 size-3" /> Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 6: UNITS & DISPLAY
 * ------------------------------------------------------------- */
function UnitsDisplayTab() {
  const { settings, patchSettings } = useSettingsStore();
  const u = settings.units;

  const updateUnits = (patch: Partial<AppSettings["units"]>) => {
    patchSettings({ units: { ...u, ...patch } });
    toast.success("Units updated");
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Measurement Units & Financial Rates</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <Label className="text-xs font-bold">Weight / Carbon Unit</Label>
          <select
            value={u.weight}
            onChange={(e) => updateUnits({ weight: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="lb">Pounds (lb)</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">Storage Unit</Label>
          <select
            value={u.storage}
            onChange={(e) => updateUnits({ storage: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="GB">Gigabytes (GB)</option>
            <option value="TB">Terabytes (TB)</option>
            <option value="MB">Megabytes (MB)</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">Energy Unit</Label>
          <select
            value={u.energy}
            onChange={(e) => updateUnits({ energy: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="kWh">Kilowatt-Hours (kWh)</option>
            <option value="MWh">Megawatt-Hours (MWh)</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">Currency</Label>
          <select
            value={u.currency}
            onChange={(e) => updateUnits({ currency: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="INR">₹ INR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">Electricity Price per kWh</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={u.pricePerKwh}
            onChange={(e) => updateUnits({ pricePerKwh: Number(e.target.value) })}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">Date Format</Label>
          <select
            value={u.dateFormat}
            onChange={(e) => updateUnits({ dateFormat: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 7: APPEARANCE
 * ------------------------------------------------------------- */
function AppearanceTab() {
  const { settings, patchSettings } = useSettingsStore();
  const a = settings.appearance;

  const ACCENT_PALETTES: { id: AccentColor; label: string; swatch: string }[] = [
    { id: "leaf", label: "Emerald Leaf", swatch: "oklch(0.52 0.105 160)" },
    { id: "teal", label: "Teal Cyan", swatch: "oklch(0.52 0.09 195)" },
    { id: "ocean", label: "Ocean Blue", swatch: "oklch(0.5 0.12 245)" },
    { id: "amber", label: "Solar Amber", swatch: "oklch(0.6 0.14 65)" },
    { id: "plum", label: "Plum Purple", swatch: "oklch(0.5 0.13 335)" },
  ];

  const update = (patch: Partial<AppSettings["appearance"]>) => {
    patchSettings({ appearance: { ...a, ...patch } });
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-5">
      <h3 className="text-sm font-bold text-foreground">Theme & Visual Palette</h3>

      {/* Theme Choice */}
      <div className="space-y-2">
        <Label className="text-xs font-bold">Theme Mode</Label>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "light" as const, label: "Light Theme", icon: Sun },
            { id: "dark" as const, label: "Dark Theme", icon: Moon },
            { id: "system" as const, label: "System Sync", icon: Sparkles },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => update({ theme: t.id })}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
                a.theme === t.id
                  ? "border-primary bg-primary-soft text-primary font-bold shadow-2xs"
                  : "border-border bg-muted/20 hover:bg-muted/40 text-foreground"
              )}
            >
              <t.icon className="size-4" />
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Palettes */}
      <div className="space-y-2">
        <Label className="text-xs font-bold">Accent Color Palette</Label>
        <div className="flex flex-wrap gap-3">
          {ACCENT_PALETTES.map((pal) => (
            <button
              key={pal.id}
              onClick={() => update({ accent: pal.id })}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-2.5 pr-4 text-xs font-bold transition-all",
                a.accent === pal.id
                  ? "border-primary bg-primary-soft shadow-xs ring-2 ring-primary"
                  : "border-border bg-card hover:bg-muted/40"
              )}
            >
              <span className="size-5 rounded-full shadow-2xs" style={{ background: pal.swatch }} />
              <span>{pal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density & Motion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <Label className="text-xs font-bold">Layout Density</Label>
          <select
            value={a.density}
            onChange={(e) => update({ density: e.target.value as any })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5 mt-auto">
          <div>
            <span className="font-bold text-foreground block text-xs">Reduce Motion</span>
            <span className="text-[10px] text-muted-foreground">Disable intensive animations</span>
          </div>
          <Switch checked={a.reduceMotion} onCheckedChange={(c) => update({ reduceMotion: c })} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * TAB 8: DATA & PRIVACY + NOTIFICATION LOG
 * ------------------------------------------------------------- */
function DataPrivacyTab() {
  const { settings, resetSettings } = useSettingsStore();
  const { files, jobs, devices, resetAllData } = useDataStore();
  const { history } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportAllJson = () => {
    const payload = {
      app: "GreenPulse",
      version: settings.version,
      exportedAt: new Date().toISOString(),
      settings,
      files,
      jobs,
      devices,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenpulse-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("All data exported as JSON");
  };

  const exportCsv = () => {
    const rows = [
      ["Type", "Name", "Metric", "Status", "Date"],
      ...files.map((f) => ["File", f.name, `${f.sizeGB} GB`, f.status, f.lastModified]),
      ...jobs.map((j) => ["Job", j.name, `${j.powerKw} kW`, j.status, j.createdAt]),
      ...devices.map((d) => ["Device", d.name, `${d.healthPercent}% health`, d.status, d.purchaseDate]),
    ];
    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenpulse-impact-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Impact report exported as CSV");
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.settings) throw new Error("Invalid GreenPulse backup file");
      useSettingsStore.getState().patchSettings(parsed.settings);
      toast.success("Settings restored from backup!");
    } catch (err) {
      toast.error("Could not parse JSON backup");
    }
  };

  return (
    <div className="space-y-6">
      {/* Export & Import */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Data Export & Portability</h3>
        <p className="text-xs text-muted-foreground">
          Your data is always 100% yours. Export full backups or printable impact reports anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <Button variant="outline" size="sm" onClick={exportAllJson} className="h-8 text-xs font-semibold gap-1.5">
            <Download className="size-3.5" /> Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Upload className="size-3.5" /> Import JSON
          </Button>

          <Button variant="outline" size="sm" onClick={exportCsv} className="h-8 text-xs font-semibold gap-1.5">
            <Download className="size-3.5" /> Export CSV Table
          </Button>

          <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold gap-1.5">
            <Link to="/report">
              <FileText className="size-3.5" /> Printable PDF Report
            </Link>
          </Button>

          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJson} />
        </div>
      </div>

      {/* Notification Delivery History Log */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Notification History Log</h3>
          <span className="text-[11px] text-muted-foreground">Last {history.length} logged events</span>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-1.5 font-bold">Timestamp</th>
                <th className="px-3 py-1.5 font-bold">Trigger / Message</th>
                <th className="px-3 py-1.5 font-bold">Channel</th>
                <th className="px-3 py-1.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-bold text-foreground block">{h.trigger}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-xs block">{h.message}</span>
                  </td>
                  <td className="px-3 py-2 text-[10px] uppercase font-mono">{h.channel}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset & Delete */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <h3 className="text-sm font-bold text-destructive">Danger Zone & Privacy</h3>

        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 text-foreground">
                <RotateCcw className="size-3.5" /> Reset Demo Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="font-sans">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This restores default files, workloads, and devices. Your profile settings will remain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData}>Reset Data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                <Trash2 className="size-3.5" /> Delete All My Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="font-sans">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes all your tracked files, custom rules, schedules, and device passports.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetSettings();
                    resetAllData();
                    toast.success("All data erased");
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
