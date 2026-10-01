import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSettings, weightedScore, WEIGHT_LABELS, type Weights } from "@/lib/settings";
import { DEMO_FILES, loadStatus } from "@/lib/storage-files";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Report — GreenPulse" },
      { name: "description", content: "Printable summary of your GreenPulse score, rules and files." },
      { property: "og:title", content: "Report — GreenPulse" },
      { property: "og:description", content: "Your digital footprint summary." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { data: s } = useSettings();
  if (!s) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  const status = loadStatus();
  return (
    <div className="mx-auto max-w-3xl p-6 font-sans">
      <div className="no-print mb-4 flex gap-2">
        <Button variant="outline" asChild><Link to="/settings">Back</Link></Button>
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <h1 className="text-2xl font-extrabold">GreenPulse report</h1>
      <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
      <h2 className="mt-6 font-bold">Score: {weightedScore(s.weights)}/100</h2>
      <ul className="text-sm">{(Object.keys(s.weights) as (keyof Weights)[]).map((k) => <li key={k}>{WEIGHT_LABELS[k]}: {s.weights[k]}%</li>)}</ul>
      <h2 className="mt-6 font-bold">Rules</h2>
      <ul className="text-sm">{s.rules.map((r) => <li key={r.id}>IF {r.category} older than {r.months} months THEN {r.action}{r.enabled ? "" : " (off)"}</li>)}</ul>
      <h2 className="mt-6 font-bold">Files</h2>
      <table className="w-full text-left text-sm"><tbody>{DEMO_FILES.map((f) => <tr key={f.id} className="border-b border-border"><td>{f.name}</td><td>{f.folder}</td><td>{f.sizeGB} GB</td><td>{status[f.id] ?? "active"}</td></tr>)}</tbody></table>
    </div>
  );
}
