"use client";

import { DEFAULT_BRAND } from "@/app/lib/constants";

export function BrandOverlay({ brand }: { brand: string }) {
  if (!brand || brand === DEFAULT_BRAND) return null;

  return (
    <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
      {brand}
    </span>
  );
}
