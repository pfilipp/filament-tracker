import type { BrandData } from "./types";
import { BRANDS_STORAGE_KEY, DEFAULT_BRAND } from "./constants";

const EMPTY_BRANDS: BrandData = { brands: [DEFAULT_BRAND] };

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function ensureDefault(data: BrandData): BrandData {
  if (!data.brands.includes(DEFAULT_BRAND)) {
    return { brands: [DEFAULT_BRAND, ...data.brands] };
  }
  return data;
}

export function getBrandsSnapshot(): BrandData {
  try {
    const raw = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (!raw) return EMPTY_BRANDS;
    return ensureDefault(JSON.parse(raw) as BrandData);
  } catch {
    return EMPTY_BRANDS;
  }
}

export function getBrandsServerSnapshot(): BrandData {
  return EMPTY_BRANDS;
}

export function subscribeBrands(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function writeBrands(data: BrandData): void {
  localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(ensureDefault(data)));
  emitChange();
}
