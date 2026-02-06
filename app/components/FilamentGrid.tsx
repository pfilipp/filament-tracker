"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  FilamentProduct,
  FilamentVariant,
  StockEntry,
} from "@/app/lib/types";
import { getMaterialForSubtype } from "@/app/lib/filament-utils";
import { useFilamentStock } from "@/app/hooks/useFilamentStock";
import { useFilters } from "@/app/hooks/useFilters";
import { useBrands } from "@/app/hooks/useBrands";
import { FilterBar } from "./FilterBar";
import { FilamentCard } from "./FilamentCard";
import { CustomFilamentCard } from "./CustomFilamentCard";
import { AddFilamentModal } from "./AddFilamentModal";
import { CustomFilamentModal } from "./CustomFilamentModal";
import { EmptyState } from "./EmptyState";

interface FilamentGridProps {
  filaments: FilamentProduct[];
}

type GridItem =
  | { kind: "catalog"; product: FilamentProduct; variant: FilamentVariant }
  | { kind: "custom"; entry: StockEntry };

type GridGroup = {
  groupName: string;
  material: "PLA" | "PETG";
  items: GridItem[];
};

type ModalTarget =
  | { kind: "catalog"; product: FilamentProduct; variant: FilamentVariant }
  | { kind: "custom"; entry: StockEntry }
  | { kind: "new-custom" }
  | null;

export function FilamentGrid({ filaments }: FilamentGridProps) {
  const {
    stock,
    getEntry,
    setQuantity,
    addCustomEntry,
    updateCustomEntry,
    deleteCustomEntry,
  } = useFilamentStock();
  const {
    filters,
    setMaterial,
    setBrand,
    setProductType,
    setSearchQuery,
    setShowOnlyOwned,
    resetFilters,
    availableProductTypes,
  } = useFilters(stock, filaments);
  const { brands, addBrand } = useBrands();
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);

  const filteredGroups = useMemo(() => {
    const groupMap = new Map<string, GridGroup>();
    const query = filters.searchQuery.toLowerCase();
    const catalogOrder: string[] = [];

    for (const product of filaments) {
      if (filters.material !== "all" && product.material !== filters.material)
        continue;
      if (
        filters.productType !== "all" &&
        product.name !== filters.productType
      )
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
        if (filters.brand !== "all" && (!entry || entry.brand !== filters.brand))
          continue;

        if (!groupMap.has(product.name)) {
          catalogOrder.push(product.name);
          groupMap.set(product.name, {
            groupName: product.name,
            material: product.material,
            items: [],
          });
        }
        groupMap.get(product.name)!.items.push({
          kind: "catalog",
          product,
          variant,
        });
      }
    }

    const customGroupNames: string[] = [];

    for (const entry of stock.entries) {
      if (!entry.custom || !entry.customSubtype) continue;

      const material = getMaterialForSubtype(entry.customSubtype);

      if (filters.material !== "all" && material !== filters.material) continue;
      if (
        filters.productType !== "all" &&
        entry.customSubtype !== filters.productType
      )
        continue;
      if (
        query &&
        !entry.customSubtype.toLowerCase().includes(query) &&
        !(entry.customDisplayName ?? "").toLowerCase().includes(query) &&
        !(entry.customColorTag ?? "").toLowerCase().includes(query)
      )
        continue;
      if (filters.brand !== "all" && entry.brand !== filters.brand) continue;

      const name = entry.customSubtype;
      if (!groupMap.has(name)) {
        customGroupNames.push(name);
        groupMap.set(name, {
          groupName: name,
          material,
          items: [],
        });
      }
      groupMap.get(name)!.items.push({ kind: "custom", entry });
    }

    customGroupNames.sort();

    const groups: GridGroup[] = [];
    for (const name of catalogOrder) {
      groups.push(groupMap.get(name)!);
    }
    for (const name of customGroupNames) {
      groups.push(groupMap.get(name)!);
    }

    return groups;
  }, [filaments, filters, getEntry, stock]);

  const totalItems = filteredGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );

  const handleCatalogSave = useCallback(
    (quantity: number, brand: string) => {
      if (!modalTarget || modalTarget.kind !== "catalog") return;
      setQuantity(
        modalTarget.product.slug,
        modalTarget.variant.sku,
        quantity,
        brand,
      );
      setModalTarget(null);
    },
    [modalTarget, setQuantity],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterBar
          filters={filters}
          brands={brands}
          availableProductTypes={availableProductTypes}
          onMaterialChange={setMaterial}
          onProductTypeChange={setProductType}
          onBrandChange={setBrand}
          onAddBrand={addBrand}
          onSearchChange={setSearchQuery}
          onShowOnlyOwnedChange={setShowOnlyOwned}
        />
        <button
          type="button"
          onClick={() => setModalTarget({ kind: "new-custom" })}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          + Add Custom
        </button>
      </div>

      {totalItems === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="flex flex-col gap-8">
          {filteredGroups.map((group) => (
            <section key={group.groupName}>
              <h2 className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-white/80 py-2 text-lg font-semibold text-zinc-900 backdrop-blur-sm dark:bg-zinc-950/80 dark:text-zinc-100">
                {group.groupName}
                <span className="text-sm font-normal text-zinc-400">
                  {group.material}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {group.items.map((item) => {
                  if (item.kind === "catalog") {
                    const entry = getEntry(
                      item.product.slug,
                      item.variant.sku,
                    );
                    return (
                      <FilamentCard
                        key={`${item.product.slug}::${item.variant.sku}`}
                        product={item.product}
                        variant={item.variant}
                        entry={entry}
                        onClick={() =>
                          setModalTarget({
                            kind: "catalog",
                            product: item.product,
                            variant: item.variant,
                          })
                        }
                      />
                    );
                  }
                  return (
                    <CustomFilamentCard
                      key={item.entry.id}
                      entry={item.entry}
                      onClick={() =>
                        setModalTarget({ kind: "custom", entry: item.entry })
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalTarget?.kind === "catalog" && (
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
          brands={brands}
          onAddBrand={addBrand}
          onSave={handleCatalogSave}
          onClose={() => setModalTarget(null)}
        />
      )}

      {modalTarget?.kind === "custom" && (
        <CustomFilamentModal
          entry={modalTarget.entry}
          brands={brands}
          onAddBrand={addBrand}
          onSave={addCustomEntry}
          onUpdate={updateCustomEntry}
          onDelete={(id) => {
            deleteCustomEntry(id);
            setModalTarget(null);
          }}
          onClose={() => setModalTarget(null)}
        />
      )}

      {modalTarget?.kind === "new-custom" && (
        <CustomFilamentModal
          brands={brands}
          onAddBrand={addBrand}
          onSave={(subtype, colorTag, quantity, brand, displayName) => {
            addCustomEntry(subtype, colorTag, quantity, brand, displayName);
            setModalTarget(null);
          }}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
  );
}
