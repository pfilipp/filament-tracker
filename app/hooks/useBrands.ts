"use client";

import { useSyncExternalStore, useCallback } from "react";
import { DEFAULT_BRAND } from "@/app/lib/constants";
import {
  getBrandsSnapshot,
  getBrandsServerSnapshot,
  subscribeBrands,
  writeBrands,
} from "@/app/lib/brand-storage";

export function useBrands() {
  const data = useSyncExternalStore(
    subscribeBrands,
    getBrandsSnapshot,
    getBrandsServerSnapshot,
  );

  const addBrand = useCallback((name: string) => {
    const current = getBrandsSnapshot();
    const trimmed = name.trim();
    if (!trimmed || current.brands.includes(trimmed)) return;
    writeBrands({ brands: [...current.brands, trimmed].sort() });
  }, []);

  const removeBrand = useCallback((name: string) => {
    if (name === DEFAULT_BRAND) return;
    const current = getBrandsSnapshot();
    writeBrands({ brands: current.brands.filter((b) => b !== name) });
  }, []);

  return { brands: data.brands, addBrand, removeBrand };
}
