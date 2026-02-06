import type { StockData, LookupIndex, FilamentProduct } from "./types";
import catalog from "../catalog/filaments.json";

/**
 * Build a lookup index from stock data.
 * Keys: `{productSlug}::{colorCode}` and `{productSlug}::{sku}`
 * Values: `{ quantity, brand }`
 *
 * We use the catalog to resolve variantSku → colorCode so that
 * the store overlay can match by colorCode parsed from JSON-LD.
 */
export function buildLookupIndex(stockData: StockData): LookupIndex {
  const products = catalog as FilamentProduct[];

  // Build a quick sku → { product, variant } map from the catalog
  const skuMap = new Map<string, { productSlug: string; colorCode: string | null }>();
  for (const product of products) {
    for (const variant of product.variants) {
      skuMap.set(variant.sku, {
        productSlug: product.slug,
        colorCode: variant.colorCode,
      });
    }
  }

  const lookup: LookupIndex = {};

  for (const entry of stockData.entries) {
    if (entry.quantity <= 0) continue;

    const catalogInfo = skuMap.get(entry.variantSku);
    const productSlug = entry.productSlug;

    // Primary key: productSlug::colorCode
    if (catalogInfo?.colorCode) {
      const key = `${productSlug}::${catalogInfo.colorCode}`;
      const existing = lookup[key];
      lookup[key] = {
        quantity: (existing?.quantity ?? 0) + entry.quantity,
        brand: entry.brand,
      };
    }

    // Secondary key: productSlug::sku (always set)
    const skuKey = `${productSlug}::${entry.variantSku}`;
    const existingSku = lookup[skuKey];
    lookup[skuKey] = {
      quantity: (existingSku?.quantity ?? 0) + entry.quantity,
      brand: entry.brand,
    };
  }

  return lookup;
}
