import type { StockData, ExtensionMessage } from "../shared/types";

const TAG = "[FT-sync]";
const STORAGE_KEY = "filament-tracker-stock";
const POLL_INTERVAL = 5000;

let lastDataHash: string | null = null;

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
        lastDataHash = raw;
        console.log(TAG, "Service worker responded:", response);
      }
    });
  } catch (err) {
    console.error(TAG, "Failed to parse stock data:", err);
  }
}

// Sync on load
readAndSync();

// Re-sync whenever localStorage changes (from another tab/window)
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    console.log(TAG, "localStorage changed, re-syncing...");
    readAndSync();
  }
});

// Poll for same-tab localStorage changes (storage event doesn't fire for same-tab writes)
setInterval(() => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  if (raw !== lastDataHash) {
    console.log(TAG, "Polling detected change, re-syncing...");
    readAndSync();
  }
}, POLL_INTERVAL);

// Listen for TRIGGER_SYNC from popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === "TRIGGER_SYNC") {
    console.log(TAG, "TRIGGER_SYNC received from popup");
    readAndSync();
    sendResponse({ ok: true });
  }
});
