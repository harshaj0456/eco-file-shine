import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  Filter,
  FolderDown,
  Gauge,
  HardDrive,
  Home,
  Image,
  Info,
  Leaf,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  User,
  Video,
  WandSparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tab = "home" | "analyze" | "diet" | "insights" | "profile";
type Modal = "carbon" | "privacy" | "green" | null;
type ReviewKind = "duplicates" | "videos" | "downloads" | "rare";

const initialCategories = [
  { name: "Photos", value: 9.2, tone: "bg-chart-1", color: "var(--chart-1)" },
  { name: "Videos", value: 12.8, tone: "bg-chart-2", color: "var(--chart-2)" },
  { name: "Documents", value: 4.1, tone: "bg-chart-3", color: "var(--chart-3)" },
  { name: "Downloads", value: 5, tone: "bg-chart-4", color: "var(--chart-4)" },
  { name: "Backups", value: 4.8, tone: "bg-chart-5", color: "var(--chart-5)" },
  { name: "Other", value: 2.5, tone: "bg-muted-foreground", color: "var(--muted-foreground)" },
];

const opportunities = [
  { kind: "duplicates" as const, label: "Duplicate files", detail: "436 matching files", size: 12, icon: Image },
  { kind: "videos" as const, label: "Old videos", detail: "Not opened in 2+ years", size: 8, icon: Video },
  { kind: "downloads" as const, label: "Downloads", detail: "Installers and exports", size: 5, icon: FolderDown },
  { kind: "rare" as const, label: "Rarely accessed", detail: "Archive-ready files", size: 7, icon: Archive },
];

const history = [
  { month: "Apr", storage: 51, carbon: 0 },
  { month: "May", storage: 49, carbon: 0.4 },
  { month: "Jun", storage: 47, carbon: 0.9 },
  { month: "Jul", storage: 44, carbon: 1.8 },
  { month: "Aug", storage: 41, carbon: 3.1 },
  { month: "Sep", storage: 38.4, carbon: 4.8 },
];

const reviewData = [
  { id: 1, title: "Lake District Weekend", meta: "8 copies · 2 locations", size: 2.8, tag: "Best quality kept", tone: "from-chart-2 to-primary" },
  { id: 2, title: "Product launch exports", meta: "5 copies · Google Drive", size: 1.6, tag: "Newest file kept", tone: "from-chart-4 to-chart-1" },
  { id: 3, title: "Receipts & scans", meta: "12 copies · Device", size: 0.9, tag: "Original kept", tone: "from-chart-3 to-chart-5" },
];

const otherReviewData = {
  videos: [
    { id: 11, title: "Summer road trip.mov", meta: "Last opened 3 years ago · Google Drive", size: 3.2, tag: "Archive suggested", tone: "from-chart-2 to-chart-3" },
    { id: 12, title: "Conference recordings", meta: "4 videos · This device", size: 2.4, tag: "Compress suggested", tone: "from-chart-3 to-primary" },
    { id: 13, title: "Old camera imports", meta: "Last opened 2 years ago · Google Drive", size: 1.8, tag: "Archive suggested", tone: "from-chart-5 to-chart-2" },
  ],
  downloads: [
    { id: 21, title: "Unused app installers", meta: "9 files · Downloads", size: 1.8, tag: "Safe to review", tone: "from-chart-4 to-chart-5" },
    { id: 22, title: "Presentation exports", meta: "14 files · This device", size: 1.4, tag: "Newer copy kept", tone: "from-chart-1 to-chart-4" },
    { id: 23, title: "Archived ZIP packages", meta: "6 files · Downloads", size: 1.2, tag: "Archive suggested", tone: "from-chart-5 to-chart-3" },
  ],
  rare: [
    { id: 31, title: "Past project archive", meta: "Last opened 4 years ago · Google Drive", size: 2.6, tag: "Archive suggested", tone: "from-chart-3 to-chart-2" },
    { id: 32, title: "Old design assets", meta: "Last opened 3 years ago · This device", size: 2.1, tag: "Archive suggested", tone: "from-chart-1 to-chart-3" },
    { id: 33, title: "Legacy document backups", meta: "Last opened 2 years ago · Google Drive", size: 1.5, tag: "Archive suggested", tone: "from-chart-4 to-chart-1" },
  ],
};

