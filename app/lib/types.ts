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

export interface BrandData {
  brands: string[];
}

export interface FilterState {
  material: "PLA" | "PETG" | "all";
  brand: string | "all";
  productType: string | "all";
  searchQuery: string;
  showOnlyOwned: boolean;
}
