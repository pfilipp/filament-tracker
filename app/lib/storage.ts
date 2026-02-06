import type { StockData } from "./types";
import { STORAGE_KEY } from "./constants";

const EMPTY_STOCK: StockData = { version: 2, entries: [] };

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedSnapshot: StockData = EMPTY_STOCK;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getStockSnapshot(): StockData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STOCK;
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    cachedSnapshot = JSON.parse(raw) as StockData;
    return cachedSnapshot;
  } catch {
    return EMPTY_STOCK;
  }
}

export function getStockServerSnapshot(): StockData {
  return EMPTY_STOCK;
}

export function subscribeStock(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function writeStock(data: StockData): void {
  const raw = JSON.stringify(data);
  cachedRaw = raw;
  cachedSnapshot = data;
  localStorage.setItem(STORAGE_KEY, raw);
  emitChange();
}
