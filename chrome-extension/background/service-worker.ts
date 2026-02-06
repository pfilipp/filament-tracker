import { buildLookupIndex } from "../shared/matching";
import type { ExtensionMessage, StockData, SyncState, LookupIndex } from "../shared/types";

const TAG = "[FT-sw]";
console.log(TAG, "Service worker started");

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    console.log(TAG, "Received message:", message.type, "from:", sender.url ?? sender.id);

    if (message.type === "STOCK_SYNC") {
      handleStockSync(message.stockData)
        .then((syncState) => {
          console.log(TAG, "Sync complete:", syncState);
          sendResponse(syncState);
        })
        .catch((err) => {
          console.error(TAG, "Sync failed:", err);
          sendResponse(null);
        });
      return true;
    }

    if (message.type === "GET_LOOKUP") {
      chrome.storage.local.get("lookup", (result) => {
        const count = Object.keys(result.lookup ?? {}).length;
        console.log(TAG, `Returning lookup with ${count} entries`);
        sendResponse({ type: "LOOKUP_RESULT", lookup: result.lookup ?? {} } as ExtensionMessage);
      });
      return true;
    }
  }
);

async function handleStockSync(stockData: StockData): Promise<SyncState> {
  console.log(TAG, `Building lookup from ${stockData.entries.length} stock entries...`);
  const lookup: LookupIndex = buildLookupIndex(stockData);
  console.log(TAG, `Lookup index has ${Object.keys(lookup).length} keys`);

  const syncState: SyncState = {
    lastSyncedAt: new Date().toISOString(),
    entryCount: stockData.entries.length,
  };

  await chrome.storage.local.set({ lookup, syncState, stockData });
  console.log(TAG, "Saved to chrome.storage.local");

  // Notify any open store tabs that stock has been updated
  const tabs = await chrome.tabs.query({ url: "https://eu.store.bambulab.com/*/products/*" });
  console.log(TAG, `Found ${tabs.length} Bambu Lab store tabs to notify`);
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "STOCK_UPDATED" }).catch(() => {});
    }
  }

  return syncState;
}
