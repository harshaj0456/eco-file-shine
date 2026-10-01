import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, GripVertical, LogOut, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProfileFields } from "@/components/greenpulse/SetupWizard";
import { modeLabels, useProfile, useSaveProfile } from "@/lib/profile";
import {
  CURRENCY_SYMBOL, DEFAULT_SETTINGS, SUB_SCORES, WEIGHT_LABELS, applyAppearance, parseSettings, rebalance, useAppearanceSync, useSaveSettings, useSettings, weightedScore,
  type Accent, type RuleAction, type Settings, type Weights,
} from "@/lib/settings";
import { DEMO_FILES, STATUS_KEY, download, filesToCsv, loadStatus } from "@/lib/storage-files";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GreenPulse" },
      { name: "description", content: "Tune scoring, Data Diet rules, appearance and your data in GreenPulse." },
      { property: "og:title", content: "Settings — GreenPulse" },
      { property: "og:description", content: "Make GreenPulse yours." },
    ],
  }),
  component: SettingsPage,
});

const TABS = ["general", "scoring", "diet", "queue", "devices", "notifications", "appearance", "data"] as const;
const TAB_LABEL: Record<(typeof TABS)[number], string> = { general: "General", scoring: "Scoring", diet: "Data Diet", queue: "GreenQueue", devices: "Devices", notifications: "Notifications", appearance: "Appearance", data: "Data & Privacy" };

