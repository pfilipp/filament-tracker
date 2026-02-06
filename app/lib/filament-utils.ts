import type { ColorTag } from "./types";
import { PRODUCT_TYPE_MATERIAL } from "./constants";

export function getAutoName(brand: string, colorTag: ColorTag, subtype: string): string {
  return `${brand} ${colorTag[0].toUpperCase() + colorTag.slice(1)} ${subtype}`;
}

export function getMaterialForSubtype(subtype: string): "PLA" | "PETG" {
  return PRODUCT_TYPE_MATERIAL[subtype] ?? "PLA";
}
