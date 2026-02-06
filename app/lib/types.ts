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
  customProductName?: string;
  customColorName?: string;
  customMaterial?: "PLA" | "PETG";
}

export interface StockData {
  version: 1;
  entries: StockEntry[];
}

export interface FilterState {
  material: "PLA" | "PETG" | "all";
  brand: string | "all";
  productType: string | "all";
  searchQuery: string;
  showOnlyOwned: boolean;
}