function SettingsPage() {
  useAppearanceSync();
  const { data: settings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (isLoading || !settings) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;

  // Changes apply instantly; saving to the account is debounced.
  const update = (next: Settings) => {
    saveSettings.reset();
    applyAppearance(next.appearance);
    clearTimeout(timer.current);
    // Optimistic cache update happens in onMutate; debounce the network write.
    timer.current = setTimeout(() => saveSettings.mutate(next, { onError: (e) => toast.error(`Couldn't save: ${e.message}`) }), 400);
    queryClientSet(next);
  };

  return <SettingsView settings={settings} update={update} saving={saveSettings.isPending} />;
}

let queryClientSet: (s: Settings) => void = () => {};

function SettingsView({ settings, update, saving }: { settings: Settings; update: (s: Settings) => void; saving: boolean }) {
  const qc = useQueryClient();
  queryClientSet = (s) => qc.setQueryData(["settings"], s);
  return (
    <div className="min-h-screen bg-app-shell px-3 py-6 font-sans text-foreground md:px-6">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-4 shadow-phone md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
          <span className="text-xs text-muted-foreground">{saving ? "Saving…" : "All changes saved"}</span>
        </div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {TABS.map((t) => <TabsTrigger key={t} value={t} className="text-xs">{TAB_LABEL[t]}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="general"><GeneralTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="scoring"><ScoringTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="diet"><DietTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="queue"><QueueTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="devices"><DevicesTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="appearance"><AppearanceTab settings={settings} update={update} /></TabsContent>
          <TabsContent value="data"><DataTab settings={settings} update={update} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

type TabProps = { settings: Settings; update: (s: Settings) => void };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-md border border-border p-4">
      <h2 className="text-sm font-extrabold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><Label className="text-sm">{label}</Label>{children}</div>;
}

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="w-40" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function GeneralTab({ settings, update }: TabProps) {
  const { data: profile } = useProfile();
  const save = useSaveProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [value, setValue] = useState<Parameters<typeof ProfileFields>[0]["value"] | null>(null);
  useEffect(() => {
    if (profile && !value) setValue({ display_name: profile.display_name, usage_mode: profile.usage_mode, region: profile.region, modules: profile.modules });
  }, [profile, value]);

  const onSave = () => {
    if (!value) return;
    if (!value.display_name?.trim()) { toast.error("Please enter your name"); return; }
    if (!Object.values(value.modules).some(Boolean)) { toast.error("Turn on at least one module"); return; }
    save.mutate(value, { onSuccess: () => toast.success("Profile saved"), onError: (e) => toast.error(e.message) });
  };
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  const u = settings.units;
  const setUnits = (patch: Partial<Settings["units"]>) => update({ ...settings, units: { ...u, ...patch } });

  return (
    <>
      <Section title="Profile" hint={value ? `In this mode, devices are called "${modeLabels(value.usage_mode).devices}".` : undefined}>
        {value && <ProfileFields value={value} onChange={setValue} />}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onSave} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</Button>
          <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
        </div>
      </Section>
      <Section title="Units & cost">
        <Row label="Storage unit"><Choice label="Storage unit" value={u.storage} onChange={(storage) => setUnits({ storage })} options={[{ id: "GB", label: "Gigabytes (GB)" }, { id: "MB", label: "Megabytes (MB)" }]} /></Row>
        <Row label="Carbon unit"><Choice label="Carbon unit" value={u.carbon} onChange={(carbon) => setUnits({ carbon })} options={[{ id: "kg", label: "Kilograms" }, { id: "lb", label: "Pounds" }]} /></Row>
        <Row label="Currency"><Choice label="Currency" value={u.currency} onChange={(currency) => setUnits({ currency })} options={(["INR", "USD", "EUR", "GBP"] as const).map((c) => ({ id: c, label: `${CURRENCY_SYMBOL[c]} ${c}` }))} /></Row>
        <Row label={`Electricity price (${CURRENCY_SYMBOL[u.currency]}/kWh)`}>
          <Input className="w-28" type="number" min={0} step={0.01} value={u.pricePerKwh} onChange={(e) => setUnits({ pricePerKwh: Math.max(0, Number(e.target.value)) })} />
        </Row>
      </Section>
    </>
  );
}

function ScoringTab({ settings, update }: TabProps) {
  const w = settings.weights;
  const preview = weightedScore(w);
  return (
    <Section title="Score weights" hint="Weights always add up to 100%. Moving one slider adjusts the others.">
      <div className="flex items-center gap-4 rounded-md bg-primary-soft p-3">
        <div className="text-4xl font-extrabold text-primary">{preview}</div>
        <div className="text-xs text-muted-foreground">Live score preview<br />Total weight: {w.storage + w.energy + w.cleanup + w.habits}%</div>
      </div>
      {(Object.keys(w) as (keyof Weights)[]).map((k) => (
        <div key={k}>
          <div className="mb-1.5 flex justify-between text-sm"><span>{WEIGHT_LABELS[k]} <span className="text-xs text-muted-foreground">(sub-score {SUB_SCORES[k]})</span></span><span className="font-bold">{w[k]}%</span></div>
          <Slider aria-label={WEIGHT_LABELS[k]} value={[w[k]]} max={100} step={1} onValueChange={([v]) => update({ ...settings, weights: rebalance(w, k, v) })} />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => update({ ...settings, weights: DEFAULT_SETTINGS.weights })}><RotateCcw /> Reset weights</Button>
    </Section>
  );
}

const ACTIONS: { id: RuleAction; label: string }[] = [{ id: "keep", label: "Keep" }, { id: "compress", label: "Compress" }, { id: "archive", label: "Archive" }, { id: "delete", label: "Delete" }];

function DietTab({ settings, update }: TabProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [folder, setFolder] = useState("");
  const [category, setCategory] = useState("");
  const rules = settings.rules;
  const setRules = (next: typeof rules) => update({ ...settings, rules: next });
  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...rules]; const [r] = next.splice(from, 1); next.splice(to, 0, r); setRules(next);
  };

  return (
    <>
      <Section title="Rules" hint="Rules are checked from top to bottom. Drag the handle to reorder. The Storage map uses them right away.">
        {rules.map((r, i) => (
          <div
            key={r.id}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) { move(dragIdx, i); setDragIdx(i); } }}
            onDragEnd={() => setDragIdx(null)}
            className={cn("flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2 text-sm", dragIdx === i && "opacity-50")}
          >
            <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
            <div className="flex flex-col">
              <button className="text-[10px] leading-none text-muted-foreground disabled:opacity-30" disabled={i === 0} aria-label="Move up" onClick={() => move(i, i - 1)}>▲</button>
              <button className="text-[10px] leading-none text-muted-foreground disabled:opacity-30" disabled={i === rules.length - 1} aria-label="Move down" onClick={() => move(i, i + 1)}>▼</button>
            </div>
            <span className="font-bold">IF</span>
            <Select value={r.category} onValueChange={(v) => setRules(rules.map((x) => x.id === r.id ? { ...x, category: v } : x))}>
              <SelectTrigger className="h-8 w-32" aria-label="Category"><SelectValue /></SelectTrigger>
              <SelectContent>{["Any", ...settings.categories].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <span>older than</span>
            <Input aria-label="Months" type="number" min={0} className="h-8 w-16" value={r.months} onChange={(e) => setRules(rules.map((x) => x.id === r.id ? { ...x, months: Math.max(0, Number(e.target.value)) } : x))} />
            <span>months</span>
            <span className="font-bold">THEN</span>
            <Select value={r.action} onValueChange={(v) => setRules(rules.map((x) => x.id === r.id ? { ...x, action: v as RuleAction } : x))}>
              <SelectTrigger className="h-8 w-28" aria-label="Action"><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIONS.map((a) => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-1">
              <Switch aria-label="Rule on" checked={r.enabled} onCheckedChange={(enabled) => setRules(rules.map((x) => x.id === r.id ? { ...x, enabled } : x))} />
              <Button size="icon" variant="ghost" aria-label="Remove rule" onClick={() => setRules(rules.filter((x) => x.id !== r.id))}><Trash2 /></Button>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRules([...rules, { id: crypto.randomUUID(), months: 12, category: "Any", action: "archive", enabled: true }])}><Plus /> Add rule</Button>
      </Section>
      <Section title="Protected folders" hint="Files here are never suggested for cleanup and can't be deleted or compressed.">
        <Chips items={settings.protectedFolders} onRemove={(p) => update({ ...settings, protectedFolders: settings.protectedFolders.filter((x) => x !== p) })} />
        <AddRow value={folder} setValue={setFolder} placeholder="e.g. Documents/Work" onAdd={() => {
          const v = folder.trim().replace(/\/$/, ""); if (!v || settings.protectedFolders.includes(v)) return;
          update({ ...settings, protectedFolders: [...settings.protectedFolders, v] }); setFolder("");
        }} />
      </Section>
      <Section title="Your categories">
        <Chips items={settings.categories} onRemove={(c) => update({ ...settings, categories: settings.categories.filter((x) => x !== c) })} />
        <AddRow value={category} setValue={setCategory} placeholder="e.g. Music" onAdd={() => {
          const v = category.trim(); if (!v || settings.categories.includes(v)) return;
          update({ ...settings, categories: [...settings.categories, v] }); setCategory("");
        }} />
      </Section>
    </>
  );
}

function Chips({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  if (!items.length) return <p className="text-xs text-muted-foreground">None yet.</p>;
  return <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{i}<button aria-label={`Remove ${i}`} onClick={() => onRemove(i)}><X className="size-3" /></button></span>)}</div>;
}

function AddRow({ value, setValue, placeholder, onAdd }: { value: string; setValue: (v: string) => void; placeholder: string; onAdd: () => void }) {
  return <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onAdd(); }}><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} /><Button type="submit" variant="outline"><Plus /> Add</Button></form>;
}

