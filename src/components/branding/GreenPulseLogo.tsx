import { motion } from "framer-motion";
import { logoVariants } from "@/lib/animations";

export interface GreenPulseLogoProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

export function GreenPulseLogo({
  size = "md",
  animated = false,
  showText = false,
  className = "",
  glow = true,
}: GreenPulseLogoProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 48
      : size === "md"
      ? 96
      : size === "lg"
      ? 144
      : 192;

  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Ambient Glow */}
        {glow && (
          <div
            className="absolute inset-0 rounded-full bg-emerald-500/25 blur-xl pointer-events-none transform scale-125"
            style={{ filter: "blur(18px)" }}
          />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Gradient Background */}
            <linearGradient id="gp-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Inner Leaf Highlights */}
            <linearGradient id="gp-leaf-grad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E6FFFA" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="gp-pulse-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <filter id="gp-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#047857" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* Rounded Squircle / Hex-Shield Icon Base */}
          <rect
            x="6"
            y="6"
            width="88"
            height="88"
            rx="24"
            fill="url(#gp-badge-grad)"
            filter="url(#gp-shadow)"
          />

          {/* Subtle Inner Border Shine */}
          <rect
            x="7"
            y="7"
            width="86"
            height="86"
            rx="23"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="2"
            fill="none"
          />

          {/* Stylized Eco Leaf Shape */}
          <path
            d="M 50 18 C 68 24, 82 42, 80 64 C 78 78, 64 82, 50 82 C 36 82, 22 78, 20 64 C 18 42, 32 24, 50 18 Z"
            fill="url(#gp-leaf-grad)"
            opacity="0.96"
          />

          {/* Central Heartbeat / Digital Pulse Wave through the Leaf */}
          <path
            d="M 28 54 L 39 54 L 44 41 L 52 66 L 59 47 L 64 54 L 72 54"
            stroke="url(#gp-pulse-stroke)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tiny Glow Node at the Pulse Apex */}
          <circle cx="52" cy="66" r="3" fill="#10B981" />
          <circle cx="44" cy="41" r="2.5" fill="#34D399" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-foreground text-xl md:text-2xl leading-none">
            Green<span className="text-emerald-500">Pulse</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
            Digital Carbon & Storage
          </span>
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="inline-block"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
