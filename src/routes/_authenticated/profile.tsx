import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Mode — GreenPulse" },
      { name: "description", content: "Manage your GreenPulse mode, department, and sustainability profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-screen bg-app-shell px-3 py-6 font-sans text-foreground md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
        <ProfileView />
      </div>
    </div>
  );
}
