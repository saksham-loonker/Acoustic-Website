# Acoustic-Website

The website for Acoustic — an offline Android sound-masking instrument for noisy rooms. Static site, no build step; hosted on Netlify. Source for the instrument itself is private while the venture is in testing (free for testers — email sakshamloonker@gmail.com).

**Coming soon to Google Play Store.** Engineering builds are available on request — see `index.html` (`mailto:sakshamloonker@gmail.com`).

## What it contains

- `RESEARCH.md` — the real research log behind "human, not vibe-coded": sources actually fetched (AI-slop and vibe-coding literature, Willison's slop definition, NN/g's AI-era stance, the backlash meme), two research waves, the anti-slop critiques, the v3 datasheet mistake, findings, and what was applied or refused — plus an honest list of search engines that were bot-walled.
- `index.html` / `styles.css` — the single-page site: a "field dossier" product page set in Poppins (200/300/400 + 400 italic) and JetBrains Mono (100–400), in both dark and light mode (toggle in the running head, persisted in `localStorage`, defaults to the OS `prefers-color-scheme`), both self-hosted from `assets/fonts/` (SIL OFL; Poppins and JetBrains Mono licences, alongside the previously retained Fraunces/Atkinson licence). No third-party fonts, no trackers, no cookies, no analytics.
- `site.js` — the round cursor (cream dot, terracotta ring; precise pointers and no-reduced-motion only), the animated hero canvas (eight breathing band columns, static under reduced motion), a static UTC stamp in the running head, Fig. 1 (the shipped eight-band layout, band edges from `audio/include/acoustic/dsp.h`), the ten-blend shelf (the app's own recipe table, with per-source amounts from the bundled library manifest), the shelf index, the QA ledger and the two rig practice benches (both drawings).
- No listening bench. The WebAssembly live-demo was removed from the page at the maker's request after it failed to fetch on real machines; nothing on the page attempts any fetch now. The app's engine remains in `assets/engine.*` and `engine/` for `engine-smoke.mjs` (local smoke test) only.
- `engine/` — provenance and the rebuild script (`acoustic-wasm.cpp`, `build-wasm.ps1`). The wrapper compiles **only** `audio/src/dsp.cpp` and `audio/src/library.cpp` from the Acoustic repository. No Android code, no microphone, no preferences, no network.
- `assets/` — logo artwork derived from the finalised `Acoustic.png`, the compiled engine (`engine.js` + `engine.wasm`), social image and cropped, real screenshots from the connected phone (`assets/screenshots/`).
- `engine-smoke.mjs` — Node smoke test used to verify the engine output headlessly (render all three scenes, print peak/acknowledged layers).

## Local preview

```powershell
python -m http.server 8080
```

Open http://localhost:8080. Everything the page ships is static; there is nothing to download interactively.

## Deploy

Netlify publishes the repository root (see `netlify.toml`). No build command is required.

## Notes

- Screenshots are unaltered captures from the connected test phone (the disposable `org.acoustic.app.validation` package, 0.23.0, fresh defaults), cropped to the app frame and downscaled.
- The site intentionally has no third-party fonts, analytics or embeds. View source: it is one HTML file, two scripts and one stylesheet.
- Acoustic is a comfort-focused sound environment, not a medical device, not hearing protection and not active noise cancellation.
