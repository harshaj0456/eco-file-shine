import { useState } from "react";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore, type WidgetId } from "@/lib/store/uiStore";
import { ScoreGaugeWidget } from "./widgets/ScoreGaugeWidget";
import { ActionPlanWidget } from "./widgets/ActionPlanWidget";
import { DataDietWidget } from "./widgets/DataDietWidget";
import { GreenQueueWidget } from "./widgets/GreenQueueWidget";
import { DevicesWidget } from "./widgets/DevicesWidget";
import { TrendChartWidget } from "./widgets/TrendChartWidget";
import { GoalsWidget } from "./widgets/GoalsWidget";
import { UpcomingScheduleWidget } from "./widgets/UpcomingScheduleWidget";
import { RecentImpactWidget } from "./widgets/RecentImpactWidget";
import { GreenTipWidget } from "./widgets/GreenTipWidget";
import { DashboardCarousel } from "./DashboardCarousel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WIDGET_COMPONENTS: Record<WidgetId, React.ComponentType> = {
  score_gauge: ScoreGaugeWidget,
  action_plan: ActionPlanWidget,
  data_diet_card: DataDietWidget,
  green_queue_card: GreenQueueWidget,
  devices_card: DevicesWidget,
  trend_chart: TrendChartWidget,
  goals_card: GoalsWidget,
  upcoming_schedule: UpcomingScheduleWidget,
  recent_impact: RecentImpactWidget,
  green_tips: GreenTipWidget,
};

export function CustomizableDashboard() {
  const {
    widgets,
    isEditingDashboard,
    setIsEditingDashboard,
    toggleWidget,
    setWidgetColSpan,
    reorderWidgets,
    applyNamedLayout,
  } = useUIStore();

  const handleLayoutSelect = (name: "standard" | "student" | "admin") => {
    applyNamedLayout(name);
    toast.success(`Applied ${name.toUpperCase()} layout preset`);
  };

  const getColSpanClass = (span: "full" | "half" | "third") => {
    if (span === "full") return "col-span-1 md:col-span-2 lg:col-span-3";
    if (span === "half") return "col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1.5";
    return "col-span-1";
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Digital Carbon & Sustainability Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time telemetry across your storage footprint, compute grid, and hardware lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Named Layouts Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                <LayoutDashboard className="mr-1.5 size-3.5" /> Layout Presets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-sans">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Preset Layouts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLayoutSelect("standard")} className="text-xs font-medium">
                Standard View (Balanced)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutSelect("student")} className="text-xs font-medium">
                Student View (Labs & Laptops)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutSelect("admin")} className="text-xs font-medium">
                Admin View (Fleet & Batch)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Mode Button */}
          <Button
            variant={isEditingDashboard ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs font-bold gap-1.5"
            onClick={() => setIsEditingDashboard(!isEditingDashboard)}
          >
            <SlidersHorizontal className="size-3.5" />
            {isEditingDashboard ? "Done Customizing" : "Edit Dashboard"}
          </Button>
        </div>
      </div>

      {/* Main Section Highlights Carousel */}
      <DashboardCarousel />


      {/* Edit Mode Customizer Panel */}
      {isEditingDashboard && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Widget Customizer & Reorder
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Toggle visibility, rearrange order, or adjust widget widths
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget, idx) => (
              <div
                key={widget.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-2.5 text-xs bg-card transition-all",
                  widget.enabled ? "border-border shadow-2xs" : "border-border/40 opacity-60 bg-muted/40"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className="text-muted-foreground hover:text-foreground"
                    title={widget.enabled ? "Hide Widget" : "Show Widget"}
                  >
                    {widget.enabled ? (
                      <Eye className="size-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className="font-semibold text-foreground truncate">{widget.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Width selector */}
                  <select
                    value={widget.colSpan}
                    onChange={(e) => setWidgetColSpan(widget.id, e.target.value as any)}
                    className="h-6 rounded border border-input bg-background px-1 text-[10px] font-medium text-foreground"
                  >
                    <option value="third">1/3 Col</option>
                    <option value="half">1/2 Col</option>
                    <option value="full">Full Width</option>
                  </select>

                  {/* Reorder buttons */}
                  <button
                    disabled={idx === 0}
                    onClick={() => reorderWidgets(idx, idx - 1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <MoveUp className="size-3" />
                  </button>
                  <button
                    disabled={idx === widgets.length - 1}
                    onClick={() => reorderWidgets(idx, idx + 1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <MoveDown className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {widgets
          .filter((w) => w.enabled)
          .map((widget) => {
            const Component = WIDGET_COMPONENTS[widget.id];
            if (!Component) return null;
            return (
              <div key={widget.id} className={getColSpanClass(widget.colSpan)}>
                <Component />
              </div>
            );
          })}
      </div>
    </div>
  );
}
