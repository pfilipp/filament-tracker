import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugifyColor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadImage(
  url: string,
  destPath: string
): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.status}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err);
    return false;
  }
}

async function main() {
  const dataPath = join(process.cwd(), "data", "filaments.json");
  const products: FilamentProduct[] = JSON.parse(
    readFileSync(dataPath, "utf-8")
  );

  const publicDir = join(process.cwd(), "public", "filaments");
  let downloadCount = 0;
  let skipCount = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      if (!variant.imageUrl) {
        console.log(
          `  Skipping ${product.slug}/${variant.colorName} - no image URL`
        );
        skipCount++;
        continue;
      }

      const colorSlug = slugifyColor(variant.colorName);
      const relativePath = `/filaments/${product.slug}/${colorSlug}.jpg`;
      const absolutePath = join(publicDir, product.slug, `${colorSlug}.jpg`);

      if (existsSync(absolutePath)) {
        console.log(`  Already exists: ${relativePath}`);
        variant.imagePath = relativePath;
        skipCount++;
        continue;
      }

      console.log(`  Downloading ${variant.imageUrl} -> ${relativePath}`);
      const success = await downloadImage(variant.imageUrl, absolutePath);

      if (success) {
        variant.imagePath = relativePath;
        downloadCount++;
      }

      await sleep(200);
    }

    // Set product imagePath to first variant's imagePath
    if (product.variants.length > 0 && product.variants[0].imagePath) {
      product.imagePath = product.variants[0].imagePath;
    }
  }

  // Write updated filaments.json with local imagePaths
  writeFileSync(dataPath, JSON.stringify(products, null, 2));

  console.log(
    `\nDone. Downloaded: ${downloadCount}, Skipped: ${skipCount}`
  );
}

main().catch(console.error);
