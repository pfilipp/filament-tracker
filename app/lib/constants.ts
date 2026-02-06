import type { ColorTag, FilterState } from "./types";

export const MATERIAL_OPTIONS = ["all", "PLA", "PETG"] as const;

export const DEFAULT_BRAND = "Bambu Lab";

export const DEFAULT_FILTER_STATE: FilterState = {
  material: "all",
  brand: "all",
  productType: "all",
  searchQuery: "",
  showOnlyOwned: false,
};

export const STORAGE_KEY = "filament-tracker-stock";

export const BRANDS_STORAGE_KEY = "filament-tracker-brands";

export const COLOR_TAGS: ColorTag[] = [
  "black", "blue", "brown", "cream", "cyan",
  "gold", "gray", "green", "orange", "pink",
  "purple", "red", "silver", "teal", "white",
  "yellow", "multicolor",
];

export const PRODUCT_TYPE_MATERIAL: Record<string, "PLA" | "PETG"> = {
  "PLA Basic": "PLA",
  "PLA Matte": "PLA",
  "PLA Silk+": "PLA",
  "PLA Aero": "PLA",
  "PLA Galaxy": "PLA",
  "PLA Glow": "PLA",
  "PLA Marble": "PLA",
  "PLA Metal": "PLA",
  "PLA Sparkle": "PLA",
  "PLA Tough+": "PLA",
  "PLA Translucent": "PLA",
  "PLA Wood": "PLA",
  "PLA Basic Gradient": "PLA",
  "PLA Silk Multi-Color": "PLA",
  "PETG HF": "PETG",
};

export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_MATERIAL);
