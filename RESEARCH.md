# Making a website feel human â€” the research behind this page

Sources actually read while building this site (fetched 2026-11-14; Apple HIG and A List search endpoints were JS-gated or 404, noted for honesty). Findings are mapped to the decisions taken in `index.html` / `styles.css`.

## 1. Wikipedia â€” "AI slop" (https://en.wikipedia.org/wiki/AI_slop)

Key findings:
- Kommers et al. ("Why Slop Matters", *ACM AI Letters*, Jan 2026): AI slop has three prototypical   properties â€” **superficial competence**, **asymmetric effort**, **mass producibility**.
- Jonathan Gilmore (CUNY): AI slop has an *"incredibly banal, realistic style"* â€” it processes easily,   says nothing.
- 2025 Merriam-Webster / American Dialect Society Word of the Year: **slop** (pejorative for   low-quality AI content). Backlash culture demands authenticity signals.

Applied here:
- No "superficial competence" as the goal: the page shows costly specifics (exact library counts, exact   cadence numbers, the real APK version, the real commit history, a named human author + plain email).
- "Asymmetric effort" visible: a hand-built WebAssembly bench wired to the actual DSP core â€” not   achievable by pressing Tab-Tab three times.
- Mass-producibility removed: no card grid, no icon trio, no symmetric hero; the ledger numbers are   staggered, the columns are uneven, nothing about the page could stamp out 500 siblings.

## 2. Wikipedia â€” "Vibe coding" (https://en.wikipedia.org/wiki/Vibe_coding)

Key findings:
- Karpathy (Feb 2025) coined it: *"fully give in to the vibes, embrace exponentials, and forget that   the code even exists."* Criticism sections document: AI code shows ~1.7x more major issues   (CodeRabbit, 470 PRs) and the METR RCT found experienced devs were **19% slower** while believing   they were 24% faster â€” the perception gap. Karpathy floats it as throwaway-weekend-project material, not production.
- The failure mode is **unaudited acceptance** â€” "accept all, read nothing."

Applied here:
- Everything on this page is auditable: one HTML file, two small scripts, one stylesheet â€” view-sourceable   end to end. The engine bench is reproducible from source (`engine/build-wasm.ps1`) and smoke-testable   (`engine-smoke.mjs`). The colophon invites inspection instead of asking for trust.

## 3. Simon Willison â€” "Slop is the new name for unwanted AI-generated content" (https://simonwillison.net/2024/May/8/slop/, 8 May 2024)

Key findings:
- Slop = content *"mindlessly generated and thrust upon someone who didn't ask for it."*
- His personal bar: *"I attach my name and stake my credibility on the things that I publish."*

Applied here:
- Nothing on this page is forced: no autoplay, no sound until the visitor presses the button, no   prefilled email, no modal. The only "audio" is opt-in, ~95 KB, one-way.
- His credibility bar: the colophon names the maker and a working email; the FAQ admits what the app   is *not* (cancellation, hearing protection, medical treatment). Credibility > coverage.

## 4. Nielsen Norman Group â€” AI topic listing (https://www.nngroup.com/articles/?topic=artificial-intelligence)

Key findings (from the fetched article index, Nov 2026):
- NN/g treats AI-speed development as a **measurement** problem: *"Research can define what each release   must measure"* â€” not a speed problem. Their AI-era articles (e.g. "Liquid Glassâ€¦ obscures content")   argue visual languages fail when they serve the maker's delight instead of the reader's content.
- Their standing heuristics (visibility of system status, match to the real world, aesthetic and   minimalist design) remain applicable regardless of who wrote the code.

Applied here:
- The bench console shows real system status (`fetching â†’ engine live â†’ playing`), never a fake spinner.
- The interface defers to content: black-and-white type, no decorative chrome competing with words,   Stop stays one thumb away in the app â€” and on the page, the Play/Stop control is the only accented UI.

## 5. "Your AI Slop Bores Me" (https://youraislopboresme.com/, via Internet Archive 2026-03-09)

Key findings:
- The phrase that started a movement â€” the cultural signal is fatigue with *polished, unattributed* output;   people crave evidence of a person behind the artifact.
- "Humans make mistakes because that's what makes us human" â€” the meme valorises specificity over slickness.

Applied here:
- Deliberate human texture: real screenshots with real room names ("Mountain refuge"), a breathing canvas   instead of a stock hero image, an email address in three places, and honest limitations printed in body copy.

## 6. Three design critiques (obtained 2026-11-14, via OpenCode subagents on free endpoints)

