import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUIStore } from "@/lib/store/uiStore";
import { Keyboard } from "lucide-react";

export function KeyboardShortcutsDialog() {
  const { isShortcutsHelpOpen, setShortcutsHelpOpen } = useUIStore();

  const SHORTCUTS = [
    { key: "Ctrl + K / ⌘K", desc: "Open Command Palette & search" },
    { key: "?", desc: "Show this Keyboard Shortcuts help" },
    { key: "H", desc: "Jump to Home Dashboard" },
    { key: "D", desc: "Jump to Data Diet module" },
    { key: "G", desc: "Jump to GreenQueue carbon scheduler" },
    { key: "E", desc: "Jump to E-Waste Passport" },
    { key: "S", desc: "Open GreenPulse Settings" },
    { key: "Shift + Click", desc: "Multi-select files in Data Diet" },
    { key: "Esc", desc: "Close any modal or active sheet" },
  ];

  return (
    <Dialog open={isShortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
      <DialogContent className="max-w-md font-sans bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Keyboard className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Keyboard Shortcuts</DialogTitle>
              <DialogDescription className="text-xs">
                Navigate GreenPulse faster with your keyboard
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 divide-y divide-border rounded-lg border border-border bg-muted/30">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between px-3 py-2.5 text-xs">
              <span className="text-foreground font-medium">{s.desc}</span>
              <kbd className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] font-bold text-muted-foreground shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
