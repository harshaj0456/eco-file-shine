import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Command as CommandIcon, Leaf, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Profile } from "@/lib/profile";

type Note = { id: number; title: string; body: string; read: boolean };

export function TopBar({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: `Welcome, ${profile.display_name ?? "there"}`, body: "Your account is set up. Settings are saved to your account.", read: false },
    { id: 2, title: "Cleanup waiting", body: "About 12 GB of duplicates are ready to review.", read: false },
  ]);
  const unread = notes.filter((n) => !n.read).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => { setPalette(false); fn(); };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-3.5" /></span>
          GreenPulse
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" aria-label="Open command menu (Ctrl+K)" onClick={() => setPalette(true)}><CommandIcon /></Button>
          <Button size="icon" variant="ghost" aria-label={`Notifications, ${unread} unread`} className="relative" onClick={() => setOpen(true)}>
            <Bell />
            {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{unread}</span>}
          </Button>
          <Button size="icon" variant="ghost" aria-label="Settings" onClick={() => navigate({ to: "/settings" })}><Settings /></Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="font-sans">
          <SheetHeader><SheetTitle>Notifications</SheetTitle></SheetHeader>
          <div className="mt-2 flex justify-end gap-2 px-4">
            <Button size="sm" variant="ghost" onClick={() => setNotes((n) => n.map((x) => ({ ...x, read: true })))}>Mark all read</Button>
            <Button size="sm" variant="ghost" onClick={() => setNotes([])}>Clear all</Button>
          </div>
          <div className="space-y-2 px-4">
            {notes.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>}
            {notes.map((n) => (
              <button key={n.id} onClick={() => setNotes((all) => all.map((x) => x.id === n.id ? { ...x, read: !x.read } : x))}
                className="w-full rounded-md border border-border p-3 text-left hover:bg-muted">
                <div className="flex items-center gap-2 text-sm font-bold">{!n.read && <span className="size-2 rounded-full bg-primary" />}{n.title}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <CommandDialog open={palette} onOpenChange={setPalette}>
        <CommandInput placeholder="Jump to…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => run(() => navigate({ to: "/settings" }))}>Settings & profile</CommandItem>
            <CommandItem onSelect={() => run(() => setOpen(true))}>Notifications</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => toast.info("Open the Analyze tab to run a new scan"))}>Run a scan</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