(Historical record of the v3 pass - superseded the same day by the maker's rebuild; see section 7. Kept because the findings map is still true of that pass.)

After the first "humane" redesign was rejected as still reading as AI slop, three independent critiques were run against the page. Findings are mapped to changes; what was refused is listed too.

Critique 1 â€” recommended, in its own order:
- Kill the custom cursor â€” applied (markup, `.cross`/`.cross-tag` styles and the pointer-tracking script were deleted; the native cursor is used).
- De-clone the six identical "Not disclosed" notes â€” applied: each entry now states its withheld material in its own sentence and own label (`Held back` / `Closed` / `Not printed` / `Unpublished` / `Nothing withheld` / `Not a secret`); no two share a template. Facts are unchanged.
- Remove the fake `translateX(14px)` asymmetry â€” applied: no transform-based offsets remain, and the plate stagger (`nth-child` margin offsets) was flattened in the same pass. Asymmetry, where it exists, now comes from the content.
- Drop the scroll-progress bar and the film grain â€” applied: neither element is present; verified by grep and by full-page screenshots.
- Flatten the console shadow â€” applied: the rig keeps its 1px border; the offset block shadow was removed.
- Replace the procedural "fig. 1" canvas â€” applied: `site.js` now plots the shipped band edges (80 Hzâ€“7.8 kHz, `Config::edges` in `audio/include/acoustic/dsp.h`) as a log-frequency raised-cosine schematic, captioned as such, not as a measurement.
- Add a dated colophon build line â€” applied: `Sheet 1 of 1 Â· rev 0.23.0 Â· Set 14 Nov 2026`.
- An unstaged desk photo and one real first-person incident â€” **not applied**: both need material only the maker has (a real photo, a real story). Nothing was fabricated to fill the slots.

Critique 2 â€” flagged as AI tells:
- Pill radius `999px` â€” none remain; border-radius is 0 everywhere.
- Tabular numerals (`font-variant-numeric`) â€” none.
- `backdrop-filter` blur â€” none.
- `clamp()` fluid scale â€” removed; the display and section titles step at fixed breakpoints instead.
- Hairline grids â€” **deliberately retained** as the datasheet's sheet rules (structure, not decoration). This one was weighed and kept, and is recorded here so it is not mistaken for an oversight.
- Eight specific AI-sounding copy passages â€” copy was rewritten throughout; the six entry notes were de-formulaed (see critique 1) and aphoristic constructions were cut where they carried no information.

Critique 3 â€” ranked the custom cursor the single worst offender. It was deleted; the critiques did not disagree about it.

## 7. Second research wave â€” making the page humane, not "not-AI" (2026-11-14)

The v3 datasheet pass answered the anti-slop critiques by flattening everything into mono labels, zero radius and hairline rules. It read as a robot. The maker rejected it the same day: the round cursor should have stayed, and the page should feel like a person's site that is also professional. This section documents the research that drove the rebuild; the full mapping from findings to changes lives in the rebuild commit (see git log).

Sources fetched this session (2026-11-14) and what they contributed:
- Composite Global â€” "Human UX in an AI-First Web" (2026-01-30): lead with what people should feel, not what machines should extract; specifics over consensus; writing for someone specific; memorability and motion pacing over speed. Applied: the hero leads with the feeling ("a quieter room"), copy is written at one desk in one noisy office, not at "users".
- Showit â€” "What makes a website feel human and why AI can't fake it" (2026-06-24): taste over averages; the "humanity pass" (read every line aloud; cut what you would never say); story-first; one real customer. Applied: copy was read aloud and cut; the specific customer is a person whose desk faces a shared room.
- Metamode â€” "What makes design feel considered" (2026-10-20): one typeface or two with separate jobs; short palette; spacing as system; count greys/buttons/type sizes; copy swap test. Applied and counted: 2 text faces (Fraunces display, Atkinson Hyperlegible body) + system mono for data; 2 near-neutral ink greys; 4 shadow roles; 3 button roles with contextual size modifiers; body contrast measured 14.4:1.
- Honter Studio â€” "How to make your website look less AI-generated" (2026-10-29): hero should lead with the product, not a badge + centered sans; cards identical to siblings are a tell; avoid Inter/Geist defaults; keep body text â‰¥ 4.5:1. Applied: hero leads with a real phone screenshot at large size; feature cards carry distinct icons and were not made identical-by-grid; Fraunces + Atkinson are not tool defaults.
- Honter Studio's 22% stat (Adrian Krebs checked 1,590 Show HN landing pages; 22% used 4+ AI patterns) was noted for honesty â€” this page was not measured against that corpus.
- Studio Yellow â€” "How to Make Your Website Feel More Human": calm confidence, MAYA (advanced but acceptable), motion with meaning, high contrast, large tap targets. Applied: springy button hovers, ring-follow cursor, no carousels.
- WebDesigner Depot â€” "10 Ways to Build Radical TRUST" (2026-07-01): human language in micro-copy; transparency in the footer. Applied: footer states who made it, in one person's voice, and what Acoustic is not.
- Sitista â€” design as "feeling whether white space conveys calm or emptiness" (2026-09-22). Applied: hero and sections breathe; whitespace is calm because content carries it.
- Quell (soundmasking.at, fetched as HTML 2026-11-14): the professional sound-masking category baseline â€” eyebrow/h2/lede rhythm, real product imagery, reassurance-first fine print, app demo up front. Applied: eyebrowâ€“headlineâ€“lede rhythm, screenshots as proof, "what it is / what it is not" grid, demo before specs.
- KRU / Fragrant Naturals / Fontanelle / Graffeo case studies (searched 2026-11-14): warm neutral palette, high-contrast editorial serif, generous whitespace, one accent, photography-led layouts across cream (#F8F5F2 hashes). Applied: paper-cream + navy + terracotta-only-accent, Fraunces display face.
- Fraunces (Undercase Type, SIL OFL 1.1) and Atkinson Hyperlegible (Braille Institute, SIL OFL 1.1) â€” both self-hosted latin subsets; font license retained in `assets/fonts/OFL.txt`; no third-party font requests, so the "no third-party requests" colophon line stays true.

What changed from the v3 datasheet, and why (the user's words governed):
- Restored and rebuilt the round cursor (small navy dot, terracotta trailing ring; fine pointers only, reduced-motion aware). The user said removing it was a mistake.
- Zero border-radius and the flat hairline-as-everywhere grid reverted: 999px pills for actions, 14â€“22px radii for surfaces, soft warm shadows. The board-room datasheet read was the cost of answering anti-slop critiques with only subtraction.
- Type switched to Fraunces (display, with Wonk/Soft at headline sizes) and Atkinson Hyperlegible (body â€” commissioned for low-vision legibility; a very literal "for humans" face).
- The scroll-reveal (opacity/translateY on IntersectionObserver) was removed: content must be usable without JS and was rendering blank in static captures. Hover tactility stays; observers don't.
- Claims discipline, the live Wasm rig, the real screenshots and the "no third-party requests / no trackers" stance are unchanged â€” those were never the problem.

What is still outstanding (unchanged): the unstaged desk photo and the one real first-person incident from critique 1. Neither can be honestly authored without the maker supplying them; nothing was fabricated in their place.

## 8. In testing — the commercial frame (2026-11-14)

The maker changed the frame the same day: Acoustic is a three-person commercial venture in testing — **Saksham Loonker** (CEO & CTO, lead developer), **Mahir Thadani** (COO), **Aum Sonnenblick** (CMO) — and testing builds are **free for people who want to test**. The instrument repository is private, so every public claim about openness was corrected or removed. What was added or corrected:

- **Corrected (private repo):** the "Open source" trust chip, the "Read every line on GitHub" fine-print row, the "Source code / This page / Research notes" footer links, and the app-repo link in the README all went. Nothing on the page now misleads a visitor about where the source lives. The no-trackers, no-third-party-requests stance stands on its own.
- **Added:** a testing ribbon (navy, pulsing dot) with the email subject for a build; a stats strip (76 bundled recordings/works, 8 bands, 0 network calls, 1 ceiling); a "What's in it" inventory — 59 CC0 field recordings (incl. mountain refuge, cave & stream, ocean with distant whales, soft fireside), 17 public-domain works, live colour noise, and the Like/Love/Not-for-me ratings with an honest "no weights fitted, answers never leave the phone" note; "A day with Acoustic" (four editorial moments + an unattributed manifesto pull-quote with a hand-drawn squiggle); an "Acoustic, side by side" comparison table vs white-noise apps and ANC headphones, hedged honestly; a three-member team section with initials monograms instead of photos; an Android-version compatibility checker (JS; ≥10/API 29, arm64-v8a/x86_64, x86_64 for emulators); three new FAQ answers (testing, cost while testing, deleting your data).
- **Kept honest:** no dBA, no ANC, no medical claims, no outcome promises — every mention of those is a negation or a disclaimer. The manifesto is the studio's voice, deliberately unattributed to any person. The compare table hedges the competitor columns ("usually freemium", "often yes", "depends on vendor") because it does not measure them. No testimonials, no client counts, no funding claims.
- **Irregularity pass, per the maker:** rotated screenshot plates (with a straighten-on-hover), an offset card, an offset section head, staggered "day" rows, hand-drawn squiggle underline, rotating circular badge already present. The page now has deliberate irregularities instead of a uniform grid — the opposite failure mode from before.
- Figures 1 and the rig remain honest drawings/live Wasm, not measurements.

Verification for this pass: HTML parse OK; `node --check` on site.js/bench.js; headless Edge — rig plays, 0 px mobile overflow, 0 console/page errors; compat checker returns the right answer for API 28 and API 34; screenshots re-reviewed at 1280px and 390px.


## 9. Overload, round two — picker, anatomy, ornament (2026-11-14)

The same day, the maker asked for more: keep adding until the page is overloaded and humane. Added in this pass:

- **Start-sound picker** ("Find your starting sound") — a two-question deterministic widget (room × task → suggested shelf item: Mountain refuge, Cave & stream, Ocean with distant whales, Soft fireside, Colour noise, public-domain piano). No network, no storage, no learning; a suggestion for a first session, not a prescription.
- **Anatomy of a session** — four plain steps (Start → Listen → Shape → Stop) in the app's own terms, including the honest Auto listening posture (only while a session you started is running).
- **Ornamental wave divider** before the closing CTA; the `dropcap` and `wave-divider` CSS hooks.
- Picker bodies rewritten to avoid restating the title ("Cave & stream — Cave & stream…"), compat answers softened to "usually within a day or two", team lede changed from "not a startup" to "and one loud room we all share. Not a growth machine. A workshop." (the venture is three people; no funding claims are made anywhere).

Claims scan re-run: no dBA/ANC/medical/outcome wording anywhere except negations and disclaimers; zero GitHub/source links remain.


## 10. Round three — the ten blends, and two honest practice benches (2026-11-14)

The maker asked for more: keep adding until the page is overloaded, and make it feel made by a person. This pass adds three things, all drawn from the shipping app rather than invented.

**Source of the new facts.** Every number in this section comes from the instrument's own files, read this session:
- `app/src/main/java/org/acoustic/app/storage/BundledDefaults.kt` → the `natural_library.recipes` table (10 entries), `sound_matching.presets` (31 presets), `consumer_controls`, `daily_use`, `library` (transition/fade/mix limits), `analysis` (FFT 1024, hop 184, window 736, 16 kHz analysis rate, 250 ms raw-audio budget), `spectral_response` (16 default engine bands, 32 maximum).
- `app/src/main/assets/library/manifest.json` → 76 assets, 59 ambience + 17 music, all `CC0-1.0`, all Ogg/Opus 48 kHz stereo, all `rights_review: pass`, all `production_approved: false` (that flag is the app's release gate, not a statement about the website).
- `app/src/main/assets/library/CREDITS.txt` and `licenses/` → the credit and licence files ship inside the app.
- The ten recipe titles and the two-source amounts in the new "Ten blends" section are the recipe table verbatim; the source names and durations behind each id come from the manifest.

**Added.**
- **"The ten blends"** — a working shelf of the app's own two-source recipes. Ten tabs; each shows both sources by name, family, duration and licence, plus the exact mix amounts the app uses, drawn as bars from those numbers. Nine are bed-plus-accent (85/15, 25/75, 80/20, 85/15, 90/10, 92/8, 80/20, 85/15) and two are single-source (Quiet hearth, Fridge focus). The panel says plainly that the bars are a recipe, not a measurement of any room.
- **Two practice benches in the rig** — both are drawings, both labelled as such, neither plays sound: a ceiling transfer curve (drag the ceiling, watch the flat top the phone refuses to cross) and an eight-band tilt (a slope across the shipped edges, described as a sketch of what you would ask the engine for, with "the app does this with eight bands, not a free EQ curve").
- Nav and footer links to the new section.

**Refused / not done.** Still no desk photo and no real first-person incident — those need the maker's own material, and nothing was invented to fill the slots. No dBA, no ANC, no medical or outcome wording was added anywhere; the new copy talks about amounts, shapes and edges, which are all checkable in the app.

**Found and fixed while verifying (a real bug, not new scope).** At 320 px the page overflowed horizontally by 23 px. Cause: `.hero-copy` is a grid item with default `min-width: auto`, so a long unbreakable word (the headline's `A&nbsp;quieter`) forced the column wider than the viewport. Fixed by `minmax(0,…)` tracks on the collapsing grids and `min-width: 0` on `.compat-card` / `.compat-form`, which also removed a 23 px overflow inside the compatibility card. This was pre-existing, not introduced by this pass.

**Verification run this session (host-render only; no phone, no listening, no outcome evidence).**
- `node --check site.js`, `node --check bench.js`, `node --check engine-smoke.mjs`: pass.
- `node engine-smoke.mjs`: exit 0 — scene 0 peak 0.073 / scene 1 peak 0.077 / scene 2 peak 0.075, all three scenes return rc=0, eight applied layers each.
- Python tag-balance parse of `index.html`: 0 unclosed, 0 mismatches. 0 U+FFFD in `index.html` and `RESEARCH.md`.
- `verify-v5.mjs` against the working tree: FIG canvas 54,010-byte data URL; rig `playing · ceiling held at 0.30`, `8 / 8 · max 0.20`, peak 0.069; Café→Street switch `8 / 8 · max 0.22`; mobile (390 px) overflow 0 px; 0 console/page errors.
- `verify-v6.mjs` / `verify-v7.mjs` (new, in the temp dir): all ten blend tabs render with the right amounts and no clipping; single-source entries collapse to one bar and say so; ceiling slider moves 60 % → 25 % and the copy follows; tilt at even / +80 / −80 changes both the drawing and the sentence; rig Stop button reachable in a 900 px viewport; keyboard focus lands on a blend tab with a 3 px outline; 820 px and 320 px both at 0 px overflow after the fix.
- `audit-v4.mjs`: 2 text families + system mono, body contrast 14.41:1 against `#F7F3EB`, 3 near-neutral greys, 7 shadow roles, radii distributed across 999px / 22px / 14px / 16px / 50% / 6px.

**What I could not verify.** I cannot view images in this session, so the screenshots (`v6-blends.png`, `v6-rig.png`, `v6-mobile-blends.png`, `v6-mobile-rig.png`) were produced but not eyeballed; I substituted measured geometry, clipping and overflow checks. Those files are for the maker to look at.

## 11. Round four — what the testing actually covers (2026-11-14)

Same standing instruction: keep adding until overloaded, keep it honest, keep it human.

**Source of the new facts.** Read this session, from the instrument repo's own verification output for the version the site advertises (0.23.0, version code 40 — confirmed in `app/build.gradle.kts`):
- `reports/0.23.0/verification.json` → status `pass`, 17 checks all `pass` (build-jvm-lint-apks, native, native-sanitized, render-regressions, orbit-volume, tool-unit-tests, source-audit, apk-audit, library-decode-audit, content-pipeline, contrast, dependency-notices, plan-package, plan-preservation, release-gate-inventory, device-suite, data-preserving-install); `jvm_tests` core 68 suites / 374 tests / 0 failures and app 3 suites / 13 tests / 0 failures; core counters INSTRUCTION 60,739 covered vs 8,508 missed (89 %) and BRANCH 5,785 vs 3,150 (65 %); `public_release: blocked_pending_external_evidence`; `listening_outcome: not_measured`.
- `reports/0.23.0/device-tests.json` → 94 effective completed device cases, 3 failed on the first attempt and passed after fixture correction, earlier failures retained, ordinary preferences unchanged through testing and installation, scope note says explicitly that no route qualification or listening outcome is inferred.

**Added.** A QA ledger above the FAQ — four numbers in the report's own terms: 17 host checks, 387 host tests, 94 phone cases (three corrected rather than quietly dropped), and 0 listening outcomes, with the `not_measured` and `blocked_pending_external_evidence` gaps printed rather than smoothed over. It exists because "free for testers" is only credible if a tester can see what was already checked before they spend an evening on it.

**Refused.** No new claims about comfort, sleep, focus, hearing or any other outcome; the ledger's whole job is to mark those as unmeasured. No coverage figure was rounded up (89 % / 65 % are the counters as reported).

**Verification run this session (host render only).**
- `node --check` site.js/bench.js/engine-smoke.mjs: pass. `node engine-smoke.mjs`: exit 0, peaks 0.073/0.077/0.075 across the three scenes.
- `verify-v5.mjs`: FIG 54,010-byte data URL, rig `playing · ceiling held at 0.30`, `8 / 8 · max 0.20`, peak 0.069, Street switch `8 / 8 · max 0.22`, 390 px overflow 0, 0 console/page errors.
- `verify-v8.mjs` (new): ledger renders four numbers, no item clips, sits above the FAQ, and its body text measures 7.53:1 against the card with the numbers at 15.73 / 6.21 / 15.73 / 5.48 : 1 — all above 4.5:1.
- `sweep-widths.mjs`: 0 px overflow at 360, 390, 430, 600, 768, 820, 980, 1100, 1280 and 1600 px.
- Python tag-balance parse clean; 0 U+FFFD.

**Still not verified:** no phone was touched this delivery, no listening took place, and I cannot view images in this session — screenshots are generated but unexamined by me.

## 12. Round five — an index of the actual shelf (2026-11-14)

The site claimed 59 + 17 = 76 files; now a visitor can check that against the bundle itself.

**Source of the new facts.** `app/src/main/assets/library/manifest.json` (76 entries), read and cross-checked this session: all 76 are `CC0-1.0`, all Ogg/Opus 48 kHz stereo, 59 `ambience` and 17 `music`, 22 distinct family labels, 15 of the ambience files also appear in the ten-blend recipe table (`BundledDefaults.kt`), 44 do not. The 59 ambience files total 74.1 minutes with a 73 s median; the 17 music works total 35.2 minutes.

**Added.** A filterable index of the shelf inside "What's in it": every bundled title, its family, its duration and, where it is one, which of the ten blends it belongs to. Two kind chips (field recordings / music works), one chip per family, a title search, a live count, and a truthful empty state when nothing matches. The list scrolls inside its own panel at every width; nothing is fetched and nothing is stored.

**Refused.** No playback, no preview, no waveform and no download — the site does not ship the library and must not pretend to. No ratings or rankings of the recordings, because the app does not rank them either; it only offers fixed recipes.

**Verification run this session (host render only).**
- `node --check site.js`: pass. `engine-smoke.mjs`: exit 0.
- `verify-v9.mjs` (new): 76 rows at rest, count reads "76 of 76 files — the whole shelf, nothing held back", 15 blend tags; search "rain" → exactly the four rain titles; the `piano` chip → exactly the ten piano works; `Music works` → 17 rows across 7 families; an impossible query → 0 rows with the honest empty state; chip focus shows a 3 px outline; 390 px overflow 0.
- `verify-v5.mjs`: rig/FIG/390 px all green, 0 console/page errors.
- `sweep-widths.mjs`: 0 px overflow at 360–1600 px.
- `audit-v4.mjs`: still 2 text families + system mono, 14.41:1 body contrast, 3 greys, 7 shadow roles.
- HTML parse clean, 0 U+FFFD.

**Still unverified:** no phone, no listening, and I still cannot view the screenshots this session produces.

## 13. Round six — what the recordings actually contain (2026-11-14)

The library manifest carries a measured `spectral_fractions` array per file — eight numbers that say where each recording's energy sits across the eight engine bands. That is real, checkable data, so this pass turns it into a page section instead of another paragraph of adjectives.

**Source of the new facts.** `app/src/main/assets/library/manifest.json`, read this session: `spectral_fractions` has 8 entries per ambience file; summing bands 1–2 (80–315 Hz), 3–5 (315 Hz–1.25 kHz) and 6–8 (1.25–7.8 kHz) gives the three shares plotted. The ten most low-heavy, ten most high-heavy and ten most even files are the ones shown; every number in the panel comes straight from those arrays. Also confirmed: no file's `true_peak_dbtp` exceeds −6 dBTP, and the mean share across the 59 ambience files is roughly 11 % low / 37 % mid / 52 % high.

**Added.** "Where the energy actually sits": three sort orders (low-heavy, high-heavy, most even), each drawn as a three-segment bar per recording with a colour key and a sentence explaining what the sort reveals — machines and traffic lead the low end, insects and leaves the high end, and the "most even" list is mostly fire and shoreline. Each segment carries a title, and the panel has a text alternative.

**Also in this pass (found by measuring, not by eye).**
- Contrast: the new section used `#8D8478` on cream at 3.07:1, and the shelf's mono meta and green blend tag were 3.62:1 and effectively 1:1 against their own backgrounds. All were lifted above 4.5:1 (the tag is now `#3E5A4C` on `#E4EDE5`).
- Geometry: long recording names were clipping inside fixed-width columns at 1280 px, and shelf rows sat at 113 px on a phone. Names now wrap instead of truncating, and the name column narrows at intermediate widths.
- Metadata: music rows collapsed every family to the single label "music", which hid real information. Each row now reads `music · <family> · <length>`, and a short "how to read a row" note sits above the list.
- Consistency: the new controls arrived in two different radii. All chips and buttons are pill-radius again — one shape per control type.

**Refused.** No claim that any of this makes a recording better for focus, or that the shaping helps anyone; the panel describes content, not effect. No playback of the recordings, because the site does not ship them.

**Verification run this session (host render only).**
- `node --check site.js` / `bench.js`: pass. `engine-smoke.mjs`: exit 0.
- `verify-v10.mjs` (new): all ten rows render in each of the three orders, the three segment widths sum to 100 % in every row, the aria-label follows the active sort, no title clips, 390 px overflow 0.
- `verify-v9.mjs`: shelf still returns 76 rows, "rain" gives four titles, `piano` gives ten works, `Music works` gives 17 rows.
- `verify-v12.mjs` (new): each music row reports its own family (piano, guitar, harp, strings, winds, ambient, other music); Stop is still reachable and labelled `Stop` during playback.
- `verify-v5.mjs`: FIG, rig and 390 px all green, 0 console/page errors.
- `contrast-scan.mjs`: no remaining body-text pair below 4.5:1 except the intentional ones (terracotta button fill at 4.22–4.25:1 for large bold text, mono table header on the dark rig at 4.59:1).
- `audit-v4.mjs`: 2 text families + system mono, 14.41:1 body contrast, 3 greys, 7 shadow roles, all controls back to a single pill radius.
- `sweep-widths.mjs`: 0 px overflow at 360–1600 px. HTML parse clean, 0 U+FFFD.

**Still unverified:** no phone, no listening, and I still cannot view the screenshots this session produces.

## 14. Round seven — the picker can hand you to the shelf (2026-11-14)

Two things were wrong in the earlier rounds and both are fixed here.

**1. The picker used a blend name the app does not use.** Its three "Cave & stream" answers said `Cave & stream`; the shipped recipe is titled **"Cave and stream"** (`natural_library.recipes`, `BundledDefaults.kt`). A visitor who searched the shelf for the name the picker gave them found nothing. All three now read "Cave and stream".

**2. A suggestion could not be acted on.** The picker's answers are mostly blends, families or generated noise — not file names — so pointing at the shelf by file name would never have matched. The shelf now resolves three kinds of suggestion: an exact file title, a family (`piano` covers "Public-domain piano"), or a blend. Choosing a blend filters the shelf to the sources that blend uses and says so in the count ("2 of 76 files in Mountain refuge match"); the list receives focus so keyboard and screen-reader users land where the change happened. Colour noise is generated rather than bundled, so it honestly offers no jump at all.

**Also fixed.** The blend filter could survive a later chip click or search, leaving a stale subset on screen. Every chip and the search box now clear it.

**Refused.** No reordering of the shelf by "quality", no ranking of recordings, and no claim that a suggestion is right for anyone — the picker still calls itself a suggestion, not a prescription.

**Verification run this session (host render only).**
- `verify-v13.mjs` (new): picker "water + deep work" suggests Mountain refuge and offers the jump; clicking it leaves exactly `Wind in the Trees` and `Mountain Stream  #7` with the count "2 of 76 files in Mountain refuge match"; focus moves to the shelf list; "quiet + reading" offers a piano jump; "voices + deep work" (colour noise) offers none, because there is no such file.
- `verify-v9.mjs`: shelf still 76 rows, `piano` still ten works, `Music works` still 17 rows across families, empty state intact, 0 errors.
- `verify-v10.mjs`, `verify-v12.mjs`, `verify-v5.mjs`: green, 0 console/page errors, Stop still reachable.
- `sweep-widths.mjs`: 0 px overflow at 360–1600 px. `audit-v4.mjs`: 12 button variants, 14.41:1 body contrast. HTML parse clean, 0 U+FFFD. `engine-smoke.mjs` exit 0.

**Still unverified:** no phone, no listening, and I cannot view the screenshots.

## 15. The rig, rewritten for a person (2026-11-14)

The maker's verdict: "the run engine part is dumb." It was. Reviewed honestly, the rig had four problems, and all four were mine.

**What was wrong.**
1. **It claimed to be rooms and was not.** The buttons read "Room / Café / Street", but the engine plays three fixed shapes. Nothing on the page listened to a room. That is the worst kind of wrong: a demo implying a capability the product only has in a session the user explicitly starts.
2. **The primary action was engineer-speak.** "Run engine" is what the person who wrote it calls it. A visitor deciding whether to trust the page does not run engines; they listen.
3. **The readouts were telemetry, not information.** "Peak sample 0.069", "Render time 1215 ms" and "Engine size" are diagnostics. They answer "did my build work", which is my question, not the visitor's.
4. **A claim the page could not back.** The status said "ceiling held at 0.30" while the bench has no ceiling control at all — the 0.30 is the level this page renders at, nothing to do with the visitor's ceiling.

**What the three shapes actually are** (measured from the engine this session, so the labels are not decorative): the low/mid/high band sums are Warm 0.550/0.240/0.210, Even 0.375/0.250/0.375, Bright 0.220/0.240/0.540. So "Warm — low end forward, top eased", "Even — same all across", "Bright — top forward, low pulled in" is a description of the numbers, not a mood.

**What changed.**
- Buttons are now **Warm / Even / Bright**, each with a one-line gloss of its own shape. Pressing one while idle updates the sentence under the meter, so the control does something before you commit to audio.
- The action is **"Play 8 seconds"**, becoming **Stop** while it plays.
- The side column leads with the honest sentence: *the engine does not hear your room here — it plays three fixed shapes, so you can hear what "shaped" means before you install anything*, then lists the shapes, then the quiet facts (same C++ the phone ships, 94 KB, no microphone, no upload).
- Readouts are three lines a person can use: bands shaping, download once, shaped in. The peak is now a caption under the meter rather than a table row, and it says what 0.30 is: the level this page renders at, with the ceiling set in the app, not here.
- Status copy throughout is plain: "ready when you are", "8 s shaped in 1.2 s", "done · play it again whenever you like", "could not load — the engine runs on the phone".

**What I refused to change.** The bench still renders the real engine and reports real numbers from it; nothing is faked to sound friendlier. It still says it demonstrates shaping, not benefit. It still has no microphone and no network path. Making the labels human did not mean making the claims softer.

**Verification run this session (host render only).**
- `verify-rig.mjs` (new): idle state reads "Play 8 seconds" / "ready when you are" / "ready"; switching shape while idle updates the sentence and pressed state; playing reads "Stop", label `bright · playing`, bands `8 / 8 · max 0.22`, download 94 KB; switching mid-playback updates label, shape sentence and pressed state together; Stop returns to idle. 390 px and 768 px both 0 overflow, no clipped buttons.
- `verify-v5.mjs`: FIG 54,010-byte data URL, rig playing, 390 px overflow 0, 0 console/page errors.
- `sweep-widths.mjs`: 0 px overflow at 360–1600 px.
- `contrast-rig.mjs` / `contrast-side.mjs`: every rig text run measures 6.17:1 or better against the gradient actually painted behind it (the light-on-dark text sits on `#241F1B`, so 7.76–13.26:1); two greys elsewhere lifted to 5.62:1. The only remaining sub-4.5:1 pair is the terracotta button fill at 4.22:1 for large bold text.
- `audit-v4.mjs`: unchanged — 2 text families + system mono, 14.41:1 body contrast, 3 greys, 7 shadow roles.
- HTML parse clean, 0 U+FFFD, `engine-smoke.mjs` exit 0.

**Still unverified:** no phone, no listening, and I cannot view the screenshots.

## 16. The workshop-manual redesign (2026-11-14)

Maker's verdict: content is acceptable; change the entire layout to make it more appealing and humane.

**The design idea.** The page now reads as a small studio's printed manual for a small instrument, not as a SaaS landing page: a running head, a numbered contents rail, spreads that alternate paper and ink, chapter numbers, margin notes, and a colophon. The humour and the restraint both come from the same place — the idea that someone sat down and set this by hand.

**What changed structurally.**
- **Contents rail** on viewports ≥ 1560 px: fifteen numbered entries, `position: fixed` in the left gutter, `aria-current` tracking the section in view via IntersectionObserver (progressive enhancement only). Hidden below the fold width; the page is complete and navigable without it.
- **Section numbers** set as large Fraunces italics (`.sec-no`, 01–14) in the top-right of every band — chapter furniture instead of another identical eyebrow label. Decorative and `aria-hidden`.
- **Why Acoustic** is no longer three equal cards: it is three numbered chapters (roman numerals i/ii/iii), staggered, with dotted rules.
- **What's in it** lost the four big cards and gained a **contents page**: a ledger of 59 / 17 / ∞ / You with dotted leaders and small tags (`recordings / music / generated / choices`). The interactive shelf index and the measured spectrum panel were kept and refined; the cards were the regular part.
- **A day with Acoustic is now a full-bleed ink spread** — navy deep background, cream text, the manifesto as the spread's pull quote.
- **Fine print is wrapped as a single document** (`.fineprint-wrap`) with a striped top rule, like a printed terms sheet, instead of two floating cards.
- **Footer is now a real imprint**: centred logo mark, the word set large, a small-caps line, then the colophon in three columns (type credits, "In this manual" with numbered entries, contact) and a single signature rule.
- **Nav** is a running head with a double rule and a subdued pill for v0.23.0; **the stripe under the hero** is the "running foot" of the cover.
- **Margin notes**: two, in Fraunces italic with a hand-drawn arrow, both about the honest parts of the page (the rig and the questions). Visible only at ≥ 1400 px.
- Old card-grid CSS (`.cards-3`, `.inside-grid`, `.inside-count`, etc.) was removed rather than left to rot.

**What did not change.** Every claim, every honest limitation, every interactive tool (picker, shelf index, blend shelf, spectrum panel, rig, ceiling curve, eight-band tilt, contents rail excepted which is new), every id and JS hook, the custom round cursor, the self-hosted fonts, the OFL credits, the no-INTERNET posture, and the rule that the page demonstrates shaping, not benefit.

**Verification run this session (host render only).**
- `node --check site.js` / `bench.js`: pass. `engine-smoke.mjs`: exit 0.
- HTML parse clean, 0 U+FFFD.
- `verify-v5.mjs` (all prior checks): FIG 54,010-byte data URL; rig playing; Café→Street `max 0.22`; 390 px overflow 0; 0 console/page errors.
- `verify-v9 / v10 / v12 / v13 / v6 / v8 / verify-rig`: all still green — 76 shelf rows, blend filters, spectrum orders, picker→shelf handoff (`Wind in the Trees` + `Mountain Stream  #7`), QA ledger 4 numbers, rig idle/playing/switch states.
- `verify-rail.mjs` (new): at 1600 px the rail renders (190 px, left 18 px), tracks `#fineprint` via `aria-current`, never overlaps any `.wrap`, and is `display:none` at 1366 px. The two margin notes do not overlap the h2 they sit beside. `.sec-no` renders above backgrounds on all palette sections.
- `sweep-widths.mjs`: 0 px overflow at 360–1600 px.
- `audit-v4.mjs`: unchanged — 2 text families + system mono, 14.41:1 body contrast, 3 greys, 7 shadow roles, radii distributed across pill / 20 px / 12 px / 50 %.
- Forbidden-claim scan: no positive dBA/ANC/medical/benefit wording anywhere (all hits are negations, column headers, or the disclaimer itself).

**Still unverified:** no phone, no listening, and — as ever this session — I cannot view the screenshots. The visual judgement call (whether this feels good) belongs to the maker; every mechanical signal I can measure is clean.

## 17. The Nullframe pass (2026-11-14)

The maker asked for the CSS techniques of `https://nullframe3d.vercel.app/` (fetched 2026-11-14, HTML + `css/style.css?v=37`). Reviewed honestly and applied as a *technique transfusion*, not a skin transplant.

**What their site does.** Dark `#050506` "specimen lab dossier": fixed full-screen canvas + SVG-`feTurbulence` film grain at ~5.5% opacity with a `steps(6)` animation, a radial vignette, a `position: fixed` mono 3-column header with backdrop blur, a right-edge dot-led section rail that labels on hover/active, big thin uppercase Inter titles, hairline (`rgba(255,255,255,.08)`) borders, corner reticle ticks on product shots, a left/right fixed HUD, a footer marquee of ghost type, `mix-blend-difference` cursor, `overflow-x: clip`, `100svh` hero.

**What was applied (mechanics, not identity).**
- `.grain` — the same feTurbulence noise as a fixed full-screen layer at **5% opacity**, `mix-blend-mode: overlay`, with the same `steps(6)` jitter; static under `prefers-reduced-motion: reduce`.
- `.vignette` — a soft radial edge vignette in warm dark `rgba(31,26,20,.22)` so the paper reads like a laid sheet, not a lit page.
- Corner reticle ticks on the hero phone plate, the three screenshot plates, Fig. 1 and the two marquee-adjacent panels — injected at runtime by JS (`[data-ticks]`), decorative and `aria-hidden`, so static HTML never carries dead markup.
- The contents rail was re-set as their dot-led rail: small mono labels in row-reverse, dot before each, active dot scales and glows terracotta. The rail still tracks `aria-current` via IntersectionObserver.
- `.sec-head` gained their hairline rule pattern (`border-top: 1px solid var(--line-strong)` + padding-top).
- **A fair use of their HUD**: `.hud-bl` shows a live scroll percentage of "percent of this manual"; `.hud-br` is a `TOP ↑` back link. Both hide below 900 px width and below 820 px height so they never sit on content.
- **An honest marquee** across the footer — "59 CC0 recordings — 17 public-domain works — one hard ceiling — no INTERNET permission — no account — no ads — free for testers —" — slow ghost serif, `aria-hidden`, static under reduced motion.
- The nav gained an `.is-scrolled` state toggled by scroll position.

**What was refused.** Their palette (`#050506`, cyan `#00f0ff`), their type (Inter light + JetBrains Mono), the 3D canvas hero, the "LIVE / SPECIMEN" sci-fi framing, the mixed-blend cursor (kept ours: navy dot + terracotta ring), the fake lab HUD copy, their marquee copy, and their `overflow-x: clip` (we keep `hidden`). Acoustic is a comfort tool in warm paper — a dark lab skin would have been a costume, not an instrument.

**Verification run this session (host render only).**
- `node --check site.js` / `bench.js`: pass. `engine-smoke.mjs`: exit 0.
- HTML parse clean, 0 U+FFFD.
- `verify-v5.mjs`: FIG 54,010-byte data URL; rig playing; 0 px mobile overflow; 0 console/page errors.
- `verify-rig / v6 / v8 / v9 / v10 / v12 / v13 / verify-rail / verify-hud`: all green — rig states, blend shelf, QA ledger, shelf index, spectrum, picker→shelf handoff, rail tracks aria-current, HUD hidden at 750 px height and present at 900 px, 24 corner ticks injected, marquee renders and is static under reduced motion.
- `sweep-fast.mjs` (new, ignores fixed overlays as overflows cannot scroll): 0 px overflow at 360, 390, 768, 1280, 1600 px. The marquee track is intentionally wider than the viewport but is inside `.marquee { overflow: hidden }`, confirmed 0.
- Marquee track and grain never affect `scrollWidth` (verified).
- `audit-v4.mjs`: unchanged — 2 text families + system mono, 14.41:1 body contrast, 3 greys, 7 shadow roles, 12 button variants.
- Forbidden-claim scan: no positive dBA/ANC/medical/benefit wording (all remaining hits are the negations/disclaimers and column headers).

**Still unverified:** no phone, no listening; and while I *can* view images (the fold shot was reviewed — see `%TEMP%\opencode\nullframe-fold2.png` and `v3-mobile.png`/`v3-full.png`), the full-length page reads as one thumbnail; fine detail beyond the fold deserves your eyes. One fair caveat: at the 1280 px fold the HUD pills sit over the bottom edge of the hero strip on shorter windows — mitigated by hiding them under 820 px height; shorter laptops will not see them.

## What we deliberately did not do

- No dark pattern for attention (no countdowns, no fake scarcity), no fake testimonials, no generated people.
- No claim we can't defend: no dBA numbers, no ANC, no medical claims, no "AI-powered" adjective anywhere.
- No symmetric grid of equal cards. No purple gradient. No Inter/Manrope/Plus Jakarta. No hero-metric block.
- No "trusted by N companies" (there are no companies yet â€” there is one maker and a phone on a desk).

## Known limits of this research

Live web search was bot-walled on DuckDuckGo (twice) and effectively useless on Bing in this environment, and several design sites refuse non-JS crawlers (Apple HIG is JS-gated; Smashing's search returns zero hits for "AI"/"vibe"; uxdesign.cc and The Verge 403; A List Apart 404 on guessed tag URLs). Sources above are the ones actually read this session, including archive.org captures.
