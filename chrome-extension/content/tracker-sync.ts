import type { StockData, ExtensionMessage } from "../shared/types";

const TAG = "[FT-sync]";
const STORAGE_KEY = "filament-tracker-stock";

console.log(TAG, "Content script loaded on", window.location.href);

function readAndSync() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    console.log(TAG, `No "${STORAGE_KEY}" key in localStorage — nothing to sync`);
    return;
  }

  console.log(TAG, `Found stock data (${raw.length} chars), parsing...`);

  try {
    const stockData: StockData = JSON.parse(raw);
    if (stockData.version !== 2 || !Array.isArray(stockData.entries)) {
      console.warn(TAG, "Stock data has wrong shape — version:", stockData.version);
      return;
    }

    console.log(TAG, `Sending STOCK_SYNC with ${stockData.entries.length} entries to service worker`);
    const message: ExtensionMessage = { type: "STOCK_SYNC", stockData };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error(TAG, "sendMessage failed:", chrome.runtime.lastError.message);
      } else {
        console.log(TAG, "Service worker responded:", response);
      }
    });
  } catch (err) {
    console.error(TAG, "Failed to parse stock data:", err);
  }
}

// Sync on load
readAndSync();

// Re-sync whenever localStorage changes (from another tab or the app itself)
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    console.log(TAG, "localStorage changed, re-syncing...");
    readAndSync();
  }
});
