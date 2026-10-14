import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setLocalProfile } from "@/lib/storage";

const GUEST_KEY = "greenpulse_guest_v1";
const LOCAL_USER_KEY = "greenpulse_local_user_v1";

interface LocalUserData {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthResult {
  error?: string;
  needsConfirmation?: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

let subscribed = false;

function getStoredLocalUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LocalUserData;
    return {
      id: parsed.id,
      email: parsed.email,
      user_metadata: { display_name: parsed.name },
      app_metadata: {},
      aud: "authenticated",
      created_at: parsed.created_at,
    } as unknown as User;
  } catch {
    return null;
  }
}

function saveLocalUser(name: string, email: string): User {
  const localData: LocalUserData = {
    id: `local-${Date.now()}`,
    email,
    name,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localData));
  localStorage.removeItem(GUEST_KEY);
  setLocalProfile({ display_name: name });
  return {
    id: localData.id,
    email: localData.email,
    user_metadata: { display_name: name },
    app_metadata: {},
    aud: "authenticated",
    created_at: localData.created_at,
  } as unknown as User;
}

function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  const msg = typeof err === "string" ? err : (err as { message?: string }).message ?? "";
  const lower = msg.toLowerCase();
  return (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("could not resolve host") ||
    lower.includes("load failed")
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isGuest: typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "true",
  initialized: false,

  init: async () => {
    if (!subscribed) {
      subscribed = true;
      try {
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            set({ session, user: session.user, initialized: true, isGuest: false });
          } else {
            const localUser = getStoredLocalUser();
            set({ session: null, user: localUser, initialized: true });
          }
        });
      } catch {
        // Ignored
      }
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        set({ session: data.session, user: data.session.user, initialized: true, isGuest: false });
        return;
      }
    } catch {
      // Backend unreachable
    }

    const localUser = getStoredLocalUser();
    set({ user: localUser, initialized: true });
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (isNetworkError(error)) {
          // Fall back to local account
          const localUser = saveLocalUser(email.split("@")[0] || "User", email);
          set({ user: localUser, session: null, isGuest: false });
          return {};
        }
        return { error: error.message };
      }
      localStorage.removeItem(GUEST_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
      const name = (data.user?.user_metadata?.["display_name"] as string | undefined) ?? undefined;
      if (name) setLocalProfile({ display_name: name });
      set({ user: data.user, session: data.session, isGuest: false });
      return {};
    } catch (err) {
      if (isNetworkError(err)) {
        const localUser = saveLocalUser(email.split("@")[0] || "User", email);
        set({ user: localUser, session: null, isGuest: false });
        return {};
      }
      return { error: (err as Error)?.message || "Sign in failed" };
    }
  },

  signUp: async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: { display_name: name },
        },
      });
      if (error) {
        if (isNetworkError(error)) {
          // Cloud backend unreachable: register and log in locally
          const localUser = saveLocalUser(name, email);
          set({ user: localUser, session: null, isGuest: false });
          return {};
        }
        return { error: error.message };
      }
      setLocalProfile({ display_name: name });
      localStorage.removeItem(GUEST_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
      set({ user: data.user, session: data.session, isGuest: false });
      return { needsConfirmation: !data.session };
    } catch (err) {
      if (isNetworkError(err)) {
        const localUser = saveLocalUser(name, email);
        set({ user: localUser, session: null, isGuest: false });
        return {};
      }
      return { error: (err as Error)?.message || "Sign up failed" };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut().catch(() => undefined);
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(LOCAL_USER_KEY);
    set({ user: null, session: null, isGuest: false });
  },

  continueAsGuest: () => {
    localStorage.setItem(GUEST_KEY, "true");
    set({ isGuest: true });
  },
}));
