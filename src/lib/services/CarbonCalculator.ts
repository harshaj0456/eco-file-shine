import type { AppSettings, DigitalFile, ScheduledJob, DeviceItem, ScoringWeights, RegionId } from "../types";

// Standard Grid Carbon Intensities (gCO2 / kWh)
export const REGIONAL_GRID_PROFILES: Record<RegionId, { label: string; average: number; hourlyProfile: number[] }> = {
  "us-average": {
    label: "US Average (~370 g/kWh)",
    average: 370,
    // Higher during evening peak 17:00-21:00, lower during solar midday and wind night
    hourlyProfile: [
      320, 310, 300, 290, 310, 340, 380, 410, 390, 350, 320, 290,
      280, 290, 310, 340, 390, 440, 460, 450, 420, 380, 350, 330
    ],
  },
  "eu-average": {
    label: "EU Average (~250 g/kWh)",
    average: 250,
    hourlyProfile: [
      220, 210, 200, 190, 205, 230, 270, 290, 270, 240, 210, 180,
      170, 180, 200, 220, 260, 310, 330, 310, 280, 250, 235, 225
    ],
  },
  "india": {
    label: "India Grid (~630 g/kWh)",
    average: 630,
    hourlyProfile: [
      590, 580, 570, 560, 580, 610, 660, 690, 670, 630, 590, 550,
      540, 560, 590, 620, 680, 740, 760, 730, 690, 650, 620, 600
    ],
  },
  "uk": {
    label: "United Kingdom (~180 g/kWh)",
    average: 180,
    hourlyProfile: [
      150, 140, 130, 120, 135, 160, 200, 220, 195, 170, 150, 130,
      120, 130, 145, 165, 210, 250, 260, 240, 210, 180, 165, 155
    ],
  },
  "nordics": {
    label: "Nordics (~40 g/kWh)",
    average: 40,
    hourlyProfile: [
      35, 32, 30, 28, 30, 35, 42, 48, 45, 38, 32, 28,
      25, 28, 30, 35, 44, 52, 55, 50, 44, 38, 36, 35
    ],
  },
  "custom": {
    label: "Custom User-Defined Profile",
    average: 300,
    hourlyProfile: [
      260, 250, 240, 230, 240, 270, 310, 340, 320, 280, 250, 220,
      210, 220, 240, 270, 320, 370, 390, 370, 330, 290, 270, 260
    ],
  },
};

// Storage Carbon Intensity Constants
// 1 GB cloud storage ~= 0.2 kWh / GB / year -> at 370g/kWh ~= 74 g CO2 / GB / year
export const STORAGE_KWH_PER_GB_YEAR = 0.2;

export function getHourlyCarbonIntensity(settings: AppSettings): number[] {
  const profileId = settings.greenQueue.profileId;
  if (profileId === "custom" && settings.greenQueue.customHourlyIntensity?.length === 24) {
    return settings.greenQueue.customHourlyIntensity;
  }
  const preset = REGIONAL_GRID_PROFILES[profileId] || REGIONAL_GRID_PROFILES["eu-average"];
  return preset.hourlyProfile;
}

export function calculateStorageCarbonGrams(sizeGB: number, gridIntensityGramsPerKwh: number = 250): number {
  return sizeGB * STORAGE_KWH_PER_GB_YEAR * gridIntensityGramsPerKwh;
}

export function calculateJobEmission(
  powerKw: number,
  durationHours: number,
  startHour: number,
  hourlyIntensities: number[]
): number {
  let totalEmissionGrams = 0;
  for (let i = 0; i < durationHours; i++) {
    const slot = (Math.floor(startHour) + i) % 24;
    const intensity = hourlyIntensities[slot] ?? 250;
    // Fractional hour if needed, default 1 hour per step
    totalEmissionGrams += powerKw * 1 * intensity;
  }
  return totalEmissionGrams;
}

export function findCleanestSlotForJob(
  job: { powerKw: number; durationHours: number; deadlineHour: number },
  hourlyIntensities: number[],
  quietHours?: { start: number; end: number; enabled: boolean }
): { slot: number; emissionGrams: number } {
  let bestSlot = 0;
  let minEmission = Infinity;

  // Search up to deadline
  const maxSlot = Math.min(23, job.deadlineHour - Math.ceil(job.durationHours));
  const searchLimit = maxSlot >= 0 ? maxSlot : 23;

  for (let slot = 0; slot <= searchLimit; slot++) {
    // Check if slot falls in quiet hours
    if (quietHours?.enabled) {
      if (isInQuietHours(slot, job.durationHours, quietHours.start, quietHours.end)) {
        continue;
      }
    }
    const emission = calculateJobEmission(job.powerKw, job.durationHours, slot, hourlyIntensities);
    if (emission < minEmission) {
      minEmission = emission;
      bestSlot = slot;
    }
  }

  // Fallback if all were in quiet hours
  if (minEmission === Infinity) {
    bestSlot = 0;
    minEmission = calculateJobEmission(job.powerKw, job.durationHours, 0, hourlyIntensities);
  }

  return { slot: bestSlot, emissionGrams: minEmission };
}

export function isInQuietHours(startHour: number, duration: number, quietStart: number, quietEnd: number): boolean {
  for (let i = 0; i < duration; i++) {
    const h = (startHour + i) % 24;
    if (quietStart <= quietEnd) {
      if (h >= quietStart && h < quietEnd) return true;
    } else {
      // Wraps around midnight (e.g., 22:00 to 07:00)
      if (h >= quietStart || h < quietEnd) return true;
    }
  }
  return false;
}

export function calculateCompositeScore(
  storageHealthScore: number, // 0 - 100
  computeHealthScore: number, // 0 - 100
  deviceHealthScore: number,  // 0 - 100
  weights: ScoringWeights
): number {
  const totalWeight = weights.dataDiet + weights.greenQueue + weights.devices || 1;
  const rawScore =
    (storageHealthScore * weights.dataDiet +
      computeHealthScore * weights.greenQueue +
      deviceHealthScore * weights.devices) /
    totalWeight;
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

export function formatCarbonValue(grams: number, unit: "kg" | "g" | "lb"): string {
  if (unit === "lb") {
    const lbs = (grams / 1000) * 2.20462;
    return `${lbs.toFixed(2)} lb CO₂e`;
  }
  if (unit === "g" || grams < 1000) {
    return `${Math.round(grams)} g CO₂e`;
  }
  return `${(grams / 1000).toFixed(2)} kg CO₂e`;
}

export function formatEnergyValue(kwh: number, unit: "kWh" | "MWh"): string {
  if (unit === "MWh" || kwh >= 1000) {
    return `${(kwh / 1000).toFixed(3)} MWh`;
  }
  return `${kwh.toFixed(2)} kWh`;
}

export function formatStorageValue(gb: number, unit: "GB" | "TB" | "MB"): string {
  if (unit === "TB" || gb >= 1024) {
    return `${(gb / 1024).toFixed(2)} TB`;
  }
  if (unit === "MB") {
    return `${Math.round(gb * 1024).toLocaleString()} MB`;
  }
  return `${gb.toFixed(1)} GB`;
}

export function formatCurrencyValue(amount: number, currency: "USD" | "EUR" | "INR" | "GBP"): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
  const sym = symbols[currency] || "$";
  return `${sym}${amount.toFixed(2)}`;
}