const navigation = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "analyze" as const, label: "Analyze", icon: Search },
  { id: "diet" as const, label: "Diet", icon: Leaf },
  { id: "insights" as const, label: "Insights", icon: BarChart3 },
  { id: "profile" as const, label: "Profile", icon: User },
];

export function DataDietApp() {
  const [onboarding, setOnboarding] = useState(0);
  const [tab, setTab] = useState<Tab>("home");
  const [modal, setModal] = useState<Modal>(null);
  const [review, setReview] = useState<ReviewKind | null>(null);
  const [used, setUsed] = useState(38.4);
  const [score, setScore] = useState(72);
  const [saved, setSaved] = useState(0);
  const [wide, setWide] = useState(false);

  const applySaving = (gb: number, message: string) => {
    setUsed((value) => Math.max(0, Number((value - gb).toFixed(1))));
    setSaved((value) => Number((value + gb).toFixed(1)));
    setScore((value) => Math.min(100, value + Math.max(1, Math.round(gb / 2))));
    toast.success(message, { description: `${gb.toFixed(1)} GB recovered · impact updated` });
  };

  if (onboarding < 3) {
    return <Onboarding step={onboarding} setStep={setOnboarding} finish={() => setOnboarding(3)} />;
  }

  return (
    <div className="min-h-screen bg-app-shell font-sans text-foreground md:px-6 md:py-8">
      <div className="fixed right-6 top-5 z-40 hidden items-center gap-2 rounded-md border border-border bg-background/90 p-1.5 shadow-sm backdrop-blur md:flex">
        <Button size="sm" variant={!wide ? "secondary" : "ghost"} onClick={() => setWide(false)} aria-label="Phone view">
          <Smartphone /> Phone
        </Button>
        <Button size="sm" variant={wide ? "secondary" : "ghost"} onClick={() => setWide(true)} aria-label="Wide view">
          <Menu /> Wide
        </Button>
      </div>

      <main
        className={cn(
          "relative mx-auto min-h-screen overflow-hidden bg-background transition-[max-width,border-radius] duration-300 md:min-h-[calc(100vh-4rem)] md:border md:border-border md:shadow-phone",
          wide ? "md:max-w-6xl md:rounded-lg" : "md:max-w-[430px] md:rounded-[2rem]",
        )}
      >
        <div className="h-full overflow-y-auto pb-24 md:max-h-[calc(100vh-4rem)]">
          {review ? (
            <ReviewScreen kind={review} onBack={() => setReview(null)} onApply={applySaving} />
          ) : (
            <>
              {tab === "home" && (
                <HomeScreen used={used} score={score} saved={saved} setModal={setModal} onReview={setReview} />
              )}
              {tab === "analyze" && <AnalyzeScreen used={used} onReview={setReview} />}
              {tab === "diet" && <DietScreen score={score} saved={saved} />}
              {tab === "insights" && <InsightsScreen used={used} saved={saved} />}
              {tab === "profile" && <ProfileScreen setModal={setModal} />}
            </>
          )}
        </div>

        {!review && (
          <nav className="absolute inset-x-0 bottom-0 z-30 grid h-[76px] grid-cols-5 border-t border-border bg-background/95 px-2 pb-2 pt-1 backdrop-blur">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "h-full min-w-0 flex-col gap-1 rounded-md px-1 text-[10px] font-semibold text-muted-foreground",
                    active && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                  )}
                >
                  <Icon className={cn("size-5", active && "fill-primary/10")} />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        )}
      </main>

      <EducationDialog modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}

