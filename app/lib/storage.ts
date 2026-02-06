import type { StockData } from "./types";
import { STORAGE_KEY } from "./constants";

const EMPTY_STOCK: StockData = { version: 2, entries: [] };

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getStockSnapshot(): StockData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STOCK;
    return JSON.parse(raw) as StockData;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitChange();
}
