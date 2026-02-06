"use client";

import { useEffect, useState, useCallback } from "react";
import type { StockEntry } from "@/app/lib/types";
import { QuantityControl } from "./QuantityControl";

interface CustomFilamentModalProps {
  entry?: StockEntry;
  onSave: (
    productName: string,
    colorName: string,
    material: "PLA" | "PETG",
    quantity: number,
    brand: string,
  ) => void;
  onUpdate?: (
    id: string,
    updates: Partial<
      Pick<
        StockEntry,
        | "quantity"
        | "brand"
        | "customProductName"
        | "customColorName"
        | "customMaterial"
      >
    >,
  ) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function CustomFilamentModal({
  entry,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}: CustomFilamentModalProps) {
  const isEdit = !!entry;
  const [productName, setProductName] = useState(
    entry?.customProductName ?? "",
  );
  const [colorName, setColorName] = useState(entry?.customColorName ?? "");
  const [material, setMaterial] = useState<"PLA" | "PETG">(
    entry?.customMaterial ?? "PLA",
  );
  const [quantity, setQuantity] = useState(entry?.quantity ?? 1);
  const [brand, setBrand] = useState(entry?.brand ?? "");

  const isValid = productName.trim() !== "" && colorName.trim() !== "";

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
    if (!isValid) return;
    if (isEdit && onUpdate && entry) {
      onUpdate(entry.id, {
        customProductName: productName.trim(),
        customColorName: colorName.trim(),
        customMaterial: material,
        quantity,
        brand: brand.trim(),
      });
    } else {
      onSave(
        productName.trim(),
        colorName.trim(),
        material,
        quantity,
        brand.trim(),
      );
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
            Product Name
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Polymaker PLA Pro"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Color Name
          </label>
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="e.g. Sakura Pink"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Material
          </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as "PLA" | "PETG")}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="PLA">PLA</option>
            <option value="PETG">PETG</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Spools
          </label>
          <QuantityControl value={quantity} onChange={setQuantity} />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Brand
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Polymaker"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
