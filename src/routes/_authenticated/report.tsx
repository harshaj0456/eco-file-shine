import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, Leaf, HardDrive, Zap, Laptop, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useDataStore } from "@/lib/store/dataStore";
import { useProfile } from "@/lib/profile";
import {
  calculateCompositeScore,
  formatCarbonValue,
  formatStorageValue,
  formatCurrencyValue,
} from "@/lib/services/CarbonCalculator";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Sustainability Impact Report — GreenPulse" },
      { name: "description", content: "Comprehensive printable digital carbon, compute, and hardware impact report." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { data: profile } = useProfile();
  const { settings } = useSettingsStore();
  const { files, jobs, devices, goals, xp, streakDays } = useDataStore();

  const activeFiles = files.filter((f) => f.status === "active");
  const cleanedFiles = files.filter((f) => f.status !== "active");
  const totalActiveGb = activeFiles.reduce((s, f) => s + f.sizeGB, 0);
  const totalCleanedGb = cleanedFiles.reduce((s, f) => s + f.sizeGB, 0);

  const totalSavedCo2Grams = jobs.reduce((s, j) => s + j.co2SavedGrams, 0);
  const totalDeviceSavedKg = devices.reduce(
    (s, d) => s + d.maintenanceHistory.reduce((mS, m) => mS + m.co2SavedKg, 0),
    0
  );

  const storageHealth = Math.min(100, Math.max(20, 100 - activeFiles.length * 2.5));
  const computeHealth = Math.min(100, Math.max(30, 70 + jobs.filter((j) => j.status === "completed").length * 8));
  const deviceHealth = Math.round(
    devices.length > 0 ? devices.reduce((sum, d) => sum + d.healthPercent, 0) / devices.length : 85
  );

  const score = calculateCompositeScore(storageHealth, computeHealth, deviceHealth, settings.scoring);

  return (
    <div className="min-h-screen bg-background p-6 font-sans text-foreground md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Print Bar (Hidden during printing) */}
        <div className="no-print flex items-center justify-between border-b border-border pb-4">
          <Button variant="outline" size="sm" asChild className="gap-1.5 font-semibold">
            <Link to="/app">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()} className="font-bold gap-1.5 shadow-sm">
            <Printer className="size-4" /> Print or Save as PDF
          </Button>
        </div>

        {/* Report Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-primary pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-extrabold text-xl text-foreground">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-4" />
              </span>
              GreenPulse Digital Sustainability Report
            </div>
            <p className="text-xs text-muted-foreground">
              Audited account: <strong className="text-foreground">{profile?.display_name || "Eco User"}</strong> ({profile?.usage_mode?.toUpperCase()} mode)
            </p>
            <p className="text-xs text-muted-foreground">
              Grid profile: <strong className="text-foreground">{settings.general.region.toUpperCase()}</strong> · Currency: {settings.units.currency}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground font-mono">
              Report Date: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-sm font-extrabold text-primary">
              Composite Score: {score}/100
            </div>
          </div>
        </div>

        {/* Section 1: Executive Sustainability Metrics */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
            1. Executive Sustainability Score & Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-border p-3.5 bg-muted/20">
              <span className="text-muted-foreground font-semibold block">Composite Score</span>
              <span className="text-2xl font-extrabold text-primary font-mono">{score}/100</span>
            </div>
            <div className="rounded-xl border border-border p-3.5 bg-muted/20">
              <span className="text-muted-foreground font-semibold block">Active Storage</span>
              <span className="text-2xl font-extrabold text-foreground font-mono">
                {formatStorageValue(totalActiveGb, settings.units.storage)}
              </span>
            </div>
            <div className="rounded-xl border border-border p-3.5 bg-muted/20">
              <span className="text-muted-foreground font-semibold block">Avoided Compute CO₂</span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                {formatCarbonValue(totalSavedCo2Grams, settings.units.weight)}
              </span>
            </div>
            <div className="rounded-xl border border-border p-3.5 bg-muted/20">
              <span className="text-muted-foreground font-semibold block">Hardware CO₂ Saved</span>
              <span className="text-2xl font-extrabold text-purple-600 font-mono">
                +{totalDeviceSavedKg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Data Diet Storage Audit */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <HardDrive className="size-4 text-blue-500" /> 2. Data Diet Storage Audit ({files.length} items)
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-3 py-2 font-bold">File Name</th>
                  <th className="px-3 py-2 font-bold">Folder</th>
                  <th className="px-3 py-2 font-bold">Category</th>
                  <th className="px-3 py-2 font-bold">Size</th>
                  <th className="px-3 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-3 py-2 font-bold">{file.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{file.folder}</td>
                    <td className="px-3 py-2">{file.category}</td>
                    <td className="px-3 py-2 font-mono">{file.sizeGB.toFixed(1)} GB</td>
                    <td className="px-3 py-2 uppercase font-bold text-[10px]">{file.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: GreenQueue Workloads */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500" /> 3. GreenQueue Compute Workloads ({jobs.length} tasks)
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-3 py-2 font-bold">Workload</th>
                  <th className="px-3 py-2 font-bold">Power Draw</th>
                  <th className="px-3 py-2 font-bold">Scheduled Slot</th>
                  <th className="px-3 py-2 font-bold">Emissions</th>
                  <th className="px-3 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-3 py-2 font-bold">{job.name}</td>
                    <td className="px-3 py-2 font-mono">{job.powerKw} kW ({job.durationHours}h)</td>
                    <td className="px-3 py-2 font-bold">{String(job.scheduledSlotHour).padStart(2, "0")}:00</td>
                    <td className="px-3 py-2 font-mono">{Math.round(job.estimatedCo2Grams)} g CO₂</td>
                    <td className="px-3 py-2 uppercase font-bold text-[10px]">{job.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Hardware Passports */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Laptop className="size-4 text-purple-500" /> 4. E-Waste Passports & Fleet Health ({devices.length} units)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((dev) => (
              <div key={dev.id} className="rounded-xl border border-border p-3 text-xs space-y-1 bg-muted/20">
                <div className="flex justify-between font-bold text-foreground">
                  <span>{dev.name}</span>
                  <span className="font-mono text-primary">{dev.healthPercent}% Health</span>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Age: {dev.currentAgeYears} yrs · Embodied Carbon: {dev.embodiedCarbonKg} kg · Service Logs: {dev.maintenanceHistory.length}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Generated automatically by GreenPulse Personal Digital Carbon & Storage Optimizer ·{" "}
          {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
