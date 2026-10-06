import type { Variants, Transition } from "framer-motion";

// Custom easing requested: cubic-bezier(0.34, 1.56, 0.64, 1)
export const customSpringEase = [0.34, 1.56, 0.64, 1] as const;
export const smoothEase = [0.22, 1, 0.36, 1] as const;
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const;

export const springTransition: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 280,
  mass: 0.8,
};

// 1. Logo Animation (0.8s fade-in + scale 0.8 -> 1.0)
export const logoVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: customSpringEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

// 2. Onboarding Page Container & Children Stagger
export const onboardingContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

export const onboardingItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
};

export const pulseGlowVariants: Variants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.5, 0.85, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const carouselVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 },
    },
  }),
};
