"use client";

import type { StockEntry } from "@/app/lib/types";
import { getAutoName, getMaterialForSubtype } from "@/app/lib/filament-utils";
import { BrandOverlay } from "./BrandOverlay";
import { ColorTagBadge } from "./ColorTagBadge";

interface CustomFilamentCardProps {
  entry: StockEntry;
  onClick: () => void;
}

export function CustomFilamentCard({ entry, onClick }: CustomFilamentCardProps) {
  const subtype = entry.customSubtype ?? "PLA Basic";
  const colorTag = entry.customColorTag ?? "white";
  const material = getMaterialForSubtype(subtype);
  const displayName =
    entry.customDisplayName || getAutoName(entry.brand, colorTag, subtype);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <span className="text-4xl text-zinc-300 dark:text-zinc-600">?</span>
        <BrandOverlay brand={entry.brand} />
        {entry.quantity > 0 && (
          <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {entry.quantity}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {displayName}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {subtype}
        </span>
        <div className="mt-1 flex gap-1">
          <span className="inline-block w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {material}
          </span>
          <ColorTagBadge tag={colorTag} />
        </div>
      </div>
    </button>
  );
}
