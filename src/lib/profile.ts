import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UsageMode = "personal" | "student" | "organization";
export type Modules = { dataDiet: boolean; greenQueue: boolean; passport: boolean };
export type Profile = {
  id: string;
  display_name: string | null;
  usage_mode: UsageMode;
  region: string;
  modules: Modules;
  onboarded: boolean;
};

export const REGIONS = [
  { id: "eu-average", label: "EU average (~250 g/kWh)" },
  { id: "india", label: "India (~630 g/kWh)" },
  { id: "us-average", label: "US average (~370 g/kWh)" },
  { id: "uk", label: "United Kingdom (~180 g/kWh)" },
  { id: "nordics", label: "Nordics (~40 g/kWh)" },
];

export function modeLabels(mode: UsageMode) {
  return mode === "organization"
    ? { devices: "Lab assets", device: "lab asset", jobs: "Workloads" }
    : mode === "student"
      ? { devices: "My devices", device: "device", jobs: "Study tasks" }
      : { devices: "Devices", device: "device", jobs: "Jobs" };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as Profile;
      const fresh = { id: auth.user.id, display_name: auth.user.email?.split("@")[0] ?? null };
      const { data: created, error: e2 } = await supabase.from("profiles").insert(fresh).select("*").single();
      if (e2) throw e2;
      return created as unknown as Profile;
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Profile, "id">>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
