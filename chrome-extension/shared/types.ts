// Copied from app/lib/types.ts — keep in sync manually

export type ColorTag =
  | "black" | "blue" | "brown" | "cream" | "cyan"
  | "gold" | "gray" | "green" | "orange" | "pink"
  | "purple" | "red" | "silver" | "teal" | "white"
  | "yellow" | "multicolor";

export interface FilamentProduct {
  slug: string;
  name: string;
  material: "PLA" | "PETG";
  brand: string;
  imagePath: string;
  variants: FilamentVariant[];
}

export interface FilamentVariant {
  sku: string;
  colorName: string;
  colorCode: string | null;
  colorTag: ColorTag;
  imagePath: string;
  imageUrl: string;
}

export interface StockEntry {
  id: string;
  productSlug: string;
  variantSku: string;
  quantity: number;
  brand: string;
  addedAt: string;
  updatedAt: string;
  custom?: boolean;
  customSubtype?: string;
  customColorTag?: ColorTag;
  customDisplayName?: string;
}

export interface StockData {
  version: 2;
  entries: StockEntry[];
}

// Extension-specific types

export interface LookupEntry {
  quantity: number;
  brand: string;
}

/** Keyed by `{productSlug}::{colorCode}` or `{productSlug}::{sku}` */
export type LookupIndex = Record<string, LookupEntry>;

export interface SyncState {
  lastSyncedAt: string | null;
  entryCount: number;
}

export const DEFAULT_PORT = 3000;

/** Messages sent between content scripts and the service worker */
export type ExtensionMessage =
  | { type: "STOCK_SYNC"; stockData: StockData }
  | { type: "GET_LOOKUP" }
  | { type: "LOOKUP_RESULT"; lookup: LookupIndex };