function Onboarding({ step, setStep, finish }: { step: number; setStep: (step: number) => void; finish: () => void }) {
  const connected = step === 2;
  return (
    <main className="min-h-screen bg-app-shell px-4 py-5 md:grid md:place-items-center">
      <section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[430px] flex-col overflow-hidden rounded-lg border border-border bg-background p-6 shadow-phone md:min-h-[780px]">
        <div className="flex items-center justify-between">
          <Brand />
          <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
        </div>
        <div className="mt-4 flex gap-1.5" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((dot) => <span key={dot} className={cn("h-1 flex-1 rounded-full bg-muted", dot <= step && "bg-primary")} />)}
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col justify-center py-10 animate-fade-in">
            <div className="relative mx-auto mb-10 grid size-56 place-items-center rounded-full border border-primary/20 bg-primary-soft">
              <div className="absolute inset-6 rounded-full border border-dashed border-primary/30" />
              <Cloud className="size-20 text-primary" strokeWidth={1.2} />
              <span className="absolute right-4 top-9 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm"><Leaf /></span>
              <span className="absolute bottom-8 left-4 rounded-md bg-background px-3 py-2 text-xs font-bold shadow-sm">38.4 GB</span>
            </div>
            <p className="mb-3 text-xs font-bold uppercase text-primary">Your data has a footprint</p>
            <h1 className="text-4xl font-bold leading-tight">Clean your digital footprint. Keep what matters.</h1>
            <p className="mt-4 leading-7 text-muted-foreground">Every stored file uses energy. Data Diet helps you understand, reduce, and sustain a lighter digital life.</p>
            <p className="mt-4 text-xs font-bold text-primary">SDG 12 · Responsible Consumption &nbsp; / &nbsp; SDG 13 · Climate Action</p>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col justify-center py-10 animate-fade-in">
            <p className="mb-2 text-xs font-bold uppercase text-primary">A smarter cleanup</p>
            <h1 className="text-3xl font-bold">What Data Diet does</h1>
            <p className="mt-3 text-muted-foreground">Clear insight before every action. Nothing is removed without you.</p>
            <div className="mt-8 grid gap-3">
              {[
                [Search, "Find hidden waste", "Spot duplicates, forgotten downloads, and files you rarely open."],
                [WandSparkles, "Recommend, not remove", "Get thoughtful next steps while staying in control."],
                [Gauge, "Measure your impact", "See storage, energy, and estimated carbon together."],
                [Target, "Build better habits", "Set reduction goals and keep your footprint healthy."],
              ].map(([Icon, title, copy]) => {
                const ItemIcon = Icon as typeof Search;
                return <div key={title as string} className="flex gap-4 rounded-md border border-border bg-card p-4"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><ItemIcon /></span><div><h2 className="font-bold">{title as string}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{copy as string}</p></div></div>;
              })}
            </div>
          </div>
        )}

        {connected && (
          <div className="flex flex-1 flex-col py-9 animate-fade-in">
            <p className="mb-2 text-xs font-bold uppercase text-primary">Bring your storage together</p>
            <h1 className="text-3xl font-bold">Connect a source</h1>
            <p className="mt-3 text-muted-foreground">Data Diet reads file metadata only. Your content stays private.</p>
            <div className="mt-7 grid gap-3">
              {[Cloud, HardDrive, Database, Archive].map((Icon, index) => (
                <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-card p-4">
                  <span className="grid size-10 place-items-center rounded-md bg-secondary"><Icon /></span>
                  <div className="min-w-0"><p className="truncate font-bold">{["Google Drive", "This device", "Microsoft OneDrive", "Dropbox"][index]}</p><p className="text-xs text-muted-foreground">Demo connection</p></div>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Demo source connected")}>Connect</Button>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-md border border-primary/20 bg-primary-soft p-4">
              <div className="flex items-center gap-2 font-bold text-primary"><ShieldCheck className="size-4" /> Privacy first</div>
              <p className="mt-1 text-sm text-muted-foreground">We analyze names, sizes, dates, and file signatures—not file contents.</p>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          {step === 2 && <Button size="lg" className="h-12" onClick={finish}><Sparkles /> Explore Demo Data</Button>}
          {step < 2 && <Button size="lg" className="h-12" onClick={() => setStep(step + 1)}>Continue <ArrowRight /></Button>}
          {step === 2 && <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft /> Back</Button>}
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return <div className="flex items-center gap-2 font-bold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-4" /></span>Data Diet</div>;
}

function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-5 pb-4 pt-6"><div className="min-w-0">{eyebrow && <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>}<h1 className="truncate text-2xl font-bold">{title}</h1></div>{action}</header>;
}

function HomeScreen({ used, score, saved, setModal, onReview }: { used: number; score: number; saved: number; setModal: (modal: Modal) => void; onReview: (kind: ReviewKind) => void }) {
  return <div className="animate-fade-in">
    <PageHeader eyebrow="Your digital footprint" title="Good morning, Harsha" action={<Button size="icon" variant="outline" aria-label="Notifications" onClick={() => toast("You’re all caught up", { description: "Your next footprint report is coming soon." })}><Bell /></Button>} />
    <section className="px-5">
      <div className="overflow-hidden rounded-lg bg-ink p-5 text-ink-foreground shadow-sm">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
          <ScoreRing score={score} />
          <div className="min-w-0"><p className="text-xs font-semibold text-ink-muted">Digital Diet score</p><h2 className="mt-1 text-2xl font-bold">Looking lighter</h2><p className="mt-2 text-sm text-ink-muted"><span className="font-bold text-success">+{8 + Math.round(saved / 2)} pts</span> this month</p></div>
        </div>
        <div className="mt-5 border-t border-ink-border pt-4 text-sm text-ink-muted">You’re ahead of 64% of similar storage profiles.</div>
      </div>

      <SectionTitle title="Storage footprint" meta={`${used.toFixed(1)} GB / 100 GB`} />
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">{initialCategories.map((item) => <span key={item.name} className={item.tone} style={{ width: `${(item.value / 38.4) * Math.min(used, 38.4)}%` }} />)}</div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{initialCategories.map((item) => <div key={item.name} className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("size-2 shrink-0 rounded-full", item.tone)} /><span className="truncate">{item.name}</span><strong className="ml-auto shrink-0 text-[11px] text-foreground">{(item.value * used / 38.4).toFixed(1)} GB</strong></div>)}</div>
      </div>

      <SectionTitle title="Quick impact" />
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Leaf} value={Math.max(0, 4.8 - saved * 0.12).toFixed(1)} unit="kg CO₂" label="estimated footprint" />
        <Metric icon={Zap} value={Math.max(0, 8.6 - saved * 0.21).toFixed(1)} unit="kWh" label="energy equivalent" />
      </div>
      <Button variant="ghost" className="mt-1 w-full text-muted-foreground" onClick={() => setModal("carbon")}><Info /> How is this calculated?</Button>

      <SectionTitle title="Biggest opportunities" meta="32 GB found" />
      <div className="grid gap-3 pb-3">{opportunities.map((item) => <Opportunity key={item.kind} {...item} onClick={() => onReview(item.kind)} />)}</div>
    </section>
  </div>;
}

function ScoreRing({ score }: { score: number }) {
  return <div className="relative grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--success) ${score * 3.6}deg, var(--ink-border) 0)` }}><div className="grid size-[88px] place-items-center rounded-full bg-ink text-center"><div><strong className="text-3xl">{score}</strong><span className="text-xs text-ink-muted">/100</span></div></div></div>;
}

function SectionTitle({ title, meta }: { title: string; meta?: string }) {
  return <div className="mt-7 mb-3 flex items-center justify-between"><h2 className="font-bold">{title}</h2>{meta && <span className="text-xs font-semibold text-muted-foreground">{meta}</span>}</div>;
}

function Metric({ icon: Icon, value, unit, label }: { icon: typeof Leaf; value: string; unit: string; label: string }) {
  return <div className="rounded-md border border-border bg-card p-4"><span className="grid size-9 place-items-center rounded-md bg-primary-soft text-primary"><Icon className="size-4" /></span><div className="mt-4"><strong className="text-2xl">{value}</strong><span className="ml-1 text-xs font-bold">{unit}</span></div><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}

function Opportunity({ label, detail, size, icon: Icon, onClick }: (typeof opportunities)[number] & { onClick: () => void }) {
  return <button onClick={onClick} className="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-sm"><span className="grid size-11 place-items-center rounded-md bg-secondary text-secondary-foreground"><Icon /></span><span className="min-w-0"><span className="block truncate font-bold">{label}</span><span className="block truncate text-xs text-muted-foreground">{detail}</span></span><span className="text-right"><strong className="block text-primary">{size} GB</strong><span className="text-xs text-muted-foreground">review <ChevronRight className="inline size-3" /></span></span></button>;
}

function AnalyzeScreen({ used, onReview }: { used: number; onReview: (kind: ReviewKind) => void }) {
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(4);
  const [selected, setSelected] = useState(0);
  const stages = ["Reading metadata", "Detecting duplicates", "Checking file age", "Calculating impact"];
  useEffect(() => {
    if (!scanning) return;
    setStage(0);
    const timer = window.setInterval(() => setStage((current) => {
      if (current >= 3) { window.clearInterval(timer); setScanning(false); toast.success("Analysis complete", { description: "32 GB of opportunities found" }); return 4; }
      return current + 1;
    }), 850);
    return () => window.clearInterval(timer);
  }, [scanning]);
  const active = initialCategories[selected] ?? initialCategories[0];
  if (!active) return null;
  return <div className="animate-fade-in">
    <PageHeader eyebrow="Storage intelligence" title="Analyze" action={<Button size="icon" onClick={() => setScanning(true)} disabled={scanning} aria-label="Run analysis"><RefreshCw className={cn(scanning && "animate-spin")} /></Button>} />
    <section className="px-5">
      <div className="rounded-lg bg-ink p-5 text-ink-foreground">
        <div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-ink-muted">Last analyzed</p><h2 className="mt-1 text-xl font-bold">Just now</h2></div><span className="rounded-md bg-success-soft px-2 py-1 text-xs font-bold text-success">All sources</span></div>
        <div className="mt-6 grid grid-cols-4 gap-2">{stages.map((label, index) => <div key={label} className="min-w-0 text-center"><span className={cn("mx-auto grid size-8 place-items-center rounded-full bg-ink-border text-ink-muted", (stage > index || (!scanning && stage === 4)) && "bg-success text-success-foreground", scanning && stage === index && "animate-pulse bg-accent text-accent-foreground")}>{stage > index || (!scanning && stage === 4) ? <Check className="size-4" /> : index + 1}</span><p className="mt-2 text-[9px] leading-3 text-ink-muted">{label}</p></div>)}</div>
      </div>

      <SectionTitle title="What’s taking up space" meta={`${used.toFixed(1)} GB`} />
      <div className="rounded-md border border-border bg-card p-4">
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={initialCategories} dataKey="value" innerRadius={66} outerRadius={92} paddingAngle={2} onClick={(_, index) => setSelected(index)}>{initialCategories.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="var(--card)" strokeWidth={2} />)}</Pie><Tooltip formatter={(value) => [`${value} GB`, "Storage"]} /></PieChart></ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><strong className="block text-2xl">{active.value} GB</strong><span className="text-xs text-muted-foreground">{active.name}</span></div></div>
        </div>
        <div className="grid grid-cols-3 gap-2">{initialCategories.map((item, index) => <Button key={item.name} size="sm" variant={selected === index ? "secondary" : "ghost"} className="min-w-0 px-1 text-xs" onClick={() => setSelected(index)}><span className={cn("size-2 rounded-full", item.tone)} />{item.name}</Button>)}</div>
      </div>

      <SectionTitle title={`${active.name} details`} />
      <div className="rounded-md border border-border bg-card divide-y divide-border">{[
        ["Potential savings", active.name === "Videos" ? "8.0 GB" : "4.2 GB"],
        ["Files analyzed", active.name === "Photos" ? "2,840" : "684"],
        ["Oldest untouched", "3 years, 4 months"],
      ].map(([label, value]) => <div key={label} className="flex justify-between p-4 text-sm"><span className="text-muted-foreground">{label}</span><strong>{value}</strong></div>)}</div>
      <Button className="mt-4 mb-4 h-11 w-full" onClick={() => onReview(active.name === "Videos" ? "videos" : "duplicates")}>Review recommendations <ArrowRight /></Button>
    </section>
  </div>;
}

function ReviewScreen({ kind, onBack, onApply }: { kind: ReviewKind; onBack: () => void; onApply: (gb: number, message: string) => void }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"size" | "name">("size");
  const [removed, setRemoved] = useState<number[]>([]);
  const title = opportunities.find((item) => item.kind === kind)?.label ?? "File review";
  const results = useMemo(() => (kind === "duplicates" ? reviewData : otherReviewData[kind]).filter((item) => !removed.includes(item.id) && item.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "size" ? b.size - a.size : a.title.localeCompare(b.title)), [kind, query, sort, removed]);
  const act = (id: number, action: string, size: number) => {
    if (action !== "Keep") { setRemoved((items) => [...items, id]); onApply(action === "Compress" ? size * 0.45 : size, `${action} complete`); }
    else toast.success("Marked to keep", { description: "This original is protected from cleanup" });
  };
  return <div className="animate-slide-in-right">
    <header className="sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <Button size="icon" variant="ghost" onClick={onBack} aria-label="Back"><ArrowLeft /></Button><div className="min-w-0"><h1 className="truncate font-bold">{title}</h1><p className="text-xs text-muted-foreground">Smart review</p></div><Button size="icon" variant="ghost" aria-label="More options" onClick={() => toast("Review each file", { description: "Choose whether to keep, compress, archive, or delete each group." })}><MoreHorizontal /></Button>
    </header>
    <section className="px-5 py-5">
      <div className="rounded-md bg-primary-soft p-4"><div className="flex items-center gap-2 font-bold text-primary"><Sparkles className="size-4" /> Recommendation ready</div><p className="mt-1 text-sm text-muted-foreground">Keep the highest-quality original and remove redundant copies. Review every selection first.</p></div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2"><label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><Button variant="outline" onClick={() => setSort(sort === "size" ? "name" : "size")}><Filter /> {sort === "size" ? "Size" : "Name"}</Button></div>
      <div className="mt-5 flex items-end justify-between"><div><p className="text-xs text-muted-foreground">Recoverable</p><strong className="text-2xl">{results.reduce((sum, item) => sum + item.size, 0).toFixed(1)} GB</strong></div><p className="text-xs font-semibold text-muted-foreground">{results.length} groups</p></div>
      <div className="mt-4 grid gap-4 pb-4">{results.map((item) => <article key={item.id} className="overflow-hidden rounded-md border border-border bg-card">
        <div className={cn("relative h-28 bg-linear-to-br", item.tone)}><span className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2 py-1 text-xs font-bold">{item.size} GB recoverable</span></div>
        <div className="p-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><div className="min-w-0"><h2 className="truncate font-bold">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{item.meta}</p></div><span className="h-fit rounded-md bg-success-soft px-2 py-1 text-[10px] font-bold text-success">{item.tag}</span></div>
          <div className="mt-4 grid grid-cols-4 gap-1">{[["Keep", CheckCircle2], ["Compress", Zap], ["Archive", Archive], ["Delete", Trash2]].map(([label, Icon]) => { const ActionIcon = Icon as typeof CheckCircle2; return <Button key={label as string} variant={label === "Delete" ? "secondary" : "ghost"} className="h-14 flex-col gap-1 px-1 text-[10px]" onClick={() => act(item.id, label as string, item.size)}><ActionIcon className="size-4" />{label as string}</Button>; })}</div>
        </div>
      </article>)}{results.length === 0 && <div className="py-16 text-center"><CheckCircle2 className="mx-auto size-10 text-success" /><h2 className="mt-3 font-bold">All reviewed</h2><p className="mt-1 text-sm text-muted-foreground">No matching groups remain.</p></div>}</div>
    </section>
  </div>;
}

function DietScreen({ score, saved }: { score: number; saved: number }) {
  const [joined, setJoined] = useState<number[]>([0]);
  return <div className="animate-fade-in"><PageHeader eyebrow="Your sustainable routine" title="Digital Diet" />
    <section className="px-5">
      <div className="rounded-lg bg-primary p-5 text-primary-foreground"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold opacity-75">Current status</p><h2 className="mt-1 text-2xl font-bold">Healthy</h2></div><span className="text-4xl font-bold">{score}</span></div><div className="mt-6 flex h-3 overflow-hidden rounded-full bg-primary-foreground/20"><span className="bg-destructive" style={{ width: "25%" }} /><span className="bg-warning" style={{ width: "25%" }} /><span className="bg-accent" style={{ width: "25%" }} /><span className="bg-success" style={{ width: "25%" }} /></div><div className="mt-2 flex justify-between text-[10px] font-semibold opacity-80"><span>Heavy</span><span>Moderate</span><span>Healthy</span><span>Excellent</span></div><div className="mt-3 h-1 rounded-full bg-primary-foreground/20"><div className="h-1 rounded-full bg-primary-foreground" style={{ width: `${score}%` }} /></div></div>
      <SectionTitle title="September goal" meta={`${(6.4 + saved).toFixed(1)} / 10 GB`} />
      <div className="rounded-md border border-border bg-card p-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-md bg-primary-soft text-primary"><Target /></span><div><h2 className="font-bold">Reduce 10 GB</h2><p className="text-xs text-muted-foreground">18 days remaining</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (6.4 + saved) * 10)}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{Math.max(0, 3.6 - saved).toFixed(1)} GB to your goal</p></div>
      <SectionTitle title="Weekly challenges" meta="+350 pts available" />
      <div className="grid gap-3 pb-4">{[
        ["Declutter downloads", "Review 20 files", "120 pts", FolderDown],
        ["Duplicate detective", "Clear 3 matching groups", "150 pts", Search],
        ["Archive wisely", "Move 2 GB to cold storage", "80 pts", Archive],
      ].map(([title, copy, points, Icon], index) => { const ChallengeIcon = Icon as typeof Search; const active = joined.includes(index); return <div key={title as string} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-card p-4"><span className="grid size-10 place-items-center rounded-md bg-secondary"><ChallengeIcon /></span><div className="min-w-0"><h2 className="truncate font-bold">{title as string}</h2><p className="truncate text-xs text-muted-foreground">{copy as string}</p></div><Button size="sm" variant={active ? "secondary" : "outline"} onClick={() => setJoined((items) => active ? items.filter((item) => item !== index) : [...items, index])}>{active ? <Check /> : <Trophy />}{active ? "Joined" : points as string}</Button></div>; })}</div>
    </section>
  </div>;
}

function InsightsScreen({ used, saved }: { used: number; saved: number }) {
  const [sim, setSim] = useState([true, true, false]);
  const simulated = [12, 8, 7].reduce((sum, value, index) => sum + (sim[index] ? value : 0), 0);
  return <div className="animate-fade-in"><PageHeader eyebrow="Progress you can measure" title="Insights" />
    <section className="px-5">
      <div className="grid grid-cols-2 gap-3"><Metric icon={Leaf} value={(saved * 0.12).toFixed(1)} unit="kg" label="CO₂ avoided in demo" /><Metric icon={Zap} value={(saved * 0.21).toFixed(1)} unit="kWh" label="energy saved in demo" /></div>
      <SectionTitle title="Storage over time" meta="Last 6 months" />
      <div className="h-56 rounded-md border border-border bg-card p-3"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history.map((entry, index) => index === history.length - 1 ? { ...entry, storage: used } : entry)}><defs><linearGradient id="storageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} /><YAxis hide domain={[30, 55]} /><Tooltip formatter={(value) => [`${value} GB`, "Storage"]} /><Area type="monotone" dataKey="storage" stroke="var(--primary)" strokeWidth={3} fill="url(#storageFill)" /></AreaChart></ResponsiveContainer></div>
      <SectionTitle title="Your positive impact" />
      <div className="h-44 rounded-md border border-border bg-card p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={history}><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} /><YAxis hide /><Tooltip /><Line type="monotone" dataKey="carbon" stroke="var(--success)" strokeWidth={3} dot={{ fill: "var(--success)", r: 3 }} /></LineChart></ResponsiveContainer></div>
      <SectionTitle title="Before / after simulator" />
      <div className="mb-4 rounded-md border border-border bg-card p-4"><div className="grid grid-cols-2 divide-x divide-border text-center"><div><p className="text-xs text-muted-foreground">Today</p><strong className="mt-1 block text-2xl">{used.toFixed(1)} GB</strong></div><div><p className="text-xs text-muted-foreground">After diet</p><strong className="mt-1 block text-2xl text-primary">{Math.max(0, used - simulated).toFixed(1)} GB</strong></div></div><div className="my-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${Math.max(4, ((used - simulated) / 100) * 100)}%` }} /></div>{[["Remove duplicates", "12 GB"], ["Compress old videos", "8 GB"], ["Archive rare files", "7 GB"]].map(([label, value], index) => <label key={label} className="flex cursor-pointer items-center justify-between border-t border-border py-3 text-sm"><span><strong>{label}</strong><span className="ml-2 text-muted-foreground">{value}</span></span><Switch checked={sim[index] ?? false} onCheckedChange={(checked) => setSim((items) => items.map((item, itemIndex) => itemIndex === index ? checked : item))} /></label>)}<p className="mt-2 rounded-md bg-success-soft p-3 text-center text-sm font-bold text-success">Preview: save {simulated} GB · ~{(simulated * 0.12).toFixed(1)} kg CO₂</p></div>
    </section>
  </div>;
}

function ProfileScreen({ setModal }: { setModal: (modal: Modal) => void }) {
  const [notifications, setNotifications] = useState([true, true, false]);
  return <div className="animate-fade-in"><PageHeader eyebrow="Your Data Diet" title="Profile" action={<Button variant="outline" size="icon" aria-label="Settings" onClick={() => document.getElementById("profile-notifications")?.scrollIntoView({ behavior: "smooth" })}><Settings2 /></Button>} />
    <section className="px-5">
      <div className="flex items-center gap-4 rounded-lg bg-ink p-5 text-ink-foreground"><span className="grid size-14 place-items-center rounded-full bg-accent text-xl font-bold text-accent-foreground">HJ</span><div><h2 className="text-lg font-bold">Harsha Jadhav</h2><p className="text-sm text-ink-muted">Mindful saver · 1,240 points</p></div></div>
      <SectionTitle title="Connected sources" meta="2 active" />
      <div className="rounded-md border border-border bg-card divide-y divide-border">{[[Cloud, "Google Drive", "24.8 GB"], [HardDrive, "This device", "13.6 GB"], [Database, "Microsoft OneDrive", "Connect"]].map(([Icon, label, value], index) => { const SourceIcon = Icon as typeof Cloud; return <div key={label as string} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4"><SourceIcon className="text-primary" /><div className="min-w-0"><strong className="block truncate text-sm">{label as string}</strong><span className="text-xs text-muted-foreground">{index < 2 ? "Synced today" : "Not connected"}</span></div><Button size="sm" variant="ghost">{value as string}</Button></div>; })}</div>
      <div id="profile-notifications"><SectionTitle title="Notifications" /></div>
      <div className="rounded-md border border-border bg-card divide-y divide-border">{["Weekly footprint report", "Goal progress", "Challenge reminders"].map((label, index) => <label key={label} className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold">{label}<Switch checked={notifications[index] ?? false} onCheckedChange={(checked) => setNotifications((items) => items.map((item, itemIndex) => itemIndex === index ? checked : item))} /></label>)}</div>
      <SectionTitle title="Learn & understand" />
      <div className="grid gap-2 pb-4">{[["green", Leaf, "Green storage", "SSD, HDD, and cloud energy"], ["carbon", Gauge, "Calculation assumptions", "How estimates are formed"], ["privacy", LockKeyhole, "Privacy first", "Metadata-only analysis"]].map(([id, Icon, label, copy]) => { const RowIcon = Icon as typeof Leaf; return <Button key={id as string} variant="outline" className="h-auto justify-start p-4 text-left" onClick={() => setModal(id as Modal)}><span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary"><RowIcon /></span><span className="min-w-0 flex-1"><strong className="block">{label as string}</strong><span className="block truncate text-xs font-normal text-muted-foreground">{copy as string}</span></span><ChevronRight /></Button>; })}</div>
      <p className="pb-6 text-center text-xs text-muted-foreground">Supporting SDG 12 Responsible Consumption · SDG 13 Climate Action</p>
    </section>
  </div>;
}

function EducationDialog({ modal, onClose }: { modal: Modal; onClose: () => void }) {
  const content = {
    carbon: { icon: Gauge, title: "How impact is estimated", intro: "Data Diet converts stored gigabytes into energy and carbon estimates using published lifecycle averages.", items: [["Storage energy", "0.178 kWh per GB-year across active and replicated storage."], ["Grid intensity", "A global average carbon intensity is applied to estimated energy demand."], ["Honest estimates", "Results are directional, not a utility bill or audited footprint."]] },
    privacy: { icon: LockKeyhole, title: "Privacy-first analysis", intro: "The demo models an analysis that understands file patterns without reading personal content.", items: [["Metadata only", "File name, type, size, age, location, and a non-reversible signature."], ["You approve actions", "Recommendations never remove or move a file automatically."], ["Local where possible", "Device analysis is designed to remain on your device."]] },
    green: { icon: Leaf, title: "A guide to green storage", intro: "Every file depends on hardware, electricity, cooling, and usually several redundant copies.", items: [["SSD", "Fast and efficient while active, but manufacturing still carries embodied carbon."], ["HDD", "Efficient for large archives, though spinning disks use ongoing power."], ["Cloud", "Convenient and resilient, with replication that can multiply the physical storage used."]] },
  } as const;
  const data = modal ? content[modal] : content.carbon;
  const Icon = data.icon;
  return <Dialog open={modal !== null} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg"><DialogHeader><span className="mb-3 grid size-11 place-items-center rounded-md bg-primary-soft text-primary"><Icon /></span><DialogTitle className="text-left text-2xl">{data.title}</DialogTitle><DialogDescription className="text-left leading-6">{data.intro}</DialogDescription></DialogHeader><div className="grid gap-3">{data.items.map(([title, copy]) => <div key={title} className="rounded-md border border-border bg-card p-4"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div><div className="flex items-center gap-2 rounded-md bg-secondary p-3 text-xs text-muted-foreground"><Info className="size-4 shrink-0" /> Assumptions can be reviewed anytime in Profile.</div></DialogContent></Dialog>;
}