const hours = Array.from({ length: 24 }, (_, h) => ({ id: String(h), label: `${String(h).padStart(2, "0")}:00` }));

function QueueTab({ settings, update }: TabProps) {
  const q = settings.queue;
  return (
    <Section title="GreenQueue" hint="The full carbon scheduler arrives in the next update. These choices will be used there.">
      <Row label="Quiet hours start"><Choice label="Quiet start" value={String(q.quietStart)} options={hours} onChange={(v) => update({ ...settings, queue: { ...q, quietStart: Number(v) } })} /></Row>
      <Row label="Quiet hours end"><Choice label="Quiet end" value={String(q.quietEnd)} options={hours} onChange={(v) => update({ ...settings, queue: { ...q, quietEnd: Number(v) } })} /></Row>
      <Row label="Suggest greener times automatically"><Switch checked={q.autoShift} onCheckedChange={(autoShift) => update({ ...settings, queue: { ...q, autoShift } })} /></Row>
    </Section>
  );
}

function DevicesTab({ settings, update }: TabProps) {
  const d = settings.devices;
  return (
    <Section title="Devices" hint="Used by the E-Waste Passport, coming in the next update.">
      <Row label={`Check-up reminder every ${d.reminderMonths} months`}><Slider className="w-40" aria-label="Reminder months" min={1} max={24} value={[d.reminderMonths]} onValueChange={([v]) => update({ ...settings, devices: { ...d, reminderMonths: v } })} /></Row>
      <Row label="Track warranty dates"><Switch checked={d.trackWarranty} onCheckedChange={(trackWarranty) => update({ ...settings, devices: { ...d, trackWarranty } })} /></Row>
    </Section>
  );
}

function NotificationsTab({ settings, update }: TabProps) {
  const n = settings.notifications;
  return (
    <Section title="Notifications" hint="Detailed alerts and reminders arrive in a later update.">
      <Row label="In-app messages"><Switch checked={n.inApp} onCheckedChange={(inApp) => update({ ...settings, notifications: { ...n, inApp } })} /></Row>
      <Row label="Browser notifications"><Switch checked={n.browser} onCheckedChange={(browser) => update({ ...settings, notifications: { ...n, browser } })} /></Row>
      <Row label="Email summary"><Choice label="Email summary" value={n.digest} onChange={(digest) => update({ ...settings, notifications: { ...n, digest } })} options={[{ id: "off", label: "Off" }, { id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }]} /></Row>
    </Section>
  );
}

