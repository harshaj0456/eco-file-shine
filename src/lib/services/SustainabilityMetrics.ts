import type { AppSettings, DeviceItem, DigitalFile, UsageMode } from "../types";
import { REGIONAL_GRID_PROFILES, STORAGE_KWH_PER_GB_YEAR } from "./CarbonCalculator";

export type MetricRating = "excellent" | "good" | "poor";

export type MetricId = "pue" | "cue" | "wue" | "ref" | "sci" | "energyPerGb" | "embodied";

export interface SustainabilityMetric {
  id: MetricId;
  short: string;
  name: string;
  value: number;
  display: string;
  unit: string;
  rating: MetricRating;
  /** What the number means for the user, in one sentence. */
  meaning: string;
  formula: string;
  benchmark: string;
}

/**
 * Illustrative assumptions for where the user's data is hosted.
 * These are estimates (industry averages), not measurements - the UI labels them as such.
 */
const HOSTING_ASSUMPTIONS: Record<UsageMode, { pue: number; wue: number; label: string }> = {
  personal: { pue: 1.15, wue: 0.2, label: "hyperscale cloud" },
  student: { pue: 1.4, wue: 1.0, label: "campus / mixed hosting" },
  organization: { pue: 1.58, wue: 1.8, label: "industry-average data centre" },
};

/** Approximate share of grid electricity from renewables (%), by region profile. */
const RENEWABLE_SHARE: Record<string, number> = {
  nordics: 98,
  uk: 45,
  "eu-average": 40,
  "us-average": 22,
  india: 22,
  custom: 30,
};

function rateLowerBetter(v: number, excellent: number, good: number): MetricRating {
  return v <= excellent ? "excellent" : v <= good ? "good" : "poor";
}
function rateHigherBetter(v: number, excellent: number, good: number): MetricRating {
  return v >= excellent ? "excellent" : v >= good ? "good" : "poor";
}

