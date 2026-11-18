# Acoustic-Website

The website for Acoustic — an offline Windows and Android sound-masking instrument for noisy rooms. Static site, no build step; hosted on Netlify. Source for the instrument itself is private while the venture is in testing (free for testers — email reachout.acoustic@gmail.com).

**Coming soon to Google Play Store.** Engineering builds are available on request — see the contact address at the bottom of the homepage.

> **Contact.** Email `reachout.acoustic@gmail.com` for beta requests and privacy inquiries.

## What it contains

- `RESEARCH.md` — the real research log behind "human, not vibe-coded": sources actually fetched (AI-slop and vibe-coding literature, Willison's slop definition, NN/g's AI-era stance, the backlash meme), two research waves, the anti-slop critiques, the v3 datasheet mistake, findings, and what was applied or refused — plus an honest list of search engines that were bot-walled.
- `index.html` / `styles.css` — the single-page site: a "field dossier" product page set in Instrument Sans (variable 400–700) and Instrument Serif (400 + italic), in both dark and light mode (toggle in the running head, persisted in `localStorage`, defaults to the OS `prefers-color-scheme`), both self-hosted from `assets/fonts/` (SIL OFL; Instrument Serif and Instrument Sans licences, alongside the previously retained Fraunces/Atkinson licence). No third-party fonts, no trackers, no cookies, no analytics. The logo ships in two theme-matched cuts: `assets/logo-mark-ondark.png` (aqua, for the dark page) and `assets/logo-mark-onlight.png` (deep teal, for the light page).
- `guide.html` holds the sound picker, library, blend recipes, interactive diagrams, compatibility checker and privacy details. The main page covers the app and testing.
- `site.js` handles navigation, theme persistence, the circular pointer, hero animation and the interactive sound tools. The hero provides a pause control and respects the system reduced-motion setting.
- No listening bench. The WebAssembly live-demo was removed from the page at the maker's request after it failed to fetch on real machines; nothing on the page attempts any fetch now. The app's engine remains in `assets/engine.*` and `engine/` for `engine-smoke.mjs` (local smoke test) only.
- `engine/` — provenance and the rebuild script (`acoustic-wasm.cpp`, `build-wasm.ps1`). The wrapper compiles **only** `audio/src/dsp.cpp` and `audio/src/library.cpp` from the Acoustic repository. No Android code, no microphone, no preferences, no network.
- `assets/` — logo artwork derived from the finalised `Acoustic.png` (plus two theme-matched recolours used by the page: `logo-mark-ondark.png` aqua on the dark page, `logo-mark-onlight.png` deep teal on the light page), the compiled engine (`engine.js` + `engine.wasm`), social image and cropped, real screenshots from the connected phone (`assets/screenshots/`).
- `engine-smoke.mjs` — Node smoke test used to verify the engine output headlessly (render all three scenes, print peak/acknowledged layers).

## Local preview

```powershell
python -m http.server 8080
```

Open http://localhost:8080. The pages are static. The Windows beta form calls the hosted Supabase function, so submitting it creates a real beta signup.

## Deploy

Cloudflare Workers deploys the site to `https://acoustic.acst.workers.dev`. Configure the `acoustic` Worker to build from GitHub's `main` branch with no build command and `npx wrangler deploy` as the deploy command. Wrangler serves the files selected by `.assetsignore` and applies `_headers`.

Netlify can also publish the repository root using `netlify.toml`.

## Windows beta

The homepage sends Windows beta signups directly to the `windows-beta` Supabase Edge Function. The main list is `public.beta_mailing_list` in the Acoustic Supabase project. It stores names and normalized email addresses, with one row per address and no public table access.

The installer is stored in eight ordered parts in the private `acoustic-installers` bucket. After a successful signup, the function issues a 45-minute download link and streams the original x64 installer as a single file with resume support. The source installer is not committed or served as a public website asset.

- Current release: `Acoustic-Desktop-App-setup-0.8.1.exe` (263,274,077 bytes)
- SHA-256: `5fc593c4475db1b47940b41edfcda3f145e69329413560cf1ce9ff8229b2a0ee`
- The Supabase migration and Edge Function source live under `supabase/`. Upload the parts under a new version prefix before changing the function to serve a newer installer.

## Notes

- Screenshots are unaltered captures from the connected test phone (the disposable `org.acoustic.app.validation` package, 0.23.0, fresh defaults), cropped to the app frame and downscaled.
- The site intentionally has no third-party fonts, analytics or embeds. The Windows form uses Supabase only for beta signup and delivery.
- Acoustic is a comfort-focused sound environment, not a medical device, not hearing protection and not active noise cancellation.
