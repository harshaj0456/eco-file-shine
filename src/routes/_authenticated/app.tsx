import { createFileRoute } from "@tanstack/react-router";
import { DataDietApp } from "@/components/data-diet/DataDietApp";
import { SetupWizard } from "@/components/greenpulse/SetupWizard";
import { TopBar } from "@/components/greenpulse/TopBar";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — GreenPulse" },
      { name: "description", content: "Your GreenPulse sustainability dashboard." },
      { property: "og:title", content: "Dashboard — GreenPulse" },
      { property: "og:description", content: "Track storage, compute and device impact in one place." },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { data: profile, isLoading, error } = useProfile();
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-app-shell text-sm text-muted-foreground">Loading your dashboard…</div>;
  if (error || !profile) return <div className="grid min-h-screen place-items-center text-sm">Couldn't load your profile. Please refresh.</div>;
  if (!profile.onboarded) return <SetupWizard profile={profile} />;
  return <DataDietApp skipOnboarding topBar={<TopBar profile={profile} />} />;
}
