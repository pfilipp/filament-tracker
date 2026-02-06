"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState, StockData, FilamentProduct } from "@/app/lib/types";
import { DEFAULT_FILTER_STATE } from "@/app/lib/constants";

export function useFilters(stock: StockData, filaments: FilamentProduct[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const setMaterial = useCallback(
    (material: FilterState["material"]) =>
      setFilters((f) => ({ ...f, material, productType: "all" })),
    [],
  );

  const setBrand = useCallback(
    (brand: string) => setFilters((f) => ({ ...f, brand })),
    [],
  );

  const setProductType = useCallback(
    (productType: string) => setFilters((f) => ({ ...f, productType })),
    [],
  );

  const setSearchQuery = useCallback(
    (searchQuery: string) => setFilters((f) => ({ ...f, searchQuery })),
    [],
  );

  const setShowOnlyOwned = useCallback(
    (showOnlyOwned: boolean) => setFilters((f) => ({ ...f, showOnlyOwned })),
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTER_STATE), []);

  const availableBrands = useMemo(() => {
    const brands = new Set(stock.entries.map((e) => e.brand));
    return Array.from(brands).sort();
  }, [stock]);

  const availableProductTypes = useMemo(() => {
    const types = new Set<string>();

    for (const product of filaments) {
      if (filters.material !== "all" && product.material !== filters.material)
        continue;
      types.add(product.name);
    }

    for (const entry of stock.entries) {
      if (!entry.custom || !entry.customProductName || !entry.customMaterial)
        continue;
      if (
        filters.material !== "all" &&
        entry.customMaterial !== filters.material
      )
        continue;
      types.add(entry.customProductName);
    }

    return Array.from(types).sort();
  }, [filaments, stock, filters.material]);

  return {
    filters,
    setMaterial,
    setBrand,
    setProductType,
    setSearchQuery,
    setShowOnlyOwned,
    resetFilters,
    availableBrands,
    availableProductTypes,
  };
}
