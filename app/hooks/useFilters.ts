"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState, StockData } from "@/app/lib/types";
import { DEFAULT_FILTER_STATE } from "@/app/lib/constants";

export function useFilters(stock: StockData) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const setMaterial = useCallback(
    (material: FilterState["material"]) =>
      setFilters((f) => ({ ...f, material })),
    [],
  );

  const setBrand = useCallback(
    (brand: string) => setFilters((f) => ({ ...f, brand })),
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

  return {
    filters,
    setMaterial,
    setBrand,
    setSearchQuery,
    setShowOnlyOwned,
    resetFilters,
    availableBrands,
  };
}
