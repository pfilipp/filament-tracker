import type { SyncState } from "../shared/types";
import { DEFAULT_PORT } from "../shared/types";

const statusEl = document.getElementById("sync-status")!;
const portInput = document.getElementById("port-input") as HTMLInputElement;
const syncLink = document.getElementById("sync-link") as HTMLAnchorElement;

let saveTimeout: ReturnType<typeof setTimeout>;

function formatSyncTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "Synced just now";
  if (diffMin < 60) return `Synced ${diffMin}m ago`;
  if (diffHr < 24) return `Synced ${diffHr}h ago`;
  return `Synced ${date.toLocaleDateString()}`;
}

function updateStatus(syncState: SyncState | undefined) {
  if (!syncState?.lastSyncedAt) {
    statusEl.textContent = "Not synced yet. Open your tracker app to sync.";
    statusEl.className = "status";
  } else {
    statusEl.textContent = `${formatSyncTime(syncState.lastSyncedAt)} (${syncState.entryCount} entries)`;
    statusEl.className = "status synced";
  }
}

function updateLink(port: number) {
  syncLink.href = `http://localhost:${port}`;
}

// Read directly from chrome.storage.local — no service worker dependency
chrome.storage.local.get(["syncState", "trackerPort"], (result) => {
  updateStatus(result.syncState);
  const port = result.trackerPort ?? DEFAULT_PORT;
  portInput.value = String(port);
  updateLink(port);
});

// Save port on change (debounced)
portInput.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const port = parseInt(portInput.value, 10);
    if (!port || port < 1 || port > 65535) return;
    updateLink(port);
    // Save to storage and tell service worker to re-register content script
    chrome.storage.local.set({ trackerPort: port });
    chrome.runtime.sendMessage({ type: "SET_PORT", port }).catch(() => {
      // Service worker may not be running — it will pick up the port on next wake
    });
  }, 400);
});
