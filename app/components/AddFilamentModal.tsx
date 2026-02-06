"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { FilamentProduct, FilamentVariant } from "@/app/lib/types";
import { DEFAULT_BRAND } from "@/app/lib/constants";
import { QuantityControl } from "./QuantityControl";
import { BrandSelect } from "./BrandSelect";
import { ColorTagBadge } from "./ColorTagBadge";

interface AddFilamentModalProps {
  product: FilamentProduct;
  variant: FilamentVariant;
  initialQuantity: number;
  initialBrand: string;
  brands: string[];
  onAddBrand: (name: string) => void;
  onSave: (quantity: number, brand: string) => void;
  onClose: () => void;
}

export function AddFilamentModal({
  product,
  variant,
  initialQuantity,
  initialBrand,
  brands,
  onAddBrand,
  onSave,
  onClose,
}: AddFilamentModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [brand, setBrand] = useState(initialBrand || DEFAULT_BRAND);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={variant.imagePath}
              alt={variant.colorName}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {product.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {variant.colorName}
            </p>
            <div className="mt-1 flex gap-1">
              <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {product.material}
              </span>
              <ColorTagBadge tag={variant.colorTag} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Spools
          </label>
          <QuantityControl value={quantity} onChange={setQuantity} />
        </div>

        <div className="mb-6">
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave(quantity, brand)}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save
          </button>
          {initialQuantity > 0 && (
            <button
              type="button"
              onClick={() => onSave(0, brand)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              Remove
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
