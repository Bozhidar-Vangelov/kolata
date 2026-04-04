export const MAINTENANCE_TYPES = [
  "insurance",
  "kasko",
  "inspection",
  "oilChange",
  "vignette",
  "tires",
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_ROUTES: Record<MaintenanceType, string> = {
  insurance: "insurance",
  kasko: "kasko",
  inspection: "inspection",
  oilChange: "oil-change",
  vignette: "vignette",
  tires: "tires",
};

export const MAINTENANCE_TABLES: Record<MaintenanceType, string> = {
  insurance: "insurance",
  kasko: "kasko",
  inspection: "technical_inspection",
  oilChange: "oil_change",
  vignette: "vignette",
  tires: "tires",
};
