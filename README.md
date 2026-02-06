# Filament Tracker

A local-first web app and browser extension for tracking your Bambu Lab 3D printing filament stock. Mark how many spools you own per color variant, then see those quantities overlaid directly on the Bambu Lab store.

## How It Works

1. **Web app** — browse the full Bambu Lab filament catalog and set stock counts per color variant. Data is stored in your browser's localStorage.
2. **Browser extension** — syncs stock data from the web app into extension storage, then overlays your quantities on `eu.store.bambulab.com` product pages so you can see what you already own while shopping.

## Prerequisites

- **Node.js** (v18+) and **npm**
- **Xcode** — only needed for the Safari extension

## Setup

### Web App

```bash
npm install
npm run dev          # starts on http://localhost:3001
```

### Chrome Extension

```bash
npm run ext:build    # builds to chrome-extension/dist/
```

1. Open `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `chrome-extension/dist` folder
3. Visit <http://localhost:3001> to let the extension sync your stock data
4. Browse `eu.store.bambulab.com` — stock badges appear on color swatches

### Safari Extension

1. In Safari, enable **Develop > Allow Unsigned Extensions** (requires enabling the Develop menu in **Safari > Settings > Advanced**)
2. Open `safari-extension/Filament Tracker/Filament Tracker.xcodeproj` in Xcode
3. Build and run the app target
4. Enable the extension in **Safari > Settings > Extensions**
5. Visit <http://localhost:3001> to let the extension sync your stock data
6. Browse `eu.store.bambulab.com` — stock badges appear on color swatches

## Updating Filament Data

Product data is scraped from the Bambu Lab EU store and committed to the repo:

```bash
npm run scrape             # writes data/filaments.json
npm run download-images    # downloads product images to public/filaments/
```

## Third-Party Filaments

You can also add non-Bambu Lab filaments to track stock for any brand. Store overlay support for third-party retailers (e.g. Amazon) is not yet available but may be added in the future.

## Limitations

Stock data lives in **localStorage** (web app) and **extension storage** (browser extension). This means:

- Data is local to your machine and browser — there is no cloud sync
- Clearing browser data or uninstalling the extension will erase your stock counts
- The web app must be open at least once after install so the extension can perform the initial sync
- Different browsers maintain separate stock counts
