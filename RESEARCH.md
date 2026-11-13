# Making a website feel human — the research behind this page

Sources actually read while building this site (fetched 2026-11-14; Apple HIG and A List search endpoints were JS-gated or 404, noted for honesty). Findings are mapped to the decisions taken in `index.html` / `styles.css`.

## 1. Wikipedia — "AI slop" (https://en.wikipedia.org/wiki/AI_slop)

Key findings:
- Kommers et al. ("Why Slop Matters", *ACM AI Letters*, Jan 2026): AI slop has three prototypical   properties — **superficial competence**, **asymmetric effort**, **mass producibility**.
- Jonathan Gilmore (CUNY): AI slop has an *"incredibly banal, realistic style"* — it processes easily,   says nothing.
- 2025 Merriam-Webster / American Dialect Society Word of the Year: **slop** (pejorative for   low-quality AI content). Backlash culture demands authenticity signals.

Applied here:
- No "superficial competence" as the goal: the page shows costly specifics (exact library counts, exact   cadence numbers, the real APK version, the real commit history, a named human author + plain email).
- "Asymmetric effort" visible: a hand-built WebAssembly bench wired to the actual DSP core — not   achievable by pressing Tab-Tab three times.
- Mass-producibility removed: no card grid, no icon trio, no symmetric hero; the ledger numbers are   staggered, the columns are uneven, nothing about the page could stamp out 500 siblings.

## 2. Wikipedia — "Vibe coding" (https://en.wikipedia.org/wiki/Vibe_coding)

Key findings:
- Karpathy (Feb 2025) coined it: *"fully give in to the vibes, embrace exponentials, and forget that   the code even exists."* Criticism sections document: AI code shows ~1.7x more major issues   (CodeRabbit, 470 PRs) and the METR RCT found experienced devs were **19% slower** while believing   they were 24% faster — the perception gap. Karpathy floats it as throwaway-weekend-project material, not production.
- The failure mode is **unaudited acceptance** — "accept all, read nothing."

Applied here:
- Everything on this page is auditable: one HTML file, two small scripts, one stylesheet — view-sourceable   end to end. The engine bench is reproducible from source (`engine/build-wasm.ps1`) and smoke-testable   (`engine-smoke.mjs`). The colophon invites inspection instead of asking for trust.

## 3. Simon Willison — "Slop is the new name for unwanted AI-generated content" (https://simonwillison.net/2024/May/8/slop/, 8 May 2024)

Key findings:
- Slop = content *"mindlessly generated and thrust upon someone who didn't ask for it."*
- His personal bar: *"I attach my name and stake my credibility on the things that I publish."*

Applied here:
- Nothing on this page is forced: no autoplay, no sound until the visitor presses the button, no   prefilled email, no modal. The only "audio" is opt-in, ~95 KB, one-way.
- His credibility bar: the colophon names the maker and a working email; the FAQ admits what the app   is *not* (cancellation, hearing protection, medical treatment). Credibility > coverage.

## 4. Nielsen Norman Group — AI topic listing (https://www.nngroup.com/articles/?topic=artificial-intelligence)

Key findings (from the fetched article index, Nov 2026):
- NN/g treats AI-speed development as a **measurement** problem: *"Research can define what each release   must measure"* — not a speed problem. Their AI-era articles (e.g. "Liquid Glass… obscures content")   argue visual languages fail when they serve the maker's delight instead of the reader's content.
- Their standing heuristics (visibility of system status, match to the real world, aesthetic and   minimalist design) remain applicable regardless of who wrote the code.

Applied here:
- The bench console shows real system status (`fetching → engine live → playing`), never a fake spinner.
- The interface defers to content: black-and-white type, no decorative chrome competing with words,   Stop stays one thumb away in the app — and on the page, the Play/Stop control is the only accented UI.

## 5. "Your AI Slop Bores Me" (https://youraislopboresme.com/, via Internet Archive 2026-03-09)

Key findings:
- The phrase that started a movement — the cultural signal is fatigue with *polished, unattributed* output;   people crave evidence of a person behind the artifact.
- "Humans make mistakes because that's what makes us human" — the meme valorises specificity over slickness.

Applied here:
- Deliberate human texture: real screenshots with real room names ("Mountain refuge"), a breathing canvas   instead of a stock hero image, an email address in three places, and honest limitations printed in body copy.

## What we deliberately did not do

- No dark pattern for attention (no countdowns, no fake scarcity), no fake testimonials, no generated people.
- No claim we can't defend: no dBA numbers, no ANC, no medical claims, no "AI-powered" adjective anywhere.
- No symmetric grid of equal cards. No purple gradient. No Inter/Manrope/Plus Jakarta. No hero-metric block.
- No "trusted by N companies" (there are no companies yet — there is one maker and a phone on a desk).

## Known limits of this research

Live web search was bot-walled on DuckDuckGo (twice) and effectively useless on Bing in this environment, and several design sites refuse non-JS crawlers (Apple HIG is JS-gated; Smashing's search returns zero hits for "AI"/"vibe"; uxdesign.cc and The Verge 403; A List Apart 404 on guessed tag URLs). Sources above are the ones actually read this session, including archive.org captures.
