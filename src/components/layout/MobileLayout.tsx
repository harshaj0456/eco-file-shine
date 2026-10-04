import { type ReactNode } from "react";
import { TopBar } from "@/components/greenpulse/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";
import { NotificationCenter } from "@/components/greenpulse/NotificationCenter";
import { GreenAssistant } from "@/components/greenpulse/GreenAssistant";
import { CommandPalette } from "@/components/greenpulse/CommandPalette";
import { KeyboardShortcutsDialog } from "@/components/greenpulse/KeyboardShortcutsDialog";
import { ProductTour } from "@/components/greenpulse/ProductTour";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="relative min-h-screen bg-app-shell font-sans text-foreground antialiased selection:bg-primary/20">
      {/* Sticky Compact Top Bar */}
      <TopBar />

      {/* Main App Content Viewport - padded at bottom on mobile to accommodate 64px bottom nav */}
      <main className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 py-3 md:py-6 pb-24 md:pb-10 transition-all">
        {children}
      </main>

      {/* Mobile-Only Bottom Tab Navigation */}
      <BottomNav />

      {/* Slide-out Settings & Profile Drawer */}
      <SettingsDrawer />

      {/* Global Interactive Overlays */}
      <NotificationCenter />
      <GreenAssistant />
      <CommandPalette />
      <KeyboardShortcutsDialog />
      <ProductTour />
    </div>
  );
}