const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "leaf", label: "Leaf", swatch: "oklch(0.52 0.105 160)" },
  { id: "teal", label: "Teal", swatch: "oklch(0.52 0.09 195)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.5 0.12 245)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.6 0.14 65)" },
  { id: "plum", label: "Plum", swatch: "oklch(0.5 0.13 335)" },
];

function AppearanceTab({ settings, update }: TabProps) {
  const a = settings.appearance;
  const set = (patch: Partial<Settings["appearance"]>) => update({ ...settings, appearance: { ...a, ...patch } });
  return (
    <Section title="Appearance">
      <Row label="Theme"><Choice label="Theme" value={a.theme} onChange={(theme) => set({ theme })} options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "Match device" }]} /></Row>
      <div>
        <Label className="text-sm">Accent color</Label>
        <div className="mt-2 flex gap-2">
          {ACCENTS.map((c) => (
            <button key={c.id} onClick={() => set({ accent: c.id })} aria-label={c.label} aria-pressed={a.accent === c.id}
              className={cn("size-9 rounded-full border-2 border-transparent", a.accent === c.id && "border-foreground")} style={{ background: c.swatch }} />
          ))}
        </div>
      </div>
      <Row label="Spacing"><Choice label="Spacing" value={a.density} onChange={(density) => set({ density })} options={[{ id: "comfortable", label: "Comfortable" }, { id: "compact", label: "Compact" }]} /></Row>
      <Row label="Text size"><Choice label="Text size" value={a.textSize} onChange={(textSize) => set({ textSize })} options={[{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" }]} /></Row>
      <Row label="Reduce motion"><Switch checked={a.reduceMotion} onCheckedChange={(reduceMotion) => set({ reduceMotion })} /></Row>
    </Section>
  );
}

function DataTab({ settings, update }: TabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const save = useSaveSettings();

  const exportJson = () => download("greenpulse-settings.json", JSON.stringify({ app: "GreenPulse", version: 2, exportedAt: new Date().toISOString(), settings, fileStatus: loadStatus() }, null, 2), "application/json");
  const exportCsv = () => download("greenpulse-files.csv", filesToCsv(DEMO_FILES, loadStatus()), "text/csv");
  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !parsed.settings) throw new Error("This file isn't a GreenPulse export.");
      update(parseSettings(parsed.settings));
      if (parsed.fileStatus && typeof parsed.fileStatus === "object") localStorage.setItem(STATUS_KEY, JSON.stringify(parsed.fileStatus));
      toast.success("Settings imported");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't read that file"); }
  };
  const resetDemo = () => { localStorage.removeItem(STATUS_KEY); update(DEFAULT_SETTINGS); toast.success("Demo data reset"); };
  const deleteAll = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      await save.mutateAsync(DEFAULT_SETTINGS);
      const { error } = await supabase.from("profiles").update({ onboarded: false, display_name: null }).eq("id", auth.user.id);
      if (error) throw error;
      localStorage.removeItem(STATUS_KEY);
      applyAppearance(DEFAULT_SETTINGS.appearance);
      await qc.invalidateQueries();
      toast.success("All your data was deleted");
      navigate({ to: "/app" });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
  };

  return (
    <>
      <Section title="Export & import">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={exportJson}><Download /> Export settings (JSON)</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Import JSON</Button>
          <Button variant="outline" onClick={exportCsv}><Download /> Export file list (CSV)</Button>
          <Button variant="outline" asChild><Link to="/report"><FileText /> Printable report</Link></Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ""; }} />
      </Section>
      <Section title="Privacy" hint="GreenPulse only reads file details like size, type and age — never the contents. Your settings are stored in your own account.">
        <ConfirmButton label="Reset demo data" title="Reset demo data?" body="Your rules, weights and appearance go back to the defaults and file actions are cleared." onConfirm={resetDemo} icon={<RotateCcw />} />
        <ConfirmButton destructive label="Delete all my data" title="Delete all your data?" body="This removes your saved settings and profile details. You'll go through setup again. This can't be undone." onConfirm={deleteAll} icon={<Trash2 />} />
      </Section>
    </>
  );
}

function ConfirmButton({ label, title, body, onConfirm, icon, destructive }: { label: string; title: string; body: string; onConfirm: () => void; icon: React.ReactNode; destructive?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant={destructive ? "destructive" : "outline"} className="w-full">{icon} {label}</Button></AlertDialogTrigger>
      <AlertDialogContent className="font-sans">
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{body}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>{label}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
