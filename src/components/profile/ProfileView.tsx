import { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Building2,
  Globe,
  Save,
  Flame,
  Trophy,
  Leaf,
  HardDrive,
  Zap,
  Laptop,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useSaveProfile, REGIONS, modeLabels } from "@/lib/profile";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useDataStore } from "@/lib/store/dataStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();
  const { settings, patchSettings } = useSettingsStore();
  const { xp, streakDays, files, jobs, devices } = useDataStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [mode, setMode] = useState(profile?.usage_mode || "personal");
  const [region, setRegion] = useState(profile?.region || "eu-average");
  const [department, setDepartment] = useState(profile?.department || "");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setMode(profile.usage_mode || "personal");
      setRegion(profile.region || "eu-average");
      setDepartment(profile.department || "");
    }
  }, [profile]);

  const handleSave = () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    saveProfile.mutate(
      {
        display_name: displayName.trim(),
        usage_mode: mode,
        region,
        department: department.trim() || undefined,
      },
      {
        onSuccess: () => {
          patchSettings({
            general: {
              ...settings.general,
              displayName: displayName.trim(),
              usageMode: mode,
              region,
            },
          });
          toast.success("Profile saved successfully");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const labels = modeLabels(mode);
  const cleanedCount = files.filter((f) => f.status !== "active").length;

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Top Profile Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-3xl shadow-sm">
            {mode === "organization" ? "🏢" : mode === "student" ? "🎓" : "🌱"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground">{displayName || "Eco Champion"}</h1>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary capitalize">
                {labels.userRole}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              GreenPulse ID: {profile?.id ? `${profile.id.slice(0, 12)}…` : "local-user"} · Region: {region.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saveProfile.isPending} className="font-bold gap-1.5 shadow-xs">
            <Save className="size-3.5" />
            {saveProfile.isPending ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* 4 Lifetime Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Trophy className="size-3 text-amber-500" /> Total XP
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono mt-0.5">{xp} XP</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Flame className="size-3 fill-amber-500 text-amber-500" /> Active Streak
          </span>
          <div className="text-xl font-extrabold text-amber-500 font-mono mt-0.5">{streakDays} Days</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <HardDrive className="size-3 text-blue-500" /> Cleaned Files
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono mt-0.5">{cleanedCount}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Laptop className="size-3 text-purple-500" /> {labels.devices}
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono mt-0.5">{devices.length}</div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Profile Settings & Mode Selection
        </h3>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="prof-name" className="text-xs font-bold">Display Name</Label>
            <Input
              id="prof-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="h-9 text-xs"
            />
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold">Usage Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "personal" as const, label: "Personal Mode", icon: User, hint: "Your own files and home devices" },
                { id: "student" as const, label: "Student / Campus", icon: GraduationCap, hint: "Coursework, research & student laptops" },
                { id: "organization" as const, label: "Organization", icon: Building2, hint: "Team compute workloads & lab assets" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all",
                    mode === m.id
                      ? "border-primary bg-primary-soft/50 ring-1 ring-primary"
                      : "border-border bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <m.icon className="size-4 text-primary" />
                      {mode === m.id && <Check className="size-3.5 text-primary" />}
                    </div>
                    <div className="mt-2 font-bold text-foreground text-xs">{m.label}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.hint}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Grid Region / Carbon Curve</Label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-dept" className="text-xs font-bold">Team / Department (Optional)</Label>
              <Input
                id="prof-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering / Biology Lab"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
