import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Folder,
  HardDrive,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Leaf,
  Zap,
} from "lucide-react";
import { GreenPulseLogo } from "@/components/branding/GreenPulseLogo";
import { customSpringEase, smoothEase } from "@/lib/animations";

export interface OnboardingAnimationProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface Particle {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  startX: number; // percentage (-50 to 150)
  startY: number; // percentage (-50 to 150)
  targetX: number; // cluster offset (-60px to 60px)
  targetY: number; // cluster offset (-60px to 60px)
  size: number;
  isWaste: boolean; // Will disappear in filter step
  delay: number;
}

export function OnboardingAnimation({ onComplete, onSkip }: OnboardingAnimationProps) {
  // Stages: 0: Logo, 1: Particle Stream, 2: Cluster Cloud, 3: Overloaded, 4: Filter Cleanse, 5: Green Pulse, 6: Transition Done
  const [stage, setStage] = useState<number>(0);

  // Generate deterministic particle field for smooth 60fps animation
  const particles: Particle[] = useMemo(() => {
    const icons = [
      { icon: FileText, label: "file", isWaste: true },
      { icon: ImageIcon, label: "photo", isWaste: false },
      { icon: Video, label: "video", isWaste: true },
      { icon: Folder, label: "folder", isWaste: false },
      { icon: HardDrive, label: "storage", isWaste: true },
      { icon: FileSpreadsheet, label: "doc", isWaste: false },
      { icon: Trash2, label: "temp", isWaste: true },
    ];

    const list: Particle[] = [];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const iconDef = icons[i % icons.length];
      const angle = (i / count) * 2 * Math.PI;
      const radius = 140 + (i % 4) * 30; // start distance

      list.push({
        id: i,
        icon: iconDef.icon,
        label: iconDef.label,
        startX: Math.cos(angle) * radius,
        startY: Math.sin(angle) * radius,
        targetX: (Math.random() - 0.5) * 80,
        targetY: (Math.random() - 0.5) * 80,
        size: 18 + (i % 3) * 6,
        isWaste: iconDef.isWaste,
        delay: (i % 6) * 0.08,
      });
    }
    return list;
  }, []);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        onComplete();
        return;
      }
    }

    // Step Timing Pipeline: Total ~4.8s
    const t1 = setTimeout(() => setStage(1), 800); // 0.8s: Start particle inflow
    const t2 = setTimeout(() => setStage(2), 2000); // 2.0s: Form dense cloud
    const t3 = setTimeout(() => setStage(3), 2800); // 2.8s: Overload pulse & jitter
    const t4 = setTimeout(() => setStage(4), 3200); // 3.2s: Filter & vanish clutter
    const t5 = setTimeout(() => setStage(5), 4000); // 4.0s: Sustainable green pulse
    const t6 = setTimeout(() => {
      setStage(6);
      onComplete();
    }, 4800); // 4.8s: Complete transition

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden select-none">
      {/* Background Soft Glow Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: stage >= 5 ? [1, 2.5, 3] : stage >= 3 ? [1, 1.15, 1] : 1,
            opacity: stage >= 5 ? [0.6, 0.9, 0] : stage >= 3 ? 0.4 : 0.2,
          }}
          transition={{ duration: stage >= 5 ? 0.8 : 0.4 }}
          className={`w-96 h-96 rounded-full blur-3xl transition-colors duration-700 ${
            stage >= 5
              ? "bg-emerald-500/40"
              : stage === 3
              ? "bg-amber-500/30"
              : "bg-emerald-600/15"
          }`}
        />
      </div>

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onSkip || onComplete}
          className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
        >
          Skip Intro
        </button>
      </div>

      {/* Main Visual Arena */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Stage 0: Initial Logo Fade-In */}
        <AnimatePresence>
          {stage <= 1 && (
            <motion.div
              key="stage-logo"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.4 } }}
              transition={{ duration: 0.8, ease: customSpringEase }}
              className="absolute z-20 flex flex-col items-center"
            >
              <GreenPulseLogo size={112} glow />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-center"
              >
                <h2 className="text-xl font-extrabold tracking-tight">
                  Green<span className="text-emerald-400">Pulse</span>
                </h2>
                <p className="text-[11px] text-emerald-400/80 font-medium tracking-wider uppercase mt-0.5">
                  Optimizing Digital Energy
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stages 1 to 4: Particle Field & Cloud Assembly */}
        {stage >= 1 && stage <= 4 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => {
              const Icon = p.icon;
              // Determine position based on stage
              const isCluster = stage >= 2;
              const isOverloaded = stage === 3;
              const isFiltering = stage === 4;

              return (
                <motion.div
                  key={p.id}
                  initial={{
                    x: p.startX,
                    y: p.startY,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={{
                    x: isCluster
                      ? p.targetX + (isOverloaded ? (Math.random() - 0.5) * 16 : 0)
                      : p.startX * 0.4,
                    y: isCluster
                      ? p.targetY + (isOverloaded ? (Math.random() - 0.5) * 16 : 0)
                      : p.startY * 0.4,
                    opacity: isFiltering && p.isWaste ? 0 : 0.9,
                    scale: isFiltering && p.isWaste ? 0.2 : isOverloaded ? 1.15 : 1,
                    rotate: isOverloaded ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{
                    duration: isCluster ? 0.7 : 1.1,
                    delay: p.delay,
                    ease: smoothEase,
                  }}
                  className="absolute flex items-center justify-center"
                >
                  <div
                    className={`p-2 rounded-xl backdrop-blur-md shadow-lg transition-colors duration-500 ${
                      isFiltering
                        ? p.isWaste
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 scale-75"
                          : "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-emerald-500/30"
                        : isOverloaded
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                        : "bg-white/10 text-slate-300 border border-white/15"
                    }`}
                    style={{ width: p.size + 14, height: p.size + 14 }}
                  >
                    <Icon className="w-full h-full" />
                  </div>
                </motion.div>
              );
            })}

            {/* Overload Indicator Pulsing Ring */}
            {stage === 3 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.9, 1.3, 1], opacity: [0.4, 0.9, 0.6] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="absolute w-44 h-44 rounded-full border-2 border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.5)]"
              />
            )}

            {/* Stage 4: Scanning Laser/Purification Ring */}
            {stage === 4 && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 1.6, 2], opacity: [0.9, 0.8, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-48 h-48 rounded-full border-2 border-emerald-400 shadow-[0_0_36px_rgba(16,185,129,0.8)] bg-emerald-500/10"
              />
            )}
          </div>
        )}

        {/* Stage 5: Climax Transformation into Vibrant Green Sustainable Pulse */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              key="stage-pulse"
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 0.6, ease: customSpringEase }}
              className="relative z-30 flex flex-col items-center justify-center"
            >
              {/* Expanding Ripple Rings */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-40 h-40 rounded-full border-2 border-emerald-400 shadow-[0_0_30px_#10B981]"
              />

              <div className="relative grid place-items-center size-28 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.6)] border border-emerald-300/40">
                <Leaf className="size-14 text-white drop-shadow-md animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 rounded-3xl border border-emerald-200/40 stroke-dasharray-[6_6]"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-5 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold"
              >
                <Sparkles className="size-3.5" />
                <span>100% Eco Optimized</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots Indicator */}
      <div className="absolute bottom-10 flex items-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              stage >= s ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
