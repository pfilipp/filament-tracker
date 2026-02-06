import filaments from "@/data/filaments.json";
import type { ColorTag, FilamentProduct } from "./types";

export const allFilaments = filaments as FilamentProduct[];

export function getProduct(slug: string): FilamentProduct | undefined {
  return allFilaments.find((p) => p.slug === slug);
}

export function getVariant(slug: string, sku: string) {
  const product = getProduct(slug);
  return product?.variants.find((v) => v.sku === sku);
}

/** Find the first Bambu Lab variant image that matches a color tag. */
export function getImageForColorTag(colorTag: ColorTag): string | null {
  for (const product of allFilaments) {
    for (const variant of product.variants) {
      if (variant.colorTag === colorTag) return variant.imagePath;
    }
  }
  return null;
}
