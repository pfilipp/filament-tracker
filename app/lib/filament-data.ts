import filaments from "@/data/filaments.json";
import type { FilamentProduct } from "./types";

export const allFilaments = filaments as FilamentProduct[];

export function getProduct(slug: string): FilamentProduct | undefined {
  return allFilaments.find((p) => p.slug === slug);
}

export function getVariant(slug: string, sku: string) {
  const product = getProduct(slug);
  return product?.variants.find((v) => v.sku === sku);
}
