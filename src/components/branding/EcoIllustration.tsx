import { motion } from "framer-motion";
import { pulseGlowVariants, floatVariants } from "@/lib/animations";

export function EcoIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer Ambient Eco Halo / Radial Glow */}
      <motion.div
        variants={pulseGlowVariants}
        initial="initial"
        animate="animate"
        className="absolute -inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-emerald-300/25 blur-2xl pointer-events-none"
      />

      {/* Outer Decorative Orbit Ring */}
      <div className="absolute inset-0 rounded-full border border-emerald-500/20 stroke-dasharray-[4_6] animate-[spin_40s_linear_infinite]" />

      {/* Floating Main SVG Illustration */}
      <motion.div
        variants={floatVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60"
      >
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xl"
        >
          <defs>
            {/* Background Disc Gradient */}
            <linearGradient id="eco-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECFDF5" />
              <stop offset="50%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>

            {/* Globe Grid Gradient */}
            <linearGradient id="eco-globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Leaf Gradient 1 */}
            <linearGradient id="eco-leaf-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Leaf Gradient 2 */}
            <linearGradient id="eco-leaf-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Water Drop Gradient */}
            <linearGradient id="eco-drop-grad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Shimmer Effect */}
            <linearGradient id="eco-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Large Soft Circle Platform */}
          <circle
            cx="120"
            cy="120"
            r="100"
            fill="url(#eco-bg-grad)"
            className="transition-colors duration-500"
          />

          {/* Inner Light Rings */}
          <circle cx="120" cy="120" r="85" stroke="#10B981" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="120" cy="120" r="70" stroke="#059669" strokeOpacity="0.18" strokeWidth="1.5" />

          {/* 2. Stylized Globe Meridians & Latitudes */}
          <g opacity="0.45">
            <circle cx="120" cy="120" r="54" stroke="url(#eco-globe-grad)" strokeWidth="3" fill="none" />
            {/* Latitude arcs */}
            <ellipse cx="120" cy="120" rx="54" ry="24" stroke="url(#eco-globe-grad)" strokeWidth="2.2" fill="none" />
            <ellipse cx="120" cy="120" rx="24" ry="54" stroke="url(#eco-globe-grad)" strokeWidth="2.2" fill="none" />
            <line x1="66" y1="120" x2="174" y2="120" stroke="url(#eco-globe-grad)" strokeWidth="2.2" />
            <line x1="120" y1="66" x2="120" y2="174" stroke="url(#eco-globe-grad)" strokeWidth="2.2" />
          </g>

          {/* 3. Sustainable Organic Foliage (Center Leaves) */}
          {/* Main Upright Leaf */}
          <path
            d="M 120 62 C 146 78, 154 114, 136 142 C 126 156, 114 158, 120 172 C 104 152, 94 130, 98 102 C 102 78, 114 66, 120 62 Z"
            fill="url(#eco-leaf-1)"
            opacity="0.95"
          />
          {/* Leaf central stem */}
          <path
            d="M 120 75 Q 118 115 120 166"
            stroke="#ECFDF5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Branching Leaf */}
          <path
            d="M 112 118 C 88 112, 68 126, 70 148 C 82 154, 98 148, 108 136 C 112 130, 114 124, 112 118 Z"
            fill="url(#eco-leaf-2)"
            opacity="0.9"
          />

          {/* Right Branching Leaf */}
          <path
            d="M 128 112 C 152 104, 172 116, 172 138 C 160 146, 142 142, 132 130 C 128 124, 126 118, 128 112 Z"
            fill="url(#eco-leaf-2)"
            opacity="0.9"
          />

          {/* 4. Fresh Water Droplet with High-Gloss Shimmer */}
          <g transform="translate(138, 70)">
            <path
              d="M 12 0 C 12 0, 0 16, 0 24 C 0 31, 5.5 36, 12 36 C 18.5 36, 24 31, 24 24 C 24 16, 12 0, 12 0 Z"
              fill="url(#eco-drop-grad)"
            />
            {/* Gloss highlight */}
            <ellipse cx="8" cy="20" rx="3.5" ry="6" transform="rotate(-25 8 20)" fill="white" opacity="0.75" />
          </g>

          {/* 5. Small Floating Eco Seed Drops */}
          <circle cx="68" cy="94" r="5" fill="#34D399" opacity="0.8" />
          <circle cx="176" cy="160" r="4.5" fill="#10B981" opacity="0.7" />
          <circle cx="78" cy="166" r="3.5" fill="#60A5FA" opacity="0.8" />
          <circle cx="165" cy="88" r="3" fill="#6EE7B7" opacity="0.9" />
        </svg>
      </motion.div>
    </div>
  );
}
