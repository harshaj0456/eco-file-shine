import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Leaf, Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — GreenPulse" },
      { name: "description", content: "Sign in or create your GreenPulse account." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(1, "Enter your name").max(60);

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { user, isGuest, initialized, init, signIn, signUp, continueAsGuest } = useAuthStore();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized && (user || isGuest)) navigate({ to: "/app", replace: true });
  }, [initialized, user, isGuest, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const checks = [
      ...(mode === "signup" ? [nameSchema.safeParse(name)] : []),
      emailSchema.safeParse(email),
      passwordSchema.safeParse(password),
    ];
    const failed = checks.find((c) => !c.success);
    if (failed && !failed.success) {
      setError(failed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setBusy(true);
    const result =
      mode === "signin"
        ? await signIn(email.trim(), password)
        : await signUp(name.trim(), email.trim(), password);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setConfirmSent(true);
      return;
    }
    toast.success(mode === "signin" ? "Welcome back!" : "Account created");
    navigate({ to: "/app", replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app-shell px-4 py-10 font-sans">
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-6" />
          </span>
          <h1 className="text-2xl font-extrabold text-foreground">GreenPulse</h1>
          <p className="text-xs text-muted-foreground">Clean your digital footprint. Keep what matters.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          {confirmSent ? (
            <div className="space-y-3 text-center">
              <Mail className="mx-auto size-8 text-primary" />
              <h2 className="text-base font-bold text-foreground">Check your email</h2>
              <p className="text-xs text-muted-foreground">
                We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Open it,
                then come back and sign in.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setConfirmSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <div role="tablist" className="mb-4 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-bold">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    className={cn(
                      "rounded-md py-1.5 transition-colors",
                      mode === m ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="space-y-3" noValidate>
                {mode === "signup" && (
                  <Field id="name" label="Your name" icon={UserIcon}>
                    <Input
                      id="name"
                      autoComplete="name"
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                    />
                  </Field>
                )}
                <Field id="email" label="Email" icon={Mail}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </Field>
                <Field id="password" label="Password" icon={Lock}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </Field>

                {error && (
                  <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full font-bold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
            </>
          )}
        </div>

        {!confirmSent && (
          <button
            type="button"
            onClick={() => {
              continueAsGuest();
              navigate({ to: "/app", replace: true });
            }}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Explore with demo data instead (no account)
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
