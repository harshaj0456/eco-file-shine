import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardDrive,
  Cpu,
  Recycle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import { useUIStore, type NavTab } from "@/lib/store/uiStore";
import { carouselVariants } from "@/lib/animations";

export interface CarouselSlide {
  id: string;
  tab: NavTab | "report";
  title: string;
  tagline: string;
  description: string;
  statLabel: string;
  statValue: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  gradient: string;
  borderGlow: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: "data-diet",
    tab: "dataDiet",
    title: "Data Diet Cleanse",
    tagline: "STORAGE OPTIMIZER",
    description: "Scan junk cache, duplicate photos, and stale downloads to slash digital carbon.",
    statLabel: "Recoverable Storage",
    statValue: "18.4 GB",
    badge: "SDG 12: Circular Storage",
    icon: HardDrive,
    accentColor: "text-emerald-500",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderGlow: "group-hover:border-emerald-500/40",
  },
  {
    id: "green-queue",
    tab: "greenQueue",
    title: "GreenQueue Compute",
    tagline: "LOW-CARBON SCHEDULER",
    description: "Shift heavy exports and AI workloads to green grid hours with 0g additional CO2.",
    statLabel: "Grid Clean Energy",
    statValue: "88% Clean",
    badge: "SDG 13: Climate Action",
    icon: Cpu,
    accentColor: "text-teal-500",
    gradient: "from-teal-500/10 via-cyan-500/5 to-transparent",
    borderGlow: "group-hover:border-teal-500/40",
  },
  {
    id: "e-waste-report",
    tab: "devices",
    title: "E-Waste Passport",
    tagline: "HARDWARE LONGEVITY",
    description: "Monitor battery cycle wear, hardware life expectancy, and certified repair routes.",
    statLabel: "Fleet Health Score",
    statValue: "94 / 100",
    badge: "SDG 12: Waste Prevention",
    icon: Recycle,
    accentColor: "text-emerald-600",
    gradient: "from-emerald-600/10 via-green-500/5 to-transparent",
    borderGlow: "group-hover:border-emerald-600/40",
  },
];

export function DashboardCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartX = useRef<number>(0);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentSlide = SLIDES[currentIndex];
  const Icon = currentSlide.icon;

  const handleLaunch = (tab: NavTab | "report") => {
    if (tab === "report") {
      window.location.href = "/report";
    } else {
      setActiveTab(tab);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden group select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Accent Gradients */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient} opacity-70 transition-opacity duration-700 pointer-events-none`}
      />

      <div className="relative p-5 sm:p-6 min-h-[190px] flex flex-col justify-between">
        {/* Animated Slide Content */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            {/* Left Content Column */}
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="grid place-items-center size-12 sm:size-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-500 shrink-0 shadow-inner">
                <Icon className="size-6 sm:size-7" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {currentSlide.tagline}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                    <Sparkles className="size-2.5 text-emerald-500" />
                    {currentSlide.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {currentSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>
            </div>

            {/* Right Metric & Action Column */}
            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-border/40 md:border-t-0">
              <div className="flex flex-col md:text-right">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {currentSlide.statLabel}
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight text-emerald-600 dark:text-emerald-400">
                  {currentSlide.statValue}
                </span>
              </div>

              <button
                onClick={() => handleLaunch(currentSlide.tab)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <span>Open Section</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Bottom Control Bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-7 bg-emerald-500 shadow-xs shadow-emerald-500/50"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                title={`Go to ${slide.title}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            {/* Pause / Play Auto-scroll */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            >
              {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>

            {/* Prev */}
            <button
              onClick={prevSlide}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Previous slide"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Next */}
            <button
              onClick={nextSlide}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Next slide"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
