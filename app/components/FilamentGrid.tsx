"use client";

import { useState, useMemo, useCallback } from "react";
import type { FilamentProduct, FilamentVariant } from "@/app/lib/types";
import { useFilamentStock } from "@/app/hooks/useFilamentStock";
import { useFilters } from "@/app/hooks/useFilters";
import { FilterBar } from "./FilterBar";
import { FilamentCard } from "./FilamentCard";
import { AddFilamentModal } from "./AddFilamentModal";
import { EmptyState } from "./EmptyState";

interface FilamentGridProps {
  filaments: FilamentProduct[];
}

type ModalTarget = {
  product: FilamentProduct;
  variant: FilamentVariant;
} | null;

export function FilamentGrid({ filaments }: FilamentGridProps) {
  const { stock, getEntry, setQuantity } = useFilamentStock();
  const {
    filters,
    setMaterial,
    setBrand,
    setSearchQuery,
    setShowOnlyOwned,
    resetFilters,
    availableBrands,
  } = useFilters(stock);
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);

  const filteredItems = useMemo(() => {
    const items: { product: FilamentProduct; variant: FilamentVariant }[] = [];
    const query = filters.searchQuery.toLowerCase();

    for (const product of filaments) {
      if (filters.material !== "all" && product.material !== filters.material)
        continue;

      for (const variant of product.variants) {
        if (
          query &&
          !product.name.toLowerCase().includes(query) &&
          !variant.colorName.toLowerCase().includes(query)
        )
          continue;

        const entry = getEntry(product.slug, variant.sku);

        if (filters.showOnlyOwned && (!entry || entry.quantity === 0)) continue;

        if (filters.brand !== "all") {
          if (!entry || entry.brand !== filters.brand) continue;
        }

        items.push({ product, variant });
      }
    }

    return items;
  }, [filaments, filters, getEntry]);

  const handleSave = useCallback(
    (quantity: number, brand: string) => {
      if (!modalTarget) return;
      setQuantity(modalTarget.product.slug, modalTarget.variant.sku, quantity, brand);
      setModalTarget(null);
    },
    [modalTarget, setQuantity],
  );

  return (
    <>
      <FilterBar
        filters={filters}
        availableBrands={availableBrands}
        onMaterialChange={setMaterial}
        onBrandChange={setBrand}
        onSearchChange={setSearchQuery}
        onShowOnlyOwnedChange={setShowOnlyOwned}
      />

      {filteredItems.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredItems.map(({ product, variant }) => {
            const entry = getEntry(product.slug, variant.sku);
            return (
              <FilamentCard
                key={`${product.slug}::${variant.sku}`}
                product={product}
                variant={variant}
                entry={entry}
                onClick={() => setModalTarget({ product, variant })}
              />
            );
          })}
        </div>
      )}

      {modalTarget && (
        <AddFilamentModal
          product={modalTarget.product}
          variant={modalTarget.variant}
          initialQuantity={
            getEntry(modalTarget.product.slug, modalTarget.variant.sku)
              ?.quantity ?? 0
          }
          initialBrand={
            getEntry(modalTarget.product.slug, modalTarget.variant.sku)
              ?.brand ?? "Bambu Lab"
          }
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
  );
}
