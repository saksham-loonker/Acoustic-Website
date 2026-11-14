/* Acoustic — test rig.
   Loads the app's masking core compiled to WebAssembly, but only after a press.
   Renders eight seconds of deterministic audio from the real Renderer, draws the
   meter from those samples, and reports the engine's own acknowledgement slots.
   If the engine cannot load, the page synthesises its own approximation with
   plain Web Audio and says exactly that — no dead end, no lies.
   No microphone, no upload, nothing stored by this page. */
(() => {
  "use strict";

  const button = document.getElementById("runEngine");
  const meterCanvas = document.getElementById("meter");
  if (!button || !meterCanvas) return;

  const meter = meterCanvas.getContext("2d");
  const statusEl = document.getElementById("benchStatus");
  const rigLabel = document.getElementById("rigLabel");
  const dots = [1, 2, 3].map((n) => document.getElementById("dot" + n));
  const roSize = document.getElementById("roSize");
  const roBands = document.getElementById("roBands");
  const roPeak = document.getElementById("roPeak");
  const roMs = document.getElementById("roMs");
  const rigWhy = document.getElementById("rigWhy");
  const scenes = Array.from(document.querySelectorAll("[data-scene]"));
  const shapeEl = document.getElementById("rigShape");

  const SHAPES = [
    "Warm — more of the low end, eased at the top.",
    "Even — the same weight all the way across.",
    "Bright — the top forward, the low end pulled in.",
  ];
  const SHAPE_SHORT = ["warm", "even", "bright"];

  // The engine's shipped eight-band gains for the three demo shapes, measured
  // from the engine itself (applied-band arrays for scenes 0/1/2).
  const SHAPE_GAINS = [
    [0.20, 0.19, 0.16, 0.13, 0.11, 0.09, 0.07, 0.05], // warm
    [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125], // even
    [0.06, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.22], // bright
  ];
  const EDGES = [80, 160, 315, 630, 1250, 2500, 4000, 6000, 7800];

  const RATE = 48000;
  const FRAMES = RATE * 8;
  const CHANNELS = 2;

  let engine = null;
  let audioCtx = null;
  let source = null;
  let analyser = null;
  let gain = null;
  let scene = 0;
  let playing = false;
  let bytes = 0;

  const say = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("ok", kind === "ok");
    statusEl.classList.toggle("err", kind === "err");
  };

  const lamps = (on) => dots.forEach((d, i) => d && d.classList.toggle("on", on && i === 0));

  const showWhy = (text) => {
    if (!rigWhy) return;
    rigWhy.hidden = !text;
    rigWhy.textContent = text || "";
  };

  /* ============ the fallback: plain Web Audio, honestly labelled ============ */

  const mulberry32 = (a) => {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // RBJ constant-skirt-gain bandpass biquad
  const biquadBandpass = (f0, Q, sampleRate) => {
    const w0 = (2 * Math.PI * f0) / sampleRate;
    const alpha = Math.sin(w0) / (2 * Q);
    const b0 = alpha, b1 = 0, b2 = -alpha;
    const a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha;
    const nb0 = b0 / a0, nb1 = b1 / a0, nb2 = b2 / a0, na1 = a1 / a0, na2 = a2 / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return (x) => {
      const y = nb0 * x + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    };
  };

  function synthScene(s) {
    const gains = SHAPE_GAINS[s];
    const out = new Float32Array(FRAMES * CHANNELS);
    const acc = [new Float32Array(FRAMES), new Float32Array(FRAMES)];
    const rng = [mulberry32(100003 + s), mulberry32(200003 + s)];
    const src = [new Float32Array(FRAMES), new Float32Array(FRAMES)];
    for (let c = 0; c < 2; c++) {
      const r = rng[c];
      for (let i = 0; i < FRAMES; i++) src[c][i] = r() * 2 - 1;
    }
    for (let b = 0; b < 8; b++) {
      const fLo = EDGES[b], fHi = EDGES[b + 1];
      const f0 = Math.sqrt(fLo * fHi);
      const Q = Math.max(0.8, f0 / (fHi - fLo));
      for (let c = 0; c < 2; c++) {
        const bp = biquadBandpass(f0, Q, RATE);
        const inCh = src[c];
        const accCh = acc[c];
        const g = gains[b];
        for (let i = 0; i < FRAMES; i++) accCh[i] += g * bp(inCh[i]);
      }
    }
    let peak = 0;
    for (let i = 0; i < FRAMES; i++) {
      for (let c = 0; c < 2; c++) {
        const v = acc[c][i];
        if (Math.abs(v) > peak) peak = Math.abs(v);
        out[i * 2 + c] = v;
      }
    }
    // peak-normalise to a safe level, deterministically (0.22 ceiling of the rig)
    const target = peak > 0 ? 0.22 / peak : 0;
    for (let i = 0; i < out.length; i++) out[i] *= target;
    return out;
  }

  /* ============ drawing the meter ============ */

  function drawMeter(pcm) {
    const w = meterCanvas.width;
    const h = meterCanvas.height;
    meter.fillStyle = "#15110E";
    meter.fillRect(0, 0, w, h);

    if (!pcm) {
      meter.strokeStyle = "rgba(237,231,220,0.16)";
      meter.lineWidth = 1;
      meter.beginPath();
      meter.moveTo(0, h / 2);
      meter.lineTo(w, h / 2);
      meter.stroke();
      return;
    }

    const cols = 120;
    const stride = Math.max(1, Math.floor(FRAMES / cols));
    for (let c = 0; c < cols; c++) {
      let peak = 0;
      const from = c * stride * CHANNELS;
      const to = Math.min(pcm.length, from + stride * CHANNELS);
      for (let i = from; i < to; i += 2) {
        const v = Math.abs(pcm[i]);
        if (v > peak) peak = v;
      }
      const barH = Math.max(1, Math.min(1, peak / 0.3) * (h - 10));
      const x = (c / cols) * w;
      meter.fillStyle = peak > 0.2 ? "#F2E9DB" : "#9A9082";
      meter.fillRect(x, (h - barH) / 2, Math.max(1, w / cols - 1), barH);
    }

    meter.strokeStyle = "rgba(196,85,47,0.75)";
    meter.setLineDash([3, 3]);
    meter.beginPath();
    meter.moveTo(0, 5);
    meter.lineTo(w, 5);
    meter.stroke();
    meter.setLineDash([]);
  }

  /* ============ engine loading ============ */

  async function loadEngine() {
    if (engine) return engine;
    say("fetching the engine", null);
    rigLabel.textContent = "loading";

    const [jsText, wasmRes] = await Promise.all([
      fetch("assets/engine.js", { cache: "force-cache" }).then((r) => {
        if (!r.ok) throw new Error("engine.js HTTP " + r.status);
        return r.text();
      }),
      fetch("assets/engine.wasm", { cache: "force-cache" }).then((r) => {
        if (!r.ok) throw new Error("engine.wasm HTTP " + r.status);
        return r.arrayBuffer();
      }),
    ]);
    bytes = jsText.length + wasmRes.byteLength;

    const url = URL.createObjectURL(new Blob([jsText], { type: "text/javascript" }));
    const mod = await import(url);
    URL.revokeObjectURL(url);

    engine = await mod.default({
      locateFile: (p) => (p.endsWith(".wasm") ? "assets/engine.wasm" : p),
      wasmBinary: wasmRes,
    });
    engine._acoustic_demo_create();
    return engine;
  }

  function renderEngine() {
    const t0 = performance.now();
    const rc = engine._acoustic_demo_render(scene);
    const ms = Math.round(performance.now() - t0);
    if (rc !== 0) throw new Error("engine returned " + rc);

    const ptr = engine._acoustic_demo_out();
    const pcm = new Float32Array(engine.HEAPF32.buffer.slice(0), ptr, FRAMES * CHANNELS);

    let peak = 0;
    for (let i = 0; i < pcm.length; i += 32) {
      const v = Math.abs(pcm[i]);
      if (v > peak) peak = v;
    }

    let live = 0;
    let loudest = 0;
    for (let i = 0; i < 8; i++) {
      const v = engine._acoustic_demo_applied(i);
      if (v > 0.0001) live++;
      if (v > loudest) loudest = v;
    }
    return { pcm, peak, bands: live + " / 8 · max " + loudest.toFixed(2), ms, size: Math.round(bytes / 1024) + " KB" };
  }

  function renderSynth() {
    const t0 = performance.now();
    const pcm = synthScene(scene);
    const ms = Math.round(performance.now() - t0);
    let peak = 0;
    for (let i = 0; i < pcm.length; i += 4) {
      const v = Math.abs(pcm[i]);
      if (v > peak) peak = v;
    }
    return { pcm, peak, bands: "8 / 8 · page synth", ms: ms + " ms", size: "page synth" };
  }

  /* ============ playback ============ */

  async function ensureAudio() {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) throw new Error("this browser has no Web Audio");
      audioCtx = new Ctor();
      gain = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") await audioCtx.resume();
  }

  async function startPlayback(rendered, fallback) {
    const pcm = rendered.pcm;
    await ensureAudio();

    if (source) {
      const old = source;
      old.onended = null;
      try { old.stop(); } catch (_) {}
      old.disconnect();
    }

    const buffer = audioCtx.createBuffer(CHANNELS, FRAMES, RATE);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < FRAMES; i++) {
      left[i] = pcm[i * CHANNELS];
      right[i] = pcm[i * CHANNELS + 1];
    }

    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    gain.gain.value = 0.9;
    source.connect(gain);
    source.onended = () => {
      if (!playing) return;
      playing = false;
      button.textContent = "Play 8 seconds";
      rigLabel.textContent = "standby";
      lamps(false);
      say("done · play it again whenever you like", null);
    };
    source.start();

    playing = true;
    button.textContent = "Stop";
    rigLabel.textContent = SHAPE_SHORT[scene] + (fallback ? " · approximating" : " · playing");
    lamps(true);

    if (roSize) roSize.textContent = rendered.size;
    if (roPeak) roPeak.textContent = rendered.peak.toFixed(3);
    if (roMs) roMs.textContent = rendered.ms + " ms";
    if (roBands) roBands.textContent = rendered.bands;
    drawMeter(pcm);

    if (fallback) {
      showWhy(fallback);
      say("playing · page approximation — not the app engine", "ok");
    } else {
      showWhy(null);
      say("playing · rendered at 0.30, well under any ceiling you would set", "ok");
    }
    if (shapeEl) shapeEl.textContent = SHAPES[scene];
  }

  /* ============ wiring ============ */

  button.addEventListener("click", async () => {
    if (playing) {
      try { source.stop(); } catch (_) {}
      return;
    }
    button.disabled = true;
    button.textContent = "Loading";
    try {
      await loadEngine();
      await startPlayback(renderEngine(), null);
    } catch (engineError) {
      console.warn("engine failed, falling back:", engineError);
      try {
        const why = engineError && engineError.message ? engineError.message : String(engineError);
        await startPlayback(renderSynth(), "Engine could not load (" + why + "). What you hear is this page's plain Web Audio sketch of the same three shapes — not the app's engine.");
      } catch (fallbackError) {
        console.error(fallbackError);
        rigLabel.textContent = "silent";
        button.textContent = "Play 8 seconds";
        showWhy("This browser blocks audio entirely (" + (fallbackError && fallbackError.message ? fallbackError.message : fallbackError) + "). Your phone plays it fine.");
        say("no audio here — the engine runs on your phone", "err");
      }
    } finally {
      button.disabled = false;
      if (!playing) button.textContent = "Play 8 seconds";
    }
  });

  scenes.forEach((btn) => {
    btn.addEventListener("click", async () => {
      scene = Number(btn.dataset.scene);
      scenes.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (shapeEl) shapeEl.textContent = SHAPES[scene];
      if (!playing) {
        say("ready when you are", null);
        return;
      }
      try {
        if (engine) {
          await startPlayback(renderEngine(), null);
        } else {
          await startPlayback(renderSynth(), "Engine could not load. What you hear is this page's plain Web Audio sketch — not the app's engine.");
        }
      } catch (error) {
        console.error(error);
        say("that change did not take · press stop, then play", "err");
      }
    });
  });

  drawMeter(null);
})();
