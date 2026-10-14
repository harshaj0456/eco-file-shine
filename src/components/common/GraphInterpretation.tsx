import { useState, type ReactNode } from "react";
import { ChevronDown, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphInterpretationProps {
  /** Plain-language reading of what THIS data shows right now. */
  summary: ReactNode;
  /** Short steps explaining how to read the graph. */
  howToRead?: string[];
  /** Suggested action. */
  takeaway?: ReactNode;
  tone?: "good" | "warn" | "info";
  className?: string;
}

const TONES = {
  good: "border-emerald-500/30 bg-emerald-500/5",
  warn: "border-amber-500/30 bg-amber-500/5",
  info: "border-border bg-muted/40",
} as const;

export function GraphInterpretation({
  summary,
  howToRead,
  takeaway,
  tone = "info",
  className,
}: GraphInterpretationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-lg border p-3 text-xs font-sans", TONES[tone], className)}>
      <div className="flex items-start gap-2">
        <LineChart className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-foreground">
            Graph interpretation
          </div>
          <p className="leading-relaxed text-muted-foreground">{summary}</p>
          {takeaway && (
            <p className="leading-relaxed text-foreground">
              <span className="font-bold">Takeaway: </span>
              {takeaway}
            </p>
          )}
          {howToRead && howToRead.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex items-center gap-1 pt-0.5 font-bold text-primary hover:underline"
              >
                How to read this graph
                <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                  {howToRead.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
