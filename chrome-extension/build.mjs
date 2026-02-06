import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "fs";

const watch = process.argv.includes("--watch");

mkdirSync("dist", { recursive: true });

// Copy static assets to dist
cpSync("manifest.json", "dist/manifest.json");
cpSync("popup/popup.html", "dist/popup.html");
cpSync("popup/popup.css", "dist/popup.css");
cpSync("content/store-overlay.css", "dist/store-overlay.css");
cpSync("icons", "dist/icons", { recursive: true });

// Shared build options
const common = {
  bundle: true,
  sourcemap: false,
  minify: !watch,
  target: "chrome120",
  logLevel: "info",
};

// Service worker (ESM for Manifest V3)
const serviceWorkerCtx = await esbuild.context({
  ...common,
  entryPoints: ["background/service-worker.ts"],
  outfile: "dist/service-worker.js",
  format: "esm",
});

// Content scripts (IIFE — no module support in content scripts)
const trackerSyncCtx = await esbuild.context({
  ...common,
  entryPoints: ["content/tracker-sync.ts"],
  outfile: "dist/tracker-sync.js",
  format: "iife",
});

const storeOverlayCtx = await esbuild.context({
  ...common,
  entryPoints: ["content/store-overlay.ts"],
  outfile: "dist/store-overlay.js",
  format: "iife",
});

// Popup (IIFE)
const popupCtx = await esbuild.context({
  ...common,
  entryPoints: ["popup/popup.ts"],
  outfile: "dist/popup.js",
  format: "iife",
});

const contexts = [serviceWorkerCtx, trackerSyncCtx, storeOverlayCtx, popupCtx];

if (watch) {
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log("Watching for changes...");
} else {
  await Promise.all(contexts.map((ctx) => ctx.rebuild()));
  await Promise.all(contexts.map((ctx) => ctx.dispose()));
  console.log("Build complete.");
}
