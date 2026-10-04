import { useState } from "react";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIPS = [
  {
    title: "Cold Storage Compression",
    text: "Videos and RAW images over 1 year old lose 95% access frequency. Converting them to AV1 or HEVC cuts cloud storage emissions in half without visual degradation.",
  },
  {
    title: "Off-Peak Batch Jobs",
    text: "Running neural net training or heavy Docker builds between 01:00 and 05:00 leverages surplus grid wind energy, saving up to 60% operational carbon.",
  },
  {
    title: "Thermal Care Extends Hardware",
    text: "Blowing dust out of laptop heat sinks drops operating temperatures by 8–12°C, preventing thermal throttling and extending lithium-ion battery lifespan by up to 2 years.",
  },
  {
    title: "Duplicate Burst Shots",
    text: "Modern phones take 10 photos per second in burst mode. An average gallery contains 8–15 GB of nearly identical shots that waste continuous standby energy.",
  },
];

export function GreenTipWidget() {
  const [index, setIndex] = useState(0);
  const current = TIPS[index % TIPS.length] || TIPS[0]!;

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Lightbulb className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Green Computing Tip of the Day</h3>
            <span className="text-[11px] text-muted-foreground">Actionable sustainable habits</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIndex((i) => i + 1)}
        >
          <RotateCcw className="mr-1 size-3" /> Next Tip
        </Button>
      </div>

      <div className="my-3 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed border border-border/50">
        <h4 className="font-bold text-foreground mb-1">{current.title}</h4>
        <p className="text-muted-foreground">{current.text}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <span>Curated by GreenPulse Energy Lab</span>
        <span className="font-semibold text-primary">Micro-habit impact</span>
      </div>
    </div>
  );
}
