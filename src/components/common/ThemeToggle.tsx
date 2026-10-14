import { useEffect } from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { applyAppearance } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "system", label: "System", icon: Monitor },
  { id: "dark", label: "Dark", icon: Moon },
];

/** Keeps the <html> class in sync when the theme is "system" and the OS setting changes. */
export function useSystemThemeSync() {
  const appearance = useSettingsStore((s) => s.settings.appearance);
  useEffect(() => {
    applyAppearance(appearance);
    if (appearance.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(appearance);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [appearance]);
}

/** Three-way Light / System / Dark switch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { settings, patchSettings } = useSettingsStore();
  const current = settings.appearance.theme as Theme;
  useSystemThemeSync();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center rounded-full border border-border bg-card p-0.5", className)}
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={current === id}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => patchSettings({ appearance: { ...settings.appearance, theme: id } })}
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            current === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
