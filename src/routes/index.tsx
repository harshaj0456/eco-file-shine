import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, HardDrive, Leaf, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenPulse — Digital Sustainability Dashboard" },
      { name: "description", content: "Clean wasteful storage, run heavy tasks at low-carbon hours, and keep devices longer with GreenPulse." },
      { property: "og:title", content: "GreenPulse — Digital Sustainability Dashboard" },
      { property: "og:description", content: "Clean your digital footprint. Keep what matters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: HardDrive, title: "Data Diet", body: "Find duplicates, old videos and forgotten downloads." },
  { icon: Cpu, title: "GreenQueue", body: "Schedule heavy tasks for the cleanest hours." },
  { icon: Recycle, title: "E-Waste Passport", body: "Track device life, repairs and recycling." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-app-shell font-sans">
      <div className="mx-auto flex max-w-4xl flex-col px-6 py-16">
        <div className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-4" /></span>
          GreenPulse
        </div>
        <h1 className="mt-14 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">Clean your digital footprint. Keep what matters.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">One dashboard for storage, compute and devices, aligned with SDG 12 and SDG 13.</p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg"><Link to="/auth">Get started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/app">Open dashboard</Link></Button>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-5">
              <f.icon className="size-5 text-primary" />
              <h2 className="mt-3 font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
