import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UsageMode, RegionId } from "./types";
import { getLocalProfile, setLocalProfile, type StoredProfile } from "./storage";

export type Modules = {
  dataDiet: boolean;
  greenQueue: boolean;
  passport: boolean;
};

export type Profile = StoredProfile;

export const REGIONS: { id: RegionId; label: string; intensityGramsPerKwh: number }[] = [
  { id: "eu-average", label: "EU Average (~250 g/kWh)", intensityGramsPerKwh: 250 },
  { id: "us-average", label: "US Average (~370 g/kWh)", intensityGramsPerKwh: 370 },
  { id: "india", label: "India Grid (~630 g/kWh)", intensityGramsPerKwh: 630 },
  { id: "uk", label: "United Kingdom (~180 g/kWh)", intensityGramsPerKwh: 180 },
  { id: "nordics", label: "Nordics Hydro/Wind (~40 g/kWh)", intensityGramsPerKwh: 40 },
  { id: "custom", label: "Custom Grid Profile", intensityGramsPerKwh: 300 },
];

export function modeLabels(mode: UsageMode) {
  if (mode === "organization") {
    return {
      devices: "Lab assets",
      device: "lab asset",
      addDevice: "Add Lab Asset",
      jobs: "Workloads",
      job: "workload",
      addJob: "Queue Workload",
      storage: "Org Storage",
      peers: "Team Members",
      userRole: "Organization Admin",
      badgePrefix: "Org",
    };
  }
  if (mode === "student") {
    return {
      devices: "My devices",
      device: "study device",
      addDevice: "Add Study Device",
      jobs: "Study tasks",
      job: "study task",
      addJob: "Queue Study Task",
      storage: "Coursework & Files",
      peers: "Classmates",
      userRole: "Student",
      badgePrefix: "Campus",
    };
  }
  return {
    devices: "Devices",
    device: "device",
    addDevice: "Add Device",
    jobs: "Jobs",
    job: "job",
    addJob: "Schedule Job",
    storage: "Personal Storage",
    peers: "Eco Community",
    userRole: "Individual",
    badgePrefix: "Eco",
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return getLocalProfile();
    },
    staleTime: Infinity,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      return setLocalProfile(patch);
    },
    onSuccess: (updated) => {
      qc.setQueryData(["profile"], updated);
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
