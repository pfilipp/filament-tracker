import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface FilamentVariant {
  sku: string;
  colorName: string;
  colorCode: string | null;
  imagePath: string;
  imageUrl: string;
}

interface FilamentProduct {
  slug: string;
  name: string;
  material: "PLA" | "PETG";
  brand: string;
  imagePath: string;
  variants: FilamentVariant[];
}

const BASE_URL = "https://eu.store.bambulab.com/en/products";

const PRODUCT_SLUGS = [
  // PLA
  "pla-basic-filament",
  "pla-matte",
  "pla-silk-upgrade",
  "pla-translucent",
  "pla-tough-upgrade",
  "pla-basic-gradient",
  "pla-silk-multi-color",
  "pla-wood",
  "pla-sparkle",
  "pla-marble",
  "pla-metal",
  "pla-galaxy",
  "pla-glow",
  "pla-aero",
  // PETG
  "petg-hf",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectMaterial(slug: string): "PLA" | "PETG" {
  if (slug.startsWith("petg")) return "PETG";
  return "PLA";
}

function parseColorFromVariantName(
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

async function fetchWithRetry(
  url: string,
  retries = 3
): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url);
    if (response.ok) return response;
    if (response.status === 429) {
      const wait = (attempt + 1) * 3000;
      console.log(`  Rate limited, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    console.error(`Failed to fetch ${url}: ${response.status}`);
    return null;
  }
  console.error(`Failed after ${retries} retries: ${url}`);
  return null;
}

async function scrapeProduct(slug: string): Promise<FilamentProduct | null> {
  const url = `${BASE_URL}/${slug}`;
  console.log(`Fetching ${url}...`);

  const response = await fetchWithRetry(url);
  if (!response) return null;

  const html = await response.text();
  const $ = cheerio.load(html);

  // Find JSON-LD script tags
  const jsonLdScripts = $('script[type="application/ld+json"]');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let productGroup: any = null;

  jsonLdScripts.each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      if (data["@type"] === "ProductGroup") {
        productGroup = data;
      }
    } catch {
      // skip invalid JSON
    }
  });

  if (!productGroup) {
    console.error(`No ProductGroup JSON-LD found for ${slug}`);
    return null;
  }

  const productName = productGroup.name || slug;
  const material = detectMaterial(slug);

  // Parse variants from hasVariant array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantsRaw: any[] = (productGroup as any).hasVariant || [];
  const colorMap = new Map<string, FilamentVariant>();

  for (const variant of variantsRaw) {
    const variantName: string = variant.name || "";
    const sku: string = variant.sku || "";
    const imageUrl: string = variant.image || "";

    const { colorName, colorCode } = parseColorFromVariantName(variantName);

    // Use colorName + colorCode as key to merge spool/refill variants
    const key = `${colorName}-${colorCode}`;

    if (!colorMap.has(key)) {
      colorMap.set(key, {
        sku,
        colorName,
        colorCode,
        imagePath: "",
        imageUrl,
      });
    }
  }

  const variants = Array.from(colorMap.values());

  return {
    slug,
    name: productName,
    material,
    brand: "Bambu Lab",
    imagePath: "",
    variants,
  };
}

async function main() {
  const products: FilamentProduct[] = [];

  for (const slug of PRODUCT_SLUGS) {
    const product = await scrapeProduct(slug);
    if (product) {
      products.push(product);
    }
    await sleep(2000);
  }

  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });

  const outputPath = join(dataDir, "filaments.json");
  writeFileSync(outputPath, JSON.stringify(products, null, 2));

  console.log(`\nWrote ${products.length} products to ${outputPath}`);
  for (const p of products) {
    console.log(`  ${p.slug}: ${p.variants.length} variants`);
  }
}

main().catch(console.error);
