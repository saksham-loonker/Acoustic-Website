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

## What we deliberately did not do

- No dark pattern for attention (no countdowns, no fake scarcity), no fake testimonials, no generated people.
- No claim we can't defend: no dBA numbers, no ANC, no medical claims, no "AI-powered" adjective anywhere.
- No symmetric grid of equal cards. No purple gradient. No Inter/Manrope/Plus Jakarta. No hero-metric block.
- No "trusted by N companies" (there are no companies yet â€” there is one maker and a phone on a desk).

## Known limits of this research

Live web search was bot-walled on DuckDuckGo (twice) and effectively useless on Bing in this environment, and several design sites refuse non-JS crawlers (Apple HIG is JS-gated; Smashing's search returns zero hits for "AI"/"vibe"; uxdesign.cc and The Verge 403; A List Apart 404 on guessed tag URLs). Sources above are the ones actually read this session, including archive.org captures.
