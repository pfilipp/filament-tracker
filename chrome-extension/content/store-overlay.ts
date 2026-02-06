import type { LookupIndex, ExtensionMessage } from "../shared/types";
import { parseColorFromVariantName } from "../shared/parse-variant-name";

interface VariantInfo {
  colorCode: string | null;
  sku: string;
  imageUrl: string;
}

let currentLookup: LookupIndex = {};
let currentSlug: string | null = null;
let variants: VariantInfo[] = [];

// --- JSON-LD Parsing ---

function getProductSlug(): string | null {
  // URL: /en/products/pla-basic-filament or /de-de/products/pla-basic-filament
  const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
  return match ? match[1] : null;
}

function parseJsonLdVariants(): VariantInfo[] {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "");
      if (data["@type"] === "ProductGroup" && Array.isArray(data.hasVariant)) {
        const seen = new Map<string, VariantInfo>();
        for (const v of data.hasVariant) {
          const { colorCode } = parseColorFromVariantName(v.name || "");
          const key = `${colorCode ?? ""}-${v.image ?? ""}`;
          if (!seen.has(key)) {
            seen.set(key, {
              colorCode,
              sku: v.sku || "",
              imageUrl: v.image || "",
            });
          }
        }
        return Array.from(seen.values());
      }
    } catch {
      // skip
    }
  }
  return [];
}

// --- Badge Injection (Bulk Sale Page) ---

function injectBulkSaleBadges() {
  // Find product card links on pages like /pages/promotions/filament-bulk-sale
  const cardLinks = document.querySelectorAll<HTMLAnchorElement>(
    'a[href*="/products/"]'
  );

  for (const link of cardLinks) {
    // Extract slug from href: /products/{slug} or /products/{slug}?id=...
    const hrefMatch = link.getAttribute("href")?.match(/\/products\/([^/?#]+)/);
    if (!hrefMatch) continue;
    const slug = hrefMatch[1];

    // Find the .bbl-description element within (or near) this card
    const card = link.closest("[class*='card']") || link.parentElement;
    if (!card) continue;

    const descEl = card.querySelector(".bbl-description");
    if (!descEl?.textContent) continue;

    const { colorCode } = parseColorFromVariantName(descEl.textContent.trim());
    if (!colorCode) continue;

    const key = `${slug}::${colorCode}`;
    const entry = currentLookup[key];
    if (!entry || entry.quantity <= 0) continue;

    // Find the product image to anchor the badge on
    const img = card.querySelector<HTMLImageElement>("img");
    if (!img) continue;

    const parent = img.closest(".ant-image") || img.parentElement;
    if (!parent) continue;
    if (parent.querySelector(".ft-badge")) continue;

    const parentEl = parent as HTMLElement;
    const position = getComputedStyle(parentEl).position;
    if (position === "static") {
      parentEl.style.position = "relative";
    }

    const badge = document.createElement("span");
    badge.className = "ft-badge";
    badge.textContent = String(entry.quantity);
    badge.title = `You have ${entry.quantity} in stock`;
    parentEl.appendChild(badge);
  }
}

// --- Badge Injection (Product Page) ---

function normalizeImageUrl(url: string): string {
  // Strip query params for comparison (CDN may add size params)
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

function findQuantity(variant: VariantInfo, slug: string): number | null {
  // Try colorCode first
  if (variant.colorCode) {
    const entry = currentLookup[`${slug}::${variant.colorCode}`];
    if (entry) return entry.quantity;
  }
  // Fallback to SKU
  const skuEntry = currentLookup[`${slug}::${variant.sku}`];
  if (skuEntry) return skuEntry.quantity;
  return null;
}

function injectBadges() {
  if (!currentSlug || variants.length === 0) return;

  // Remove existing badges before re-injecting
  document.querySelectorAll(".ft-badge").forEach((el) => el.remove());

  // Build a map from normalized image URL → variant info
  const imageMap = new Map<string, VariantInfo>();
  for (const v of variants) {
    if (v.imageUrl) {
      imageMap.set(normalizeImageUrl(v.imageUrl), v);
    }
  }

  // Find swatch images — Bambu store uses .ant-image-img for color swatches
  const swatchImages = document.querySelectorAll<HTMLImageElement>(
    ".ant-image-img, [class*='swatch'] img, [class*='color-option'] img"
  );

  for (const img of swatchImages) {
    const normalizedSrc = normalizeImageUrl(img.src);
    const variant = imageMap.get(normalizedSrc);
    if (!variant) continue;

    const quantity = findQuantity(variant, currentSlug);
    if (quantity === null || quantity <= 0) continue;

    // Find the positioning parent for the badge
    const parent = img.closest(".ant-image") || img.parentElement;
    if (!parent) continue;

    // Don't double-inject
    if (parent.querySelector(".ft-badge")) continue;

    // Make parent a positioning context if it isn't already
    const parentEl = parent as HTMLElement;
    const position = getComputedStyle(parentEl).position;
    if (position === "static") {
      parentEl.style.position = "relative";
    }

    const badge = document.createElement("span");
    badge.className = "ft-badge";
    badge.textContent = String(quantity);
    badge.title = `You have ${quantity} in stock`;
    parentEl.appendChild(badge);
  }
}

// --- Lookup Loading ---

async function loadLookup(): Promise<void> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "GET_LOOKUP" } as ExtensionMessage,
      (response: ExtensionMessage) => {
        if (response?.type === "LOOKUP_RESULT") {
          currentLookup = response.lookup;
        }
        resolve();
      }
    );
  });
}

// --- Init & Observers ---

function injectAll() {
  // Product page badges (needs slug + JSON-LD variants)
  injectBadges();
  // Bulk sale / listing page badges (works from DOM alone)
  injectBulkSaleBadges();
}

async function init() {
  currentSlug = getProductSlug();

  if (currentSlug) {
    variants = parseJsonLdVariants();
  }

  await loadLookup();
  injectAll();

  // Watch for dynamically loaded elements
  const observer = new MutationObserver(() => {
    injectAll();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Handle SPA navigation (Bambu store uses client-side routing)
function patchHistory() {
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    originalPushState(...args);
    onNavigation();
  };
  history.replaceState = function (...args) {
    originalReplaceState(...args);
    onNavigation();
  };
  window.addEventListener("popstate", onNavigation);
}

async function onNavigation() {
  // Wait a tick for the DOM to settle after SPA navigation
  await new Promise((r) => setTimeout(r, 100));

  const newSlug = getProductSlug();
  if (newSlug && newSlug !== currentSlug) {
    currentSlug = newSlug;
    variants = parseJsonLdVariants();
  } else if (!newSlug) {
    currentSlug = null;
    variants = [];
  }

  // Remove existing badges and re-inject for the new page
  document.querySelectorAll(".ft-badge").forEach((el) => el.remove());
  injectAll();
}

// Listen for stock updates from the service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STOCK_UPDATED") {
    loadLookup().then(() => injectAll());
  }
});

// Run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    patchHistory();
    init();
  });
} else {
  patchHistory();
  init();
}
