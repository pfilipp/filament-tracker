"use client";

import type { FilterState } from "@/app/lib/types";
import { MATERIAL_OPTIONS } from "@/app/lib/constants";
import { BrandSelect } from "./BrandSelect";

interface FilterBarProps {
  filters: FilterState;
  brands: string[];
  availableProductTypes: string[];
  onMaterialChange: (material: FilterState["material"]) => void;
  onProductTypeChange: (type: string) => void;
  onBrandChange: (brand: string) => void;
  onAddBrand: (name: string) => void;
  onSearchChange: (query: string) => void;
  onShowOnlyOwnedChange: (show: boolean) => void;
}

export function FilterBar({
  filters,
  brands,
  availableProductTypes,
  onMaterialChange,
  onProductTypeChange,
  onBrandChange,
  onAddBrand,
  onSearchChange,
  onShowOnlyOwnedChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.material}
        onChange={(e) =>
          onMaterialChange(e.target.value as FilterState["material"])
        }
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {MATERIAL_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "all" ? "All Materials" : opt}
          </option>
        ))}
      </select>

      <select
        value={filters.productType}
        onChange={(e) => onProductTypeChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="all">All Types</option>
        {availableProductTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="w-40">
        <BrandSelect
          value={filters.brand}
          brands={brands}
          onBrandChange={onBrandChange}
          onAddBrand={onAddBrand}
          includeAll
        />
      </div>

      <input
        type="text"
        value={filters.searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search filaments..."
        className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={filters.showOnlyOwned}
          onChange={(e) => onShowOnlyOwnedChange(e.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        Owned only
      </label>
    </div>
  );
}
