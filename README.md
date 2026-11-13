# Acoustic-Website

Public website for [Acoustic](https://github.com/saksham-loonker/Acoustic) — an offline Android sound environment for noisy places. Static site, no build step; hosted on Netlify.

## What it contains

- `index.html` / `styles.css` — the single-page site: features, in-app screenshots, privacy, FAQ and pre-release download links.
- `demo.js` — a small Web Audio coloured-noise demo (white/pink/brown) that runs entirely in the browser. It is an approximation of the app's coloured-noise side, not the app's native engine.
- `assets/` — logo artwork derived from the finalised `Acoustic.png`, plus real cropped screenshots from a connected phone (`assets/screenshots/`).

## Local preview

Any static file server works, e.g.:

```powershell
python -m http.server 8080
```

Open http://localhost:8080.

## Deploy

Netlify publishes the repository root (see `netlify.toml`). No build command is required.

## Notes

- The site intentionally requires no third-party fonts, trackers or CDN assets. Everything is served from this repository.
- Screenshots are unaltered captures from the connected test phone (the disposable `org.acoustic.app.validation` package, 0.23.0, fresh defaults, dark theme because the phone is in dark mode), cropped to the app frame and downscaled for the web. They show only the app UI — no personal data, notifications or recordings.
- The feature/privacy copy reflects the shipping app's behaviour: no INTERNET permission, on-device preferences, no stored audio, no listening history.
- Acoustic is a comfort-focused sound environment, not a medical device, not hearing protection and not active noise cancellation.
