import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileFields } from "@/components/greenpulse/SetupWizard";
import { modeLabels, useProfile, useSaveProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GreenPulse" },
      { name: "description", content: "Edit your GreenPulse profile, mode, region and modules." },
      { property: "og:title", content: "Settings — GreenPulse" },
      { property: "og:description", content: "Make GreenPulse yours." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const save = useSaveProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [value, setValue] = useState<Parameters<typeof ProfileFields>[0]["value"] | null>(null);

  useEffect(() => {
    if (profile && !value) setValue({ display_name: profile.display_name, usage_mode: profile.usage_mode, region: profile.region, modules: profile.modules });
  }, [profile, value]);

  if (!value) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;

  const onSave = () => {
    if (!value.display_name?.trim()) { toast.error("Please enter your name"); return; }
    if (!Object.values(value.modules).some(Boolean)) { toast.error("Turn on at least one module"); return; }
    save.mutate(value, { onSuccess: () => toast.success("Profile saved"), onError: (e) => toast.error(e.message) });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-app-shell px-4 py-8 font-sans">
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-6 shadow-phone">
        <Link to="/app" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to dashboard</Link>
        <h1 className="text-2xl font-extrabold">Profile & settings</h1>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">In this mode, devices are called "{modeLabels(value.usage_mode).devices}".</p>
        <ProfileFields value={value} onChange={setValue} />
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" onClick={onSave} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</Button>
          <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
        </div>
      </div>
    </div>
  );
}
