import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/uiStore";
import { fireConfetti } from "@/lib/confetti";
import {
  Gauge,
  HardDrive,
  Zap,
  Laptop,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Leaf,
} from "lucide-react";

const TOUR_STEPS = [
  {
    icon: Gauge,
    title: "1. Digital Sustainability Score",
    subtitle: "Your live carbon & digital health index (0–100)",
    description:
      "GreenPulse aggregates your storage efficiency, compute scheduling, and device longevity into one dynamic score. As you clean files or shift workloads into clean grid hours, watch your score rise in real time.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: HardDrive,
    title: "2. Data Diet Storage Optimizer",
    subtitle: "Treemap, bubble views & rule-based cleanup",
    description:
      "Visualize your digital storage by category. Drag files directly onto Keep, Compress, Archive, or Delete zones with multi-select support and 10-step instant Undo history.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "3. GreenQueue Carbon-Aware Scheduler",
    subtitle: "24-Hour grid intensity timeline & batch simulation",
    description:
      "Electricity grids get cleaner when solar and wind peak. Drag your compute workloads to green slots to minimize CO₂ emissions and test your schedule with the live 'Simulate Day' clock.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Laptop,
    title: "4. E-Waste Passport & Hardware Life",
    subtitle: "Repair vs Replace interactive comparison",
    description:
      "Extend your electronics lifespan. Compare the financial cost, e-waste, and embodied carbon savings of repairing versus buying new devices with detailed lifecycle passports.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Sparkles,
    title: "5. Green Assistant & User-Defined Settings",
    subtitle: "Custom rules, unit systems, and AI guidance",
    description:
      "Everything is customizable: from regional grid carbon curves and custom job types to 8 settings tabs. Press Ctrl+K anytime to open the Command Palette or ask the Green Assistant for live insights.",
    color: "from-emerald-600 to-green-400",
  },
];

export function ProductTour() {
  const { isTourActive, tourStep, nextTourStep, prevTourStep, endTour, setActiveTab } = useUIStore();

  if (!isTourActive) return null;

  const current = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const Icon = current.icon;

  const handleNext = () => {
    if (isLast) {
      fireConfetti();
      endTour();
    } else {
      nextTourStep();
    }
  };

  return (
    <Dialog open={isTourActive} onOpenChange={(open) => !open && endTour()}>
      <DialogContent className="max-w-lg font-sans bg-card border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Leaf className="size-3.5" /> Product Tour ({tourStep + 1}/{TOUR_STEPS.length})
            </span>
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === tourStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-tr ${current.color} text-white shadow-md`}>
              <Icon className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{current.title}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-foreground/80 mt-0.5">
                {current.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-3 rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground border border-border/50">
          {current.description}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={endTour} className="text-xs text-muted-foreground">
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {tourStep > 0 && (
              <Button variant="outline" size="sm" onClick={prevTourStep} className="text-xs">
                <ArrowLeft className="mr-1 size-3.5" /> Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="text-xs font-bold">
              {isLast ? (
                <>
                  <Check className="mr-1 size-3.5" /> Let's Go!
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-1 size-3.5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
