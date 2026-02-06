// Copied from scripts/scrape-filaments.ts:53-76 — keep in sync manually

export function parseColorFromVariantName(
  name: string
): { colorName: string; colorCode: string | null } {
  // Actual format from JSON-LD:
  // "PLA Basic - Jade White (10100) / Refill / 1kg"
  // "PLA Matte - Matte Ivory White (11100) / Refill / 1kg"
  // "PLA Silk - Candy Green (13506) / Filament with spool / 1 kg"

  // Take only the first segment before " / "
  const firstSegment = name.split(" / ")[0].trim();

  // Remove the product prefix before " - " (e.g. "PLA Basic - ")
  const dashIdx = firstSegment.indexOf(" - ");
  const colorPart = dashIdx >= 0 ? firstSegment.slice(dashIdx + 3).trim() : firstSegment;

  // Try to extract color name and code: "Jade White (10100)"
  const match = colorPart.match(/^(.+?)\s*\((\d{4,5})\)$/);
  if (match) {
    return { colorName: match[1].trim(), colorCode: match[2] };
  }

  // No code in parentheses
  return { colorName: colorPart, colorCode: null };
}
