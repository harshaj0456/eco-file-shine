import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { OnboardingAnimation } from "@/components/onboarding/OnboardingAnimation";
import { OnboardingPage } from "@/components/onboarding/OnboardingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenPulse — Personal Digital Carbon & Storage Optimizer" },
      {
        name: "description",
        content:
          "Measure your digital footprint, reduce storage waste, schedule low-carbon compute, and get personalized sustainable recommendations with GreenPulse.",
      },
      { property: "og:title", content: "GreenPulse — Digital Sustainability" },
      {
        property: "og:description",
        content: "Clean your digital footprint. Optimize storage and device longevity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

const INTRO_STORAGE_KEY = "greenpulse_has_seen_intro_v2";

function IndexPage() {
  const navigate = useNavigate();
  // Animation state: null while checking localStorage, true = playing, false = onboarding screen
  const [showAnimation, setShowAnimation] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(INTRO_STORAGE_KEY);
      // Auto-play on first visit, or default to true on fresh sessions
      if (hasSeen === "true") {
        setShowAnimation(false);
      } else {
        setShowAnimation(true);
      }
    } catch {
      setShowAnimation(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {}
    setShowAnimation(false);
  };

  const handleReplay = () => {
    setShowAnimation(true);
  };

  const handleContinue = () => {
    navigate({ to: "/app" });
  };

  if (showAnimation === null) {
    // Initial mount placeholder with background gradient to prevent flash
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <AnimatePresence mode="wait">
      {showAnimation ? (
        <OnboardingAnimation
          key="intro-animation"
          onComplete={handleAnimationComplete}
          onSkip={handleAnimationComplete}
        />
      ) : (
        <OnboardingPage
          key="onboarding-page"
          onContinue={handleContinue}
          onReplayAnimation={handleReplay}
        />
      )}
    </AnimatePresence>
  );
}
