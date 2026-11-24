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

Open http://localhost:8080. The pages are static. The Windows forms call hosted Supabase functions, so submitting them creates real signups.

## Deploy

Cloudflare Workers deploys the site to `https://acoustic.acst.workers.dev`. Configure the `acoustic` Worker to build from GitHub's `main` branch with no build command and `npx wrangler deploy` as the deploy command. Wrangler serves the files selected by `.assetsignore` and applies `_headers`.

Apply the Neurodivergent mailing-list migration and deploy the `windows-neurodivergent` Edge Function before deploying the site's Neurodivergent signup flow.

Netlify can also publish the repository root using `netlify.toml`.

## Windows desktop apps

The homepage offers [Acoustic Neurodivergent 0.9.3](https://acoustic.acst.workers.dev/#windows-neurodivergent) (`3976f22`) and Managed Beta 7 (`0.8.2-beta.7`, `c10264a`). The `windows-neurodivergent` Supabase Edge Function records names and normalized email addresses in `public.neurodivergent_mailing_list` and issues a 45-minute download ticket. Repeat signups get a new ticket and retain the original name. Only the managed beta issues an app activation code.

Build the Neurodivergent installer with `npm run desktop:installer -- --offline-pilot` on Windows x64. Upload the verified `.exe` to a prerelease in the private `Acoustic-Windows-Installers` repository. Update `neurodivergentRelease` in `worker.mjs` with the filename, byte count, and numeric GitHub asset ID. Update the version and checksum in the site and verify the complete download after deployment.

The homepage sends managed beta signups to the `windows-beta` Supabase Edge Function and displays the activation code on the page. Returning testers can [download the managed beta with a saved code](https://acoustic.acst.workers.dev/#windows-update) without entering their name or email again. The main list is `public.beta_mailing_list`. A separate private table stores code hashes and access cutoffs. Duplicate signups cannot replace a code or reset a cutoff.

Both installers are release assets in the private `Acoustic-Windows-Installers` GitHub repository. The Cloudflare Worker verifies each 45-minute ticket with the corresponding Supabase function and streams the installer from GitHub with resume support.

- [Managed beta version, filename, file size, and SHA-256](https://acoustic.acst.workers.dev/windows-release)
- Start a tester’s final week in the Supabase SQL Editor with `select public.begin_windows_beta_final_week('tester@example.com');`
- Stop a tester in the Supabase SQL Editor with `select public.stop_windows_beta_access('tester@example.com');`
- Look up a code’s tester email, device count, and cutoff with `select public.find_windows_beta_code_owner('code');`. In the table `acoustic_beta.windows_beta_access`, each email has one code hash and up to three device hashes.
- To clear the three registered device slots for a tester, use `select public.reset_windows_beta_devices('tester@example.com');`. Their current code and cutoff stay in effect.
- To pause new signups while existing testers can still activate and get updates, set the Edge Function secret `WINDOWS_BETA_SIGNUPS_PAUSED` to `true`. Unset it or set it to `false` to resume signups.

### Publish a newer Windows installer

1. Set the managed beta version in the Desktop App repository’s `scripts/build_installer.mjs` and run `npm run desktop:installer -- --managed-beta` on Windows x64.
2. Test the packaged app and record the exact installer byte count and SHA-256. Attach the executable to a prerelease in the private `Acoustic-Windows-Installers` repository.
3. Update `windowsRelease` in `worker.mjs` with the version, filename, byte count, SHA-256, and numeric GitHub asset ID. Update the managed beta heading and fallback version on the homepage and the fallback version in the guide. Deploy the Worker. Supabase issues and validates download tickets, and the Worker selects the current installer and serves its public release metadata.
4. Test the live signup and saved-code update paths. Verify the complete download’s checksum against the installer you built.
5. Keep the current release and one earlier verified installer for rollback. Restore the Worker's `windowsRelease` metadata for that asset when rolling back.

### Installer delivery credentials and rollback

The website Worker uses the `GITHUB_INSTALLER_TOKEN` secret for both installer routes. Give the token read-only Contents access to the private installer repository.

For versions that still have matching parts in the Supabase `acoustic-installers` bucket, you can restore the previous download path by setting `githubDownloadsEnabled` to `false` and redeploying the Edge Function. Verify signup, saved-code updates, and the complete download after changing providers.

## Notes

- Android screenshots are captures from the connected test phone (the disposable `org.acoustic.app.validation` package, 0.23.0, fresh defaults), cropped to the app frame and downscaled. The Windows guide shows the beta activation screen and a [Microsoft Learn SmartScreen example](https://learn.microsoft.com/en-us/power-automate/desktop-flows/dynamics365-cs-rpa#install-and-configure-contoso-crm-app).
- The site intentionally has no third-party fonts, analytics or embeds. The Windows form uses Supabase only for beta signup and delivery.
- Acoustic is a comfort-focused sound environment, not a medical device, not hearing protection and not active noise cancellation.
