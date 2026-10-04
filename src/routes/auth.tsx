import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "GreenPulse" },
      { name: "description", content: "GreenPulse — Digital Sustainability Dashboard" },
    ],
  }),
  component: AuthRedirect,
});

function AuthRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/app", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-shell px-4 font-sans">
      <div className="flex items-center gap-2 text-lg font-extrabold">
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <Leaf className="size-4" />
        </span>
        GreenPulse
      </div>
    </div>
  );
}
