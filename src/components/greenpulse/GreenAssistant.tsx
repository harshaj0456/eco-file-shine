import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Bot,
  Send,
  User,
  Zap,
  HardDrive,
  Laptop,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { calculateCompositeScore, formatCarbonValue } from "@/lib/services/CarbonCalculator";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    targetTab: NavTab;
  };
}

const QUICK_QUESTIONS = [
  "What should I do this week?",
  "Why is my score at its current level?",
  "How is GreenQueue carbon calculated?",
  "Which file wastes the most carbon?",
  "How does repairing a device save CO₂?",
];

export function GreenAssistant() {
  const { isAssistantOpen, setAssistantOpen, setActiveTab } = useUIStore();
  const { files, jobs, devices, goals, xp } = useDataStore();
  const { settings } = useSettingsStore();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: `Hello! I'm your GreenPulse Assistant. I monitor your storage, scheduled compute, and device lifecycles in real time. Ask me anything about your carbon footprint or pick a quick topic below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAssistantOpen]);

  const handleSend = (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");

    // Simulate smart rule-based dynamic reasoning
    setTimeout(() => {
      const response = generateAssistantResponse(q, { files, jobs, devices, goals, settings, xp });
      setMessages((prev) => [...prev, response]);
    }, 400);
  };

  return (
    <Sheet open={isAssistantOpen} onOpenChange={setAssistantOpen}>
      <SheetContent className="flex w-full flex-col font-sans sm:max-w-md bg-card">
        <SheetHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground shadow-xs">
              <Bot className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold flex items-center gap-1.5">
                Green Assistant
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Live Data
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs">
                Context-aware carbon & storage optimization intelligence
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-2.5 text-xs",
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full",
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {m.sender === "user" ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
              </div>
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl p-3 leading-relaxed",
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-muted text-foreground rounded-tl-xs border border-border/50"
                )}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {m.actionButton && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5 h-7 w-full border-primary/40 bg-background text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      setActiveTab(m.actionButton!.targetTab);
                      setAssistantOpen(false);
                    }}
                  >
                    {m.actionButton.label} <ArrowRight className="ml-1 size-3" />
                  </Button>
                )}
                <span className="mt-1 block text-[9px] opacity-60 text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="border-t border-border pt-2 pb-1">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <span>Quick Suggestions</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/50 hover:bg-primary-soft hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 pt-1"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about storage, jobs, or hardware…"
            className="h-9 text-xs"
          />
          <Button type="submit" size="icon" className="size-9 shrink-0" disabled={!input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function generateAssistantResponse(
  query: string,
  context: {
    files: ReturnType<typeof useDataStore.getState>["files"];
    jobs: ReturnType<typeof useDataStore.getState>["jobs"];
    devices: ReturnType<typeof useDataStore.getState>["devices"];
    goals: ReturnType<typeof useDataStore.getState>["goals"];
    settings: ReturnType<typeof useSettingsStore.getState>["settings"];
    xp: number;
  }
): ChatMessage {
  const q = query.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const totalStorageGb = context.files.reduce((s, f) => s + f.sizeGB, 0);
  const activeFiles = context.files.filter((f) => f.status === "active");
  const duplicates = context.files.filter((f) => f.isDuplicate);
  const dupGb = duplicates.reduce((s, f) => s + f.sizeGB, 0);
  const largestFile = [...activeFiles].sort((a, b) => b.sizeGB - a.sizeGB)[0];

  // 1. WHAT SHOULD I DO THIS WEEK?
  if (q.includes("what should i do") || q.includes("action") || q.includes("recommend")) {
    let recommendations = "Here is your high-impact action plan for this week:\n\n";
    if (dupGb > 0) {
      recommendations += `1. **Clean Duplicate Media**: You have ${duplicates.length} duplicate items (${dupGb.toFixed(1)} GB). Archiving or deleting them recovers space immediately.\n`;
    }
    const scheduledJobs = context.jobs.filter((j) => j.status === "scheduled");
    if (scheduledJobs.length > 0) {
      recommendations += `2. **GreenQueue Workloads**: You have ${scheduledJobs.length} scheduled jobs. Ensure heavy compute runs between 12:00-15:00 for minimum grid carbon.\n`;
    }
    const agingDevice = context.devices.find((d) => d.healthPercent < 85);
    if (agingDevice) {
      recommendations += `3. **Device Health Check**: ${agingDevice.name} health is at ${agingDevice.healthPercent}%. Consider a fan clean or battery diagnostic.\n`;
    }

    return {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text: recommendations,
      timestamp: time,
      actionButton: {
        label: "Open Data Diet",
        targetTab: "dataDiet",
      },
    };
  }

  // 2. WHY IS MY SCORE AT ITS CURRENT LEVEL?
  if (q.includes("score") || q.includes("why did my score")) {
    const w = context.settings.scoring;
    const text = `Your Digital Carbon Score is computed as a weighted blend:
• **Data Diet**: ${w.dataDiet}% weight (${totalStorageGb.toFixed(1)} GB tracked)
• **GreenQueue**: ${w.greenQueue}% weight (${context.jobs.length} compute workloads)
• **E-Waste Passport**: ${w.devices}% weight (${context.devices.length} hardware assets)

To raise your score by +5 to +10 points:
1. Delete cold downloads (>6 months old).
2. Shift a job to an off-peak green window.
3. Complete pending WEEE checklist items in Passport.`;

    return {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: time,
      actionButton: {
        label: "Adjust Scoring Weights",
        targetTab: "home",
      },
    };
  }

  // 3. HOW IS GREENQUEUE CALCULATED?
  if (q.includes("greenqueue") || q.includes("compute") || q.includes("grid")) {
    const text = `GreenQueue calculates carbon footprint using this scientific formula:
$$\\text{CO}_2\\text{ (grams)} = \\text{Power (kW)} \\times \\text{Duration (hours)} \\times \\text{Grid Intensity (g/kWh)}$$

• **Current Grid Profile**: ${context.settings.general.region.toUpperCase()} (~250-370 g/kWh avg)
• **Cleanest Time of Day**: Midday solar (11:00–15:00) & overnight wind (01:00–05:00)
• **Peak Dirty Hours**: Evening peak (17:00–21:00) where fossil peaker plants fire up.`;

    return {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: time,
      actionButton: {
        label: "View GreenQueue Timeline",
        targetTab: "greenQueue",
      },
    };
  }

  // 4. WHICH FILE WASTES THE MOST CARBON?
  if (q.includes("which file") || q.includes("largest") || q.includes("waste")) {
    if (!largestFile) {
      return {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: "You have no active files currently tracked in Data Diet.",
        timestamp: time,
      };
    }
    const annualGrams = largestFile.carbonGramsAnnual;
    const text = `Your highest impact file is **"${largestFile.name}"**:
• **Size**: ${largestFile.sizeGB.toFixed(1)} GB in \`${largestFile.folder}\`
• **Age**: ${largestFile.ageMonths} months old
• **Annual Cloud Overhead**: ${formatCarbonValue(annualGrams, context.settings.units.weight)} / year
• **Recommendation**: ${largestFile.ageMonths > 12 ? "Archive to cold storage or compress to cut 50% carbon." : "Keep active."}`;

    return {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: time,
      actionButton: {
        label: `Review ${largestFile.name}`,
        targetTab: "dataDiet",
      },
    };
  }

  // 5. HOW DOES REPAIR SAVE CO2?
  if (q.includes("repair") || q.includes("device") || q.includes("passport")) {
    const text = `Manufacturing electronics generates enormous **embodied carbon**:
• Manufacturing a laptop creates ~**280 kg CO₂e** and consumes 1,500 liters of water.
• Manufacturing a smartphone generates ~**70 kg CO₂e**.

By repairing a device (new battery, fan cleaning, SSD upgrade) instead of replacing it, you extend its life by 2–3 years, saving **~120–180 kg CO₂e** and preventing toxic e-waste from entering landfills.`;

    return {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: time,
      actionButton: {
        label: "Open E-Waste Passport",
        targetTab: "devices",
      },
    };
  }

  // Fallback
  return {
    id: `a-${Date.now()}`,
    sender: "assistant",
    text: `I analyzed your GreenPulse repository:
• Total storage: ${totalStorageGb.toFixed(1)} GB across ${context.files.length} items
• Registered devices: ${context.devices.length} hardware units
• Total XP: ${context.xp} XP

You can ask me to evaluate files, scheduled jobs, device repair ROI, or how to tune your scoring rules!`,
    timestamp: time,
  };
}
