# Mountain Collective Snow Tracker

This is a lightweight browser app for tracking every destination on the 2026/2027 Mountain Collective pass.

## Source model

The app now uses the OnTheSnow Mountain Collective report as the main baseline source for resort stats wherever available.

- Resort-specific refresh overlays can still add or replace fields when a parser succeeds.
- NOAA 72-hour snowfall forecasts are fetched live in the browser for the U.S. resorts only.
- Open-Meteo covers the international-resort forecast fallback.

## Files

- [index.html](C:\Users\dirkb\Documents\other\Codex test 1\index.html): app shell
- [styles.css](C:\Users\dirkb\Documents\other\Codex test 1\styles.css): alpine blue visual styling
- [data.js](C:\Users\dirkb\Documents\other\Codex test 1\data.js): original resort list
- [official-sources.js](C:\Users\dirkb\Documents\other\Codex test 1\official-sources.js): official source registry for all resorts
- [live-refresh-data.js](C:\Users\dirkb\Documents\other\Codex test 1\live-refresh-data.js): generated live refresh layer loaded by the browser
- [noaa-forecast-config.js](C:\Users\dirkb\Documents\other\Codex test 1\noaa-forecast-config.js): NOAA coverage map for U.S. resorts
- [global-forecast-config.js](C:\Users\dirkb\Documents\other\Codex test 1\global-forecast-config.js): Open-Meteo coverage map for international resorts
- [app.js](C:\Users\dirkb\Documents\other\Codex test 1\app.js): source merge logic, filters, and UI rendering
- [refresh-official-sources.ps1](C:\Users\dirkb\Documents\other\Codex test 1\refresh-official-sources.ps1): PowerShell adapter scaffold for official resort refreshes
- [images\resorts\README.txt](C:\Users\dirkb\Documents\other\Codex test 1\images\resorts\README.txt): local resort image filenames

## Preview

Open the app with:

```powershell
start index.html
```

For the cleanest NOAA forecast behavior, serve it locally with:

```powershell
powershell -ExecutionPolicy Bypass -File .\preview-server.ps1
```

Then open [http://localhost:8080](http://localhost:8080).

## Refresh script

Run the current PowerShell scaffold with:

```powershell
powershell -ExecutionPolicy Bypass -File .\refresh-official-sources.ps1
```

This writes:

- [live-refresh-data.json](C:\Users\dirkb\Documents\other\Codex test 1\live-refresh-data.json)
- [live-refresh-data.js](C:\Users\dirkb\Documents\other\Codex test 1\live-refresh-data.js)

The app will automatically load `live-refresh-data.js` on the next preview.

It currently contains explicit adapter patterns for Alta via Ski Utah, Snowbird via Ski Utah, Big Sky via OnTheSnow, Snowbasin, Grand Targhee, Sun Valley, Sunday River, Taos, Jackson Hole, and Sugarloaf. The rest of the resorts are already registered in the official source layer and can be added one by one as their HTML structures are mapped.

## Recommended workflow

1. Run the refresh pipeline.
2. Start the local preview server.
3. Open `http://localhost:8080`.

That way the `Last updated` field comes from the most recent generated refresh file instead of the original static seed data.

## Local resort photos

The resort cards now look for local images first:

- `images/resorts/<resort-id>.jpg`

If a resort image is missing, the app falls back to:

- [images\resorts\placeholder.svg](C:\Users\dirkb\Documents\other\Codex test 1\images\resorts\placeholder.svg)

See [images\resorts\README.txt](C:\Users\dirkb\Documents\other\Codex test 1\images\resorts\README.txt) for the exact filenames.

## Forecast notes

The app now uses two forecast sources in the browser:

- `/points/{lat},{lon}` to discover the forecast endpoints
- `forecastGridData` to total `snowfallAmount` over the next 72 hours
- Open-Meteo hourly snowfall totals over the next 72 hours for international resorts

NOAA covers the U.S. resorts, and Open-Meteo covers the international resorts, so the cards now show a 72-hour forecast source on both sides.
