import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — GreenPulse" },
      { name: "description", content: "Sign in to GreenPulse to save your storage, compute and device sustainability data." },
      { property: "og:title", content: "Sign in — GreenPulse" },
      { property: "og:description", content: "Your digital sustainability dashboard, saved to your account." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin + "/app" } });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (!data.session) return setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) return toast.error(error.message);
    }
    navigate({ to: "/app", replace: true });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) return toast.error("Google sign-in failed");
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-shell px-4 font-sans">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-phone">
        <div className="mb-6 flex items-center gap-2 text-lg font-extrabold">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-4" /></span>
          GreenPulse
        </div>
        {sent ? (
          <div className="space-y-3">
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">We sent a confirmation link to {email}. Open it to finish creating your account.</p>
            <Button variant="outline" className="w-full" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Clean your digital footprint. Keep what matters.</p>
            <Button type="button" variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
            </form>
            <button type="button" className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
