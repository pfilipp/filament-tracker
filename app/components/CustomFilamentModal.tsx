"use client";

import { useEffect, useState, useCallback } from "react";
import type { ColorTag, StockEntry } from "@/app/lib/types";
import { COLOR_TAGS, PRODUCT_TYPES, DEFAULT_BRAND } from "@/app/lib/constants";
import { getAutoName, getMaterialForSubtype } from "@/app/lib/filament-utils";
import { QuantityControl } from "./QuantityControl";
import { BrandSelect } from "./BrandSelect";

interface CustomFilamentModalProps {
  entry?: StockEntry;
  brands: string[];
  onAddBrand: (name: string) => void;
  onSave: (
    subtype: string,
    colorTag: ColorTag,
    quantity: number,
    brand: string,
    displayName?: string,
  ) => void;
  onUpdate?: (
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
  ) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function CustomFilamentModal({
  entry,
  brands,
  onAddBrand,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}: CustomFilamentModalProps) {
  const isEdit = !!entry;
  const [subtype, setSubtype] = useState(
    entry?.customSubtype ?? PRODUCT_TYPES[0],
  );
  const [colorTag, setColorTag] = useState<ColorTag>(
    entry?.customColorTag ?? "white",
  );
  const [quantity, setQuantity] = useState(entry?.quantity ?? 1);
  const [brand, setBrand] = useState(entry?.brand ?? DEFAULT_BRAND);
  const [displayName, setDisplayName] = useState(
    entry?.customDisplayName ?? "",
  );

  const autoName = getAutoName(brand, colorTag, subtype);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleSubmit = () => {
    if (isEdit && onUpdate && entry) {
      onUpdate(entry.id, {
        customSubtype: subtype,
        customColorTag: colorTag,
        quantity,
        brand,
        customDisplayName: displayName.trim() || undefined,
      });
    } else {
      onSave(subtype, colorTag, quantity, brand, displayName.trim() || undefined);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
          {isEdit ? "Edit Custom Filament" : "Add Custom Filament"}
        </h3>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </label>
          <select
            value={subtype}
            onChange={(e) => setSubtype(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t} ({getMaterialForSubtype(t)})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Color
          </label>
          <select
            value={colorTag}
            onChange={(e) => setColorTag(e.target.value as ColorTag)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {COLOR_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag[0].toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Brand
          </label>
          <BrandSelect
            value={brand}
            brands={brands}
            onBrandChange={setBrand}
            onAddBrand={onAddBrand}
          />
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name{" "}
            <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={autoName}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Preview: {displayName.trim() || autoName}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Spools
          </label>
          <QuantityControl value={quantity} onChange={setQuantity} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save
          </button>
          {isEdit && onDelete && entry && (
            <button
              type="button"
              onClick={() => {
                onDelete(entry.id);
                onClose();
              }}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
