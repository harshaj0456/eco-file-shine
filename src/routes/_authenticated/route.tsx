import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthGate,
});

function AuthGate() {
  const navigate = useNavigate();
  const { user, isGuest, initialized, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  const allowed = Boolean(user || isGuest);

  useEffect(() => {
    if (initialized && !allowed) navigate({ to: "/auth", replace: true });
  }, [initialized, allowed, navigate]);

  if (!initialized || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-shell">
        <Leaf className="size-8 animate-pulse text-primary" />
      </div>
    );
  }
  return <Outlet />;
}
