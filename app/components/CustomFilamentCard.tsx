"use client";

import Image from "next/image";
import type { StockEntry } from "@/app/lib/types";
import { getAutoName, getMaterialForSubtype } from "@/app/lib/filament-utils";
import { getImageForColorTag } from "@/app/lib/filament-data";
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
  const imagePath = getImageForColorTag(colorTag);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={displayName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-zinc-300 dark:text-zinc-600">?</span>
        )}
        {entry.quantity > 0 && (
          <span
            className="flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
            style={{ position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 10 }}
          >
            {entry.quantity}
          </span>
        )}
        <span
          className="rounded-full bg-black/70 px-2 py-0.5 text-xs text-white backdrop-blur-sm"
          style={{ position: "absolute", bottom: "0.5rem", right: "0.5rem", zIndex: 10 }}
        >
          {entry.brand}
        </span>
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
