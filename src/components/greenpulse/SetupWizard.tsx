import { useState } from "react";
import { toast } from "sonner";
import { Building2, GraduationCap, Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { REGIONS, useSaveProfile, type Modules, type Profile, type UsageMode } from "@/lib/profile";

const MODES: { id: UsageMode; label: string; icon: typeof User; hint: string }[] = [
  { id: "personal", label: "Personal", icon: User, hint: "Your own files and devices" },
  { id: "student", label: "Student", icon: GraduationCap, hint: "Coursework, labs and laptops" },
  { id: "organization", label: "Organization", icon: Building2, hint: "Teams, workloads and lab assets" },
];

export const MODULE_INFO: { id: keyof Modules; label: string; hint: string }[] = [
  { id: "dataDiet", label: "Data Diet", hint: "Find and clean wasteful storage" },
  { id: "greenQueue", label: "GreenQueue", hint: "Run heavy tasks at low-carbon hours" },
  { id: "passport", label: "E-Waste Passport", hint: "Keep devices longer, recycle right" },
];

export function ProfileFields({ value, onChange }: { value: Omit<Profile, "id" | "onboarded">; onChange: (v: Omit<Profile, "id" | "onboarded">) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" maxLength={60} value={value.display_name ?? ""} onChange={(e) => onChange({ ...value, display_name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>How will you use GreenPulse?</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => onChange({ ...value, usage_mode: m.id })}
              className={cn("rounded-md border p-3 text-left transition-colors", value.usage_mode === m.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted")}>
              <m.icon className="mb-1 size-4 text-primary" />
              <div className="text-sm font-bold">{m.label}</div>
              <div className="text-xs text-muted-foreground">{m.hint}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="region">Region / electricity grid</Label>
        <select id="region" value={value.region} onChange={(e) => onChange({ ...value, region: e.target.value })}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Modules</Label>
        {MODULE_INFO.map((m) => (
          <label key={m.id} className="flex items-center justify-between rounded-md border border-border p-3">
            <span><span className="block text-sm font-bold">{m.label}</span><span className="text-xs text-muted-foreground">{m.hint}</span></span>
            <Switch checked={value.modules[m.id]} onCheckedChange={(c) => onChange({ ...value, modules: { ...value.modules, [m.id]: c } })} aria-label={m.label} />
          </label>
        ))}
      </div>
    </div>
  );
}

export function SetupWizard({ profile }: { profile: Profile }) {
  const save = useSaveProfile();
  const [value, setValue] = useState({ display_name: profile.display_name, usage_mode: profile.usage_mode, region: profile.region, modules: profile.modules });
  const finish = () => {
    if (!value.display_name?.trim()) { toast.error("Please enter your name"); return; }
    if (!Object.values(value.modules).some(Boolean)) { toast.error("Turn on at least one module"); return; }
    save.mutate({ ...value, display_name: value.display_name.trim(), onboarded: true }, {
      onSuccess: () => toast.success(`Welcome, ${value.display_name}!`),
      onError: (e) => toast.error(e.message),
    });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-shell px-4 py-10 font-sans">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-phone">
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Leaf className="size-4" /> Setup</div>
        <h1 className="mb-5 text-2xl font-extrabold">Let's tailor GreenPulse to you</h1>
        <ProfileFields value={value} onChange={setValue} />
        <Button className="mt-6 w-full" onClick={finish} disabled={save.isPending}>{save.isPending ? "Saving…" : "Start using GreenPulse"}</Button>
      </div>
    </div>
  );
}