export function computeSustainabilityMetrics(
  settings: AppSettings,
  files: DigitalFile[],
  devices: DeviceItem[]
): SustainabilityMetric[] {
  const mode = settings.general.usageMode ?? "personal";
  const host = HOSTING_ASSUMPTIONS[mode] ?? HOSTING_ASSUMPTIONS.personal;
  const regionId = settings.general.region;
  const grid = REGIONAL_GRID_PROFILES[regionId] ?? REGIONAL_GRID_PROFILES["eu-average"];
  const gridKgPerKwh = grid.average / 1000;

  const activeGb = Math.max(
    0.1,
    files.filter((f) => f.status === "active" || f.status === "kept").reduce((s, f) => s + f.sizeGB, 0)
  );

  // Energy
  const itEnergyKwh = activeGb * STORAGE_KWH_PER_GB_YEAR; // IT equipment energy per year
  const pue = host.pue;
  const facilityEnergyKwh = itEnergyKwh * pue;

  // CUE = total CO2e from facility energy / IT energy  (= PUE x grid intensity)
  const cue = (facilityEnergyKwh * gridKgPerKwh) / itEnergyKwh;

  // WUE (site water, litres per IT kWh)
  const wue = host.wue;

  // Renewable Energy Factor
  const ref = RENEWABLE_SHARE[regionId] ?? 30;

  // SCI (Green Software Foundation): ((E x I) + M) / R, with R = per GB stored per year
  const embodiedKgTotal = devices.reduce((s, d) => s + d.embodiedCarbonKg, 0);
  const embodiedKgPerYear = devices.reduce(
    (s, d) => s + d.embodiedCarbonKg / Math.max(1, d.expectedLifeYears),
    0
  );
  const operationalG = facilityEnergyKwh * grid.average;
  const sci = (operationalG + embodiedKgPerYear * 1000 * 0.05) / activeGb; // 5% of device embodied carbon attributed to storage use

  const energyPerGb = STORAGE_KWH_PER_GB_YEAR * pue;

  return [
    {
      id: "pue",
      short: "PUE",
      name: "Power Usage Effectiveness",
      value: pue,
      display: pue.toFixed(2),
      unit: "ratio",
      rating: rateLowerBetter(pue, 1.2, 1.5),
      meaning: `For every 1 kWh your data uses, about ${(pue - 1).toFixed(2)} kWh more goes to cooling and overhead (${host.label}).`,
      formula: "Total facility energy ÷ IT equipment energy",
      benchmark: "1.0 is perfect · ≤1.2 excellent · industry average ≈1.58",
    },
    {
      id: "cue",
      short: "CUE",
      name: "Carbon Usage Effectiveness",
      value: cue,
      display: cue.toFixed(2),
      unit: "kg CO₂e / kWh",
      rating: rateLowerBetter(cue, 0.2, 0.5),
      meaning: `Each kWh of IT load emits about ${Math.round(cue * 1000)} g CO₂e on the ${grid.label.split(" (")[0]} grid.`,
      formula: "Facility CO₂e emissions ÷ IT equipment energy  (= PUE × grid intensity)",
      benchmark: "0 is ideal · ≤0.2 excellent · ≤0.5 good",
    },
    {
      id: "wue",
      short: "WUE",
      name: "Water Usage Effectiveness",
      value: wue,
      display: wue.toFixed(1),
      unit: "L / kWh",
      rating: rateLowerBetter(wue, 0.5, 1.8),
      meaning: `About ${(wue * itEnergyKwh).toFixed(1)} litres of water a year is used to keep your ${activeGb.toFixed(0)} GB running.`,
      formula: "Annual site water use (litres) ÷ IT equipment energy (kWh)",
      benchmark: "0 is ideal · ≤0.5 excellent · industry average ≈1.8",
    },
    {
      id: "ref",
      short: "REF",
      name: "Renewable Energy Factor",
      value: ref,
      display: `${ref}`,
      unit: "% renewable",
      rating: rateHigherBetter(ref, 70, 40),
      meaning: `Roughly ${ref}% of the electricity on your selected grid comes from renewable sources.`,
      formula: "Renewable energy consumed ÷ total energy consumed × 100",
      benchmark: "100% is ideal · ≥70% excellent · ≥40% good",
    },
    {
      id: "sci",
      short: "SCI",
      name: "Software Carbon Intensity",
      value: sci,
      display: Math.round(sci).toString(),
      unit: "g CO₂e / GB-year",
      rating: rateLowerBetter(sci, 50, 150),
      meaning: "Carbon emitted per GB you keep stored for a year, including a share of device manufacturing.",
      formula: "((Energy × grid intensity) + embodied carbon) ÷ functional unit (GB stored)",
      benchmark: "Lower is better · app thresholds: ≤50 excellent · ≤150 good",
    },
    {
      id: "energyPerGb",
      short: "kWh/GB",
      name: "Energy per GB-year",
      value: energyPerGb,
      display: energyPerGb.toFixed(2),
      unit: "kWh / GB-year",
      rating: rateLowerBetter(energyPerGb, 0.25, 0.35),
      meaning: `Keeping 1 GB stored for a year costs about ${energyPerGb.toFixed(2)} kWh including overhead.`,
      formula: "Storage kWh per GB-year × PUE",
      benchmark: "Lower is better · base storage cost 0.2 kWh/GB-year",
    },
    {
      id: "embodied",
      short: "Embodied",
      name: "Embodied Carbon (devices)",
      value: embodiedKgTotal,
      display: embodiedKgTotal.toFixed(0),
      unit: "kg CO₂e",
      rating: rateLowerBetter(embodiedKgTotal / Math.max(1, devices.length), 150, 300),
      meaning: `Manufacturing your ${devices.length} tracked device${devices.length === 1 ? "" : "s"} already emitted this much; keeping them longer spreads it out.`,
      formula: "Sum of manufacturing CO₂e across devices in the E-Waste Passport",
      benchmark: "Per device: ≤150 kg excellent · ≤300 kg good",
    },
  ];
}

export const HOSTING_NOTE =
  "Estimates based on industry-average data-centre figures and your selected region. They are not live measurements.";
