import type { BrandData } from "./types";
import { BRANDS_STORAGE_KEY, DEFAULT_BRAND } from "./constants";

const EMPTY_BRANDS: BrandData = { brands: [DEFAULT_BRAND] };

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedSnapshot: BrandData = EMPTY_BRANDS;

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
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = ensureDefault(JSON.parse(raw) as BrandData);
    return cachedSnapshot;
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
  const ensured = ensureDefault(data);
  const raw = JSON.stringify(ensured);
  cachedRaw = raw;
  cachedSnapshot = ensured;
  localStorage.setItem(BRANDS_STORAGE_KEY, raw);
  emitChange();
}
