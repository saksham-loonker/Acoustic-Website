/* Acoustic — test rig.
   Loads the app's masking core compiled to WebAssembly, but only after a press.
   Renders eight seconds of deterministic audio from the real Renderer, draws the
   meter from those samples, and reports the engine's own acknowledgement slots.
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
  const scenes = Array.from(document.querySelectorAll("[data-scene]"));
  const shapeEl = document.getElementById("rigShape");

  const SHAPES = [
    "Warm — more of the low end, eased at the top.",
    "Even — the same weight all the way across.",
    "Bright — the top forward, the low end pulled in.",
  ];
  const SHAPE_SHORT = ["warm", "even", "bright"];

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

    // Peak per column, from real samples.
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

    // ceiling guide at 0.3 (the rig's submission amplitude)
    const y = h - (0.3 / 0.3) * (h - 10) - 5;
    meter.strokeStyle = "rgba(196,85,47,0.75)";
    meter.setLineDash([3, 3]);
    meter.beginPath();
    meter.moveTo(0, 5);
    meter.lineTo(w, 5);
    meter.stroke();
    meter.setLineDash([]);
  }

  async function loadEngine() {
    if (engine) return engine;
    say("fetching the engine", null);
    rigLabel.textContent = "loading";

    const [jsText, wasmRes] = await Promise.all([
      fetch("assets/engine.js", { cache: "force-cache" }).then((r) => r.text()),
      fetch("assets/engine.wasm", { cache: "force-cache" }).then((r) => r.arrayBuffer()),
    ]);
    bytes = jsText.length + wasmRes.byteLength;
    if (roSize) roSize.textContent = Math.round(bytes / 1024) + " KB";

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

  async function render() {
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
    if (roPeak) roPeak.textContent = peak.toFixed(3);
    if (roMs) roMs.textContent = ms + " ms";

    let live = 0;
    let loudest = 0;
    for (let i = 0; i < 8; i++) {
      const v = engine._acoustic_demo_applied(i);
      if (v > 0.0001) live++;
      if (v > loudest) loudest = v;
    }
    if (roBands) roBands.textContent = live + " / 8 \u00b7 max " + loudest.toFixed(2);

    drawMeter(pcm);
    say("8 s shaped in " + ms + " ms", "ok");
    return pcm;
  }

  async function play() {
    const pcm = await render();

    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) throw new Error("no Web Audio");
      audioCtx = new Ctor();
      gain = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") await audioCtx.resume();

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
      say("done \u00b7 play it again whenever you like", null);
    };
    source.start();

    playing = true;
    button.textContent = "Stop";
    rigLabel.textContent = SHAPE_SHORT[scene] + " \u00b7 playing";
    if (shapeEl) shapeEl.textContent = SHAPES[scene];
    lamps(true);
    say("playing \u00b7 rendered at 0.30, well under any ceiling you would set", "ok");
  }

  button.addEventListener("click", async () => {
    if (playing) {
      try { source.stop(); } catch (_) {}
      return;
    }
    button.disabled = true;
    button.textContent = "Loading";
    try {
      await loadEngine();
      await play();
    } catch (error) {
      console.error(error);
      say("could not load \u2014 the engine runs on the phone", "err");
      rigLabel.textContent = "fault";
      button.textContent = "Play 8 seconds";
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
        await play();
      } catch (error) {
        console.error(error);
        say("that change did not take \u00b7 press stop, then play", "err");
      }
    });
  });

  drawMeter(null);
})();