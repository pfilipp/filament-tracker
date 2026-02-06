import type { FilterState } from "./types";

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
