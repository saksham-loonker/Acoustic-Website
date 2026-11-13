# The listening bench — how it was built

`assets/engine.js` and `assets/engine.wasm` are the production DSP core from the
Acoustic Android app, compiled to WebAssembly ahead of time. The website never runs
the app, never asks for the microphone, and stores nothing: it downloads about
95 KB of engine on the visitor's first press, renders deterministic audio from the
same C++ the phone runs, plays it, and discards it.

| Source (from the Acoustic repository) | Purpose |
| --- | --- |
| `audio/src/dsp.cpp` | The mask-shaping engine: target preparation, band filtering, guards |
| `audio/src/library.cpp` | Recording/filter helpers used by the engine |
| `engine/acoustic-wasm.cpp` | This repository's thin bench wrapper (presets, warm pass, exports) |

**Nothing Android-specific is compiled in.** Audio routing, capture, session logic,
permission flow and every guardrail remain on the phone.

## Rebuilding

1. Install emscripten 3.1.74 via emsdk.
2. From this repository root, pointing at a checkout of Acoustic:

   ```powershell
   powershell -File engine/build-wasm.ps1 -AcousticRepo C:\path\to\Acoustic
   ```

The output is `assets/engine.js` + `assets/engine.wasm`, fetched lazily by
`bench.js` only when the visitor presses **Run the engine**.

## Verifying provenance

The bench deliberately exposes only: create, render, out, frames, peak and the
per-layer applied acknowledgement. No recording, no microphone, no preference code,
no network. A browser's network panel shows exactly one fetch of each file on first
use; the demo works with the network unplugged afterwards.
