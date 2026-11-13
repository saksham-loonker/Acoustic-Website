/* Acoustic — the listening bench.
   Lazy-loads the app's DSP core compiled to WebAssembly (assets/engine.js + engine.wasm)
   on first press, renders deterministic audio from the real Renderer, and plays it.
   No microphone, no upload, nothing persisted on this page. */
(() => {
  "use strict";

  const button = document.getElementById("runEngine");
  const scenes = Array.from(document.querySelectorAll("[data-scene]"));
  const status = document.getElementById("benchStatus");
  const meterCanvas = document.getElementById("meter");
  const roApplied = document.getElementById("roApplied");
  const roPeak = document.getElementById("roPeak");
  const engineSize = document.getElementById("engineSize");
  if (!button || !meterCanvas) return;

  const meter = meterCanvas.getContext("2d");
  const FRAMES = 48000 * 8;
  const CHANNELS = 2;

  let engine = null;      // emscripten module
  let audioCtx = null;
  let source = null;
  let analyser = null;
  let currentScene = 0;
  let playing = false;
  let raf = 0;
  let loadBytes = 0;

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.classList.toggle("ok", kind === "ok");
    status.classList.toggle("err", kind === "err");
  };

  /* Draw the meter from the actual engine PCM — no synthetic "fake spectrum". */
  function drawMeter(pcm) {
    meter.clearRect(0, 0, meterCanvas.width, meterCanvas.height);
    meter.fillStyle = "#0B1019";
    meter.fillRect(0, 0, meterCanvas.width, meterCanvas.height);
    if (!pcm) {
      meter.fillStyle = "#232B3C";
      meter.font = "12px ui-monospace, Consolas, monospace";
      meter.textBaseline = "middle";
      meter.fillText("engine output renders here — real samples, not an animation", 14, meterCanvas.height / 2);
      return;
    }
    const bars = 96;
    const stride = Math.floor((pcm.length / CHANNELS) / bars);
    for (let i = 0; i < bars; i++) {
      let peak = 0;
      const from = i * stride * CHANNELS;
      for (let j = from; j < from + stride * CHANNELS; j += 2) {
        const v = Math.abs(pcm[j]) + Math.abs(pcm[j + 1]) * 0.35;
        if (v > peak) peak = v;
      }
      const h = Math.max(2, Math.min(1, peak * 1.6) * (meterCanvas.height - 14));
      const x = i * (meterCanvas.width / bars);
      meter.fillStyle = peak > 0.55 ? "#D8A35F" : "#8FB4A4";
      meter.fillRect(x, (meterCanvas.height - h) / 2, meterCanvas.width / bars - 1.5, h);
    }
  }

  function layerReadout() {
    if (!engine) return;
    let strongest = 0, strongestValue = -1;
    for (let i = 0; i < 8; i++) {
      const v = engine._acoustic_demo_applied(i);
      if (v > strongestValue) { strongestValue = v; strongest = i + 1; }
    }
    roApplied.textContent = `L${strongest} · ${strongestValue.toFixed(2)}`;
  }

  async function ensureEngine() {
    if (engine) return engine;
    setStatus("fetching the engine (~40 KB)…");
    const response = await fetch("assets/engine.js", { cache: "force-cache" });
    const jsText = await response.text();
    loadBytes += jsText.length;
    const wasmResponse = await fetch("assets/engine.wasm", { cache: "force-cache" });
    const wasmBytes = await wasmResponse.arrayBuffer();
    loadBytes += wasmBytes.byteLength;
    engineSize.textContent = String(Math.round(loadBytes / 1024));
    const url = URL.createObjectURL(new Blob([jsText], { type: "text/javascript" }));
    const mod = await import(url);
    URL.revokeObjectURL(url);
    // wasmBinary is already in memory — emscripten uses it directly, no second fetch.
    engine = await mod.default({
      locateFile: (path) => path.endsWith(".wasm") ? "assets/engine.wasm" : path,
      wasmBinary: wasmBytes,
    });
    engine._acoustic_demo_create();
    setStatus(`engine live — ${Math.round(loadBytes / 1024)} KB delivered, on demand`, "ok");
    return engine;
  }

  async function renderScene(scene) {
    const eng = await ensureEngine();
    const t0 = performance.now();
    const rc = eng._acoustic_demo_render(scene);
    const ms = Math.round(performance.now() - t0);
    if (rc !== 0) throw new Error("engine render failed (" + rc + ")");
    const ptr = eng._acoustic_demo_out();
    const pcm = new Float32Array(eng.HEAPF32.buffer, ptr, FRAMES * CHANNELS);
    const copy = new Float32Array(pcm); // own copy; engine buffer is reused
    let peak = 0;
    for (let i = 0; i < copy.length; i += 64) { const a = Math.abs(copy[i]); if (a > peak) peak = a; }
    roPeak.textContent = peak.toFixed(3);
    layerReadout();
    drawMeter(copy);
    setStatus(`rendered 8s in ${ms} ms — the same DSP the phone runs`, "ok");
    return copy;
  }

  async function play() {
    const pcm = await renderScene(currentScene);
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    if (source) { const old = source; old.onended = null; try { old.stop(); } catch (_) {} old.disconnect(); }
    source = audioCtx.createBufferSource();
    const buffer = audioCtx.createBuffer(CHANNELS, FRAMES, 48000);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < FRAMES; i++) { left[i] = pcm[i * CHANNELS]; right[i] = pcm[i * CHANNELS + 1]; }
    source.buffer = buffer;
    analyser = audioCtx.createAnalyser();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.9;
    source.connect(gain); gain.connect(analyser); analyser.connect(audioCtx.destination);
    source.onended = () => { playing = false; button.textContent = "Run the engine"; setStatus("stopped — press run to hear it again", null); cancelAnimationFrame(raf); };
    source.start();
    playing = true;
    button.textContent = "Stop";
    setStatus(`playing: ${["empty room", "café murmur", "busy street"][currentScene]} — ceiling respected`, "ok");
    drawMeter(pcm);
  }

  button.addEventListener("click", async () => {
    if (playing) { try { source.stop(); } catch (_) {} return; }
    button.disabled = true;
    try { await play(); }
    catch (error) {
      console.error(error);
      setStatus("engine unavailable in this build — the real thing is on your phone; email for a build", "err");
    } finally { button.disabled = false; }
  });

  scenes.forEach((btn) => btn.addEventListener("click", async () => {
    currentScene = Number(btn.dataset.scene);
    scenes.forEach((b) => b.classList.toggle("is-on", b === btn));
    if (!playing) return;
    try { await play(); }
    catch (error) { console.error(error); setStatus("scene switch failed — press Stop and run again", "err"); }
  }));

  drawMeter(null);
})();
