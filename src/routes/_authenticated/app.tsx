import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SetupWizard } from "@/components/greenpulse/SetupWizard";
import { MobileLayout } from "@/components/layout/MobileLayout";

import { CustomizableDashboard } from "@/components/dashboard/CustomizableDashboard";
import { DataDietApp } from "@/components/data-diet/DataDietApp";
import { GreenQueueApp } from "@/components/greenqueue/GreenQueueApp";
import { DevicesPassportApp } from "@/components/devices/DevicesPassportApp";
import { GamificationHub } from "@/components/gamification/GamificationHub";
import { ProfileView } from "@/components/profile/ProfileView";

import { useProfile } from "@/lib/profile";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useUIStore } from "@/lib/store/uiStore";
import { notificationService } from "@/lib/services/NotificationService";

import { DEFAULT_PROFILE } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — GreenPulse" },
      { name: "description", content: "Your GreenPulse digital carbon, storage, and hardware sustainability hub." },
      { property: "og:title", content: "Dashboard — GreenPulse" },
      { property: "og:description", content: "Track storage, compute and device impact in one place." },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { data: profile } = useProfile();
  const currentProfile = profile || DEFAULT_PROFILE;
  const { loadSettings } = useSettingsStore();
  const activeTab = useUIStore((s) => s.activeTab);

  useEffect(() => {
    loadSettings();
    notificationService.init();
    return () => {
      notificationService.cleanup();
    };
  }, [loadSettings]);

  if (!currentProfile.onboarded) {
    return <SetupWizard profile={currentProfile} />;
  }

  return (
    <MobileLayout>
      {activeTab === "home" && <CustomizableDashboard />}
      {activeTab === "dataDiet" && <DataDietApp />}
      {activeTab === "greenQueue" && <GreenQueueApp />}
      {activeTab === "devices" && <DevicesPassportApp />}
      {activeTab === "gamification" && <GamificationHub />}
      {activeTab === "profile" && <ProfileView />}
    </MobileLayout>
  );
}
