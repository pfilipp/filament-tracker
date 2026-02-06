"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { ColorTag, StockEntry, StockData } from "@/app/lib/types";
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

  const addCustomEntry = useCallback(
    (
      subtype: string,
      colorTag: ColorTag,
      quantity: number,
      brand: string,
      displayName?: string,
    ) => {
      const current = getStockSnapshot();
      const uuid = crypto.randomUUID();
      const slug = subtype.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const now = new Date().toISOString();
      const entry: StockEntry = {
        id: `custom::${uuid}`,
        productSlug: slug,
        variantSku: uuid,
        quantity,
        brand,
        addedAt: now,
        updatedAt: now,
        custom: true,
        customSubtype: subtype,
        customColorTag: colorTag,
        customDisplayName: displayName || undefined,
      };
      writeStock({ ...current, entries: [...current.entries, entry] });
    },
    [],
  );

  const updateCustomEntry = useCallback(
    (
      id: string,
      updates: Partial<
        Pick<
          StockEntry,
          | "quantity"
          | "brand"
          | "customSubtype"
          | "customColorTag"
          | "customDisplayName"
        >
      >,
    ) => {
      const current = getStockSnapshot();
      const now = new Date().toISOString();

      if (updates.quantity !== undefined && updates.quantity <= 0) {
        writeStock({
          ...current,
          entries: current.entries.filter((e) => e.id !== id),
        });
        return;
      }

      writeStock({
        ...current,
        entries: current.entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: now } : e,
        ),
      });
    },
    [],
  );

  const deleteCustomEntry = useCallback((id: string) => {
    const current = getStockSnapshot();
    writeStock({
      ...current,
      entries: current.entries.filter((e) => e.id !== id),
    });
  }, []);

  return {
    stock,
    getEntry,
    setQuantity,
    addCustomEntry,
    updateCustomEntry,
    deleteCustomEntry,
  };
}
