"use strict";

(() => {
  const DEFAULT_PORT = 3001;

  const statusEl = document.getElementById("sync-status");
  const portInput = document.getElementById("port-input");
  const openBtn = document.getElementById("open-btn");
  const syncBtn = document.getElementById("sync-btn");

  let saveTimeout;
  let currentPort = DEFAULT_PORT;

  function formatSyncTime(iso) {
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

  function updateStatus(syncState) {
    if (!syncState?.lastSyncedAt) {
      statusEl.textContent = "Not synced yet. Open your tracker app to sync.";
      statusEl.className = "status";
    } else {
      statusEl.textContent = `${formatSyncTime(syncState.lastSyncedAt)} (${syncState.entryCount} entries)`;
      statusEl.className = "status synced";
    }
  }

  function setStatusMessage(text, className) {
    statusEl.textContent = text;
    statusEl.className = `status ${className}`;
  }

  function trackerUrl() {
    return `http://localhost:${currentPort}`;
  }

  // Load initial state
  chrome.storage.local.get(["syncState", "trackerPort"], (result) => {
    updateStatus(result.syncState);
    currentPort = result.trackerPort ?? DEFAULT_PORT;
    portInput.value = String(currentPort);
  });

  // Auto-update status when sync happens in the background
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.syncState?.newValue) {
      updateStatus(changes.syncState.newValue);
    }
  });

  // Open Tracker button
  openBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: trackerUrl() });
  });

  // Sync Now button
  syncBtn.addEventListener("click", async () => {
    syncBtn.disabled = true;
    setStatusMessage("Syncing...", "");

    const timeout = setTimeout(() => {
      setStatusMessage("Sync timed out — is the tracker running?", "error");
      syncBtn.disabled = false;
    }, 8000);

    try {
      const allTabs = await chrome.tabs.query({ url: "http://localhost/*" });
      const tabs = allTabs.filter(t => {
        if (!t.url) return false;
        try { return new URL(t.url).port === String(currentPort); }
        catch { return false; }
      });

      if (tabs.length > 0 && tabs[0].id != null) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { type: "TRIGGER_SYNC" });
          clearTimeout(timeout);
          setTimeout(async () => {
            const result = await chrome.storage.local.get("syncState");
            updateStatus(result.syncState);
            syncBtn.disabled = false;
          }, 500);
        } catch {
          clearTimeout(timeout);
          setStatusMessage("Sync failed — reload the tracker tab", "error");
          syncBtn.disabled = false;
        }
      } else {
        const onChanged = (changes) => {
          if (changes.syncState?.newValue) {
            clearTimeout(timeout);
            chrome.storage.onChanged.removeListener(onChanged);
            updateStatus(changes.syncState.newValue);
            syncBtn.disabled = false;
            if (tempTab?.id != null) {
              chrome.tabs.remove(tempTab.id).catch(() => {});
            }
          }
        };
        chrome.storage.onChanged.addListener(onChanged);

        const tempTab = await chrome.tabs.create({
          url: trackerUrl(),
          active: false,
        });
      }
    } catch {
      clearTimeout(timeout);
      setStatusMessage("Sync failed", "error");
      syncBtn.disabled = false;
    }
  });

  // Save port on change (debounced)
  portInput.addEventListener("input", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const port = parseInt(portInput.value, 10);
      if (!port || port < 1 || port > 65535) return;
      currentPort = port;
      chrome.storage.local.set({ trackerPort: port });
      chrome.runtime.sendMessage({ type: "SET_PORT", port }).catch(() => {});
    }, 400);
  });
})();
