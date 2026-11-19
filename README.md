# Acoustic-Website

The website for Acoustic, a sound-masking app for Windows and Android. Audio processing is local. Android runs offline and the Windows beta checks access online. The static website deploys to Cloudflare Workers. The beta is free.

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

The homepage sends Windows beta signups to the `windows-beta` Supabase Edge Function and displays the activation code on the page. Returning testers can use their saved code at [Install the latest Windows update](https://acoustic.acst.workers.dev/#windows-update) without entering their name or email again. The main list is `public.beta_mailing_list`. A separate private table stores code hashes and access cutoffs. Duplicate signups cannot replace a code or reset a cutoff.

The installer is stored in ordered parts in the private `acoustic-installers` bucket. After a successful signup or access check, the function issues a 45-minute download link and streams the original x64 installer with resume support.

- [Current Windows version, filename, file size, and SHA-256](https://qsycldeqkdgteccdpsty.supabase.co/functions/v1/windows-beta/release)
- Start a tester’s final week in the Supabase SQL Editor with `select public.begin_windows_beta_final_week('tester@example.com');`
- Stop a tester in the Supabase SQL Editor with `select public.stop_windows_beta_access('tester@example.com');`
- Look up a code’s tester email, device count, and cutoff with `select public.find_windows_beta_code_owner('code');`. In the table `acoustic_beta.windows_beta_access`, each email has one code hash and up to three device hashes.
- To clear the three registered device slots for a tester, use `select public.reset_windows_beta_devices('tester@example.com');`. Their current code and cutoff stay in effect.
- To pause new signups while existing testers can still activate and get updates, set the Edge Function secret `WINDOWS_BETA_SIGNUPS_PAUSED` to `true`. Unset it or set it to `false` to resume signups.

### Publish a newer Windows installer

1. Set the managed beta version in the Desktop App repository’s `scripts/build_installer.mjs` and run `npm run desktop:installer -- --managed-beta` on Windows x64.
2. Test the packaged app. Record the exact installer byte count and SHA-256. Upload the installer to the private `acoustic-installers` bucket in 32 MiB parts named `<version>/part-0`, `<version>/part-1`, and so on.
3. Set `release`, `bytes`, and `sha256` in `supabase/functions/windows-beta/index.ts`. Deploy the `windows-beta` Edge Function with its existing public routing settings. The same version powers signup downloads, update downloads, and the version and checksum shown on the website.
4. Test the live signup and saved-code update paths. Verify the complete download’s checksum against the installer you built.
5. Keep the current release and one earlier verified installer for rollback. Once old downloads have expired, remove older storage prefixes through the Supabase Storage dashboard. Removing an installer frees storage. Each new download still counts toward bandwidth.

## Notes

- Android screenshots are captures from the connected test phone (the disposable `org.acoustic.app.validation` package, 0.23.0, fresh defaults), cropped to the app frame and downscaled. The Windows guide shows the beta activation screen and a [Microsoft Learn SmartScreen example](https://learn.microsoft.com/en-us/power-automate/desktop-flows/dynamics365-cs-rpa#install-and-configure-contoso-crm-app).
- The site intentionally has no third-party fonts, analytics or embeds. The Windows form uses Supabase only for beta signup and delivery.
- Acoustic is a comfort-focused sound environment, not a medical device, not hearing protection and not active noise cancellation.
