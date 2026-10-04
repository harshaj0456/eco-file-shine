import { create } from "zustand";
import type { HistoryAction } from "../types";
import { toast } from "sonner";

interface HistoryState {
  past: HistoryAction[];
  future: HistoryAction[];
  pushAction: (action: HistoryAction) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const MAX_HISTORY_STEPS = 10;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushAction: (action) => {
    set((state) => {
      const nextPast = [...state.past, action].slice(-MAX_HISTORY_STEPS);
      return {
        past: nextPast,
        future: [], // New action clears redo stack
      };
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const actionToUndo = past[past.length - 1];
    if (!actionToUndo) return;

    try {
      actionToUndo.undo();
      set({
        past: past.slice(0, -1),
        future: [actionToUndo, ...future].slice(0, MAX_HISTORY_STEPS),
      });
      toast.info(`Undone: ${actionToUndo.description}`);
    } catch (e) {
      toast.error("Could not undo action");
    }
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const actionToRedo = future[0];
    if (!actionToRedo) return;

    try {
      actionToRedo.redo();
      set({
        past: [...past, actionToRedo].slice(-MAX_HISTORY_STEPS),
        future: future.slice(1),
      });
      toast.info(`Redone: ${actionToRedo.description}`);
    } catch (e) {
      toast.error("Could not redo action");
    }
  },

  clear: () => set({ past: [], future: [] }),
}));
