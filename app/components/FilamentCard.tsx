"use client";

import Image from "next/image";
import type { FilamentProduct, FilamentVariant, StockEntry } from "@/app/lib/types";
import { BrandOverlay } from "./BrandOverlay";

interface FilamentCardProps {
  product: FilamentProduct;
  variant: FilamentVariant;
  entry: StockEntry | undefined;
  onClick: () => void;
}

export function FilamentCard({
  product,
  variant,
  entry,
  onClick,
}: FilamentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={variant.imagePath}
          alt={`${product.name} - ${variant.colorName}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {entry && <BrandOverlay brand={entry.brand} />}
        {entry && entry.quantity > 0 && (
          <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {entry.quantity}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {variant.colorName}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {product.name}
        </span>
        <span className="mt-1 inline-block w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {product.material}
        </span>
      </div>
    </button>
  );
}
