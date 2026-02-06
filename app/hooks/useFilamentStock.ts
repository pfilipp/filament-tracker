"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { StockEntry, StockData } from "@/app/lib/types";
import { DEFAULT_BRAND } from "@/app/lib/constants";
import {
  getStockSnapshot,
  getStockServerSnapshot,
  subscribeStock,
  writeStock,
} from "@/app/lib/storage";

export function useFilamentStock() {
  const stock = useSyncExternalStore(
    subscribeStock,
    getStockSnapshot,
    getStockServerSnapshot,
  );

  const getEntry = useCallback(
    (slug: string, sku: string): StockEntry | undefined => {
      return stock.entries.find(
        (e) => e.productSlug === slug && e.variantSku === sku,
      );
    },
    [stock],
  );

  const setQuantity = useCallback(
    (slug: string, sku: string, quantity: number, brand?: string) => {
      const current = getStockSnapshot();
      const id = `${slug}::${sku}`;
      const now = new Date().toISOString();

      if (quantity <= 0) {
        const updated: StockData = {
          ...current,
          entries: current.entries.filter((e) => e.id !== id),
        };
        writeStock(updated);
        return;
      }

      const existing = current.entries.find((e) => e.id === id);
      if (existing) {
        const updated: StockData = {
          ...current,
          entries: current.entries.map((e) =>
            e.id === id
              ? { ...e, quantity, brand: brand ?? e.brand, updatedAt: now }
              : e,
          ),
        };
        writeStock(updated);
      } else {
        const entry: StockEntry = {
          id,
          productSlug: slug,
          variantSku: sku,
          quantity,
          brand: brand ?? DEFAULT_BRAND,
          addedAt: now,
          updatedAt: now,
        };
        const updated: StockData = {
          ...current,
          entries: [...current.entries, entry],
        };
        writeStock(updated);
      }
    },
    [],
  );

  return { stock, getEntry, setQuantity };
}
