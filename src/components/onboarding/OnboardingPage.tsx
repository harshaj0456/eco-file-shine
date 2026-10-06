import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight, RotateCcw, ShieldCheck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoIllustration } from "@/components/branding/EcoIllustration";
import { GreenPulseLogo } from "@/components/branding/GreenPulseLogo";
import { onboardingContainerVariants, onboardingItemVariants } from "@/lib/animations";

export interface OnboardingPageProps {
  onContinue?: () => void;
  onReplayAnimation?: () => void;
}

export function OnboardingPage({ onContinue, onReplayAnimation }: OnboardingPageProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate({ to: "/app" });
    }
  };

  const handleSignIn = () => {
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between items-center px-6 py-8 sm:py-12 overflow-x-hidden font-sans select-none">
      {/* Background Decorative Soft Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-emerald-200/30 dark:from-emerald-900/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-2">
          <GreenPulseLogo size="sm" showText={false} glow={false} />
          <span className="font-extrabold text-foreground text-lg tracking-tight">
            Green<span className="text-emerald-500">Pulse</span>
          </span>
        </div>

        {onReplayAnimation && (
          <button
            onClick={onReplayAnimation}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground bg-white/70 dark:bg-slate-800/70 border border-border shadow-2xs hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
            title="Replay Opening Sequence"
          >
            <RotateCcw className="size-3 text-emerald-500" />
            <span>Replay Intro</span>
          </button>
        )}
      </motion.header>

      {/* Center Main Stage */}
      <motion.main
        variants={onboardingContainerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md my-auto flex flex-col items-center text-center z-10 py-4"
      >
        {/* Pill Tag */}
        <motion.div variants={onboardingItemVariants} className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40 dark:border-emerald-700/40 shadow-2xs">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Personal Digital Carbon Optimizer
          </span>
        </motion.div>

        {/* Central Eco Illustration */}
        <motion.div
          variants={onboardingItemVariants}
          className="my-3 sm:my-6 relative flex items-center justify-center"
        >
          <EcoIllustration />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={onboardingItemVariants}
          className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mt-3"
        >
          Ready for a <span className="text-emerald-500 dark:text-emerald-400">Data Diet</span>?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={onboardingItemVariants}
          className="text-sm sm:text-base text-muted-foreground mt-3 max-w-sm leading-relaxed"
        >
          Measure your digital footprint, reduce waste, and get smarter sustainable
          recommendations tailored to your lifestyle.
        </motion.p>

        {/* Value Highlights */}
        <motion.div
          variants={onboardingItemVariants}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1">
            <Leaf className="size-3.5 text-emerald-500" /> Storage Cleanse
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" /> 100% Private
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3.5 text-emerald-500" /> Smart Grid
          </span>
        </motion.div>
      </motion.main>

      {/* Bottom CTA Action Stack */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-md flex flex-col gap-3 z-10 pt-4 pb-2"
      >
        {/* Primary CTA: Continue */}
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          <span>Continue</span>
          <ArrowRight className="size-4.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>

        {/* Secondary CTA: I have already account */}
        <Button
          onClick={handleSignIn}
          variant="outline"
          size="lg"
          className="w-full h-13 rounded-full border-border bg-card/80 hover:bg-card text-foreground font-semibold text-base shadow-2xs transition-all duration-200 active:scale-[0.98]"
        >
          I have already account
        </Button>

        {/* Minimal Disclaimer */}
        <p className="text-[11px] text-center text-muted-foreground mt-1">
          By continuing, you agree to optimize your device sustainability under SDG 12 & 13.
        </p>
      </motion.footer>
    </div>
  );
}
