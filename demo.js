/* Acoustic — coloured noise demo.
   A small Web Audio approximation of the app's coloured-noise behaviour.
   Runs entirely in the browser; nothing is uploaded or stored. */
(() => {
  "use strict";

  const BUFFER_SECONDS = 4;
  const colours = {};
  let context = null;
  let source = null;
  let gain = null;
  let analyser = null;
  let currentColour = "white";
  let playing = false;
  let meterFrame = 0;

  const toggle = document.getElementById("demoToggle");
  const status = document.getElementById("demoStatus");
  const volume = document.getElementById("demoVolume");
  const volumeValue = document.getElementById("demoVolumeValue");
  const meterCanvas = document.getElementById("demoMeter");
  const meter = meterCanvas ? meterCanvas.getContext("2d") : null;
  const colourButtons = Array.from(document.querySelectorAll(".noise-btn"));

  function fillColour(colour, data, sampleRate) {
    const length = data.length;
    if (colour === "white") {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      return;
    }
    if (colour === "pink") { // Paul Kellet approximation
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.17;
      }
      return;
    }
    // brown: leaky integrator, emphasises low end
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }

  function normalise(data, ceiling) {
    let peak = 0;
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const scale = peak > 0 ? (ceiling / peak) : 1;
    for (let i = 0; i < data.length; i++) data[i] *= scale;
  }

  function bufferFor(colour) {
    if (colours[colour]) return colours[colour];
    const ctx = ensureContext();
    const frames = Math.floor(BUFFER_SECONDS * ctx.sampleRate);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    fillColour(colour, data, ctx.sampleRate);
    normalise(data, colour === "brown" ? 0.6 : 0.5);
    colours[colour] = buffer;
    return buffer;
  }

  function ensureContext() {
    if (!context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      context = new AudioContextCtor();
      gain = context.createGain();
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.connect(analyser);
      analyser.connect(context.destination);
    }
    return context;
  }

  function perceptual(value) {
    const t = Math.max(0, Math.min(1, value / 100));
    return t * t * 0.9; // squared curve keeps slider fine at low levels
  }

  function drawMeter() {
    meterFrame = requestAnimationFrame(drawMeter);
    if (!meter) return;
    const { width, height } = meterCanvas;
    meter.clearRect(0, 0, width, height);
    meter.fillStyle = "#10151F";
    meter.fillRect(0, 0, width, height);
    if (!playing || !analyser) {
      meter.strokeStyle = "rgba(244,241,239,0.25)";
      meter.lineWidth = 1.5;
      meter.beginPath();
      meter.moveTo(0, height / 2);
      meter.lineTo(width, height / 2);
      meter.stroke();
      return;
    }
    const bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    const barWidth = 3;
    const gap = 1.5;
    const count = Math.floor(width / (barWidth + gap));
    const step = Math.max(1, Math.floor((bins.length * 0.72) / count));
    for (let i = 0; i < count; i++) {
      const v = bins[Math.min(bins.length - 1, Math.floor(i * step))] / 255;
      const barHeight = Math.max(2, v * (height - 8));
      const x = i * (barWidth + gap);
      const y = (height - barHeight) / 2;
      meter.fillStyle = v > 0.66 ? "rgba(255,255,255,0.95)" : "rgba(214,234,223,0.75)";
      meter.fillRect(x, y, barWidth, barHeight);
    }
  }

  function startSource() {
    const ctx = ensureContext();
    if (!ctx) { status.textContent = "Web Audio is not available in this browser"; return; }
    if (ctx.state === "suspended") ctx.resume();
    source = ctx.createBufferSource();
    source.buffer = bufferFor(currentColour);
    source.loop = true;
    source.connect(gain);
    source.start();
    const target = perceptual(Number(volume.value));
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(target, ctx.currentTime, 0.15); // gentle fade-in, no clicks
    playing = true;
    toggle.textContent = "Stop";
    toggle.setAttribute("aria-pressed", "true");
    status.textContent = `Playing ${currentColour} noise — not the app's native engine`;
  }

  function stopSource(fade = 0.25) {
    const ctx = context;
    if (!ctx) return;
    const done = () => {
      if (source) { try { source.stop(); } catch (_) {} source.disconnect(); source = null; }
    };
    if (gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
      window.setTimeout(done, fade * 1000 + 60);
    } else {
      done();
    }
    playing = false;
    toggle.textContent = "Play";
    toggle.setAttribute("aria-pressed", "false");
    status.textContent = "Stopped";
  }

  function swapSource() {
    if (!context) return;
    const ctx = context;
    const target = perceptual(Number(volume.value));
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    window.setTimeout(() => {
      if (source) { try { source.stop(); } catch (_) {} source.disconnect(); source = null; }
      source = ctx.createBufferSource();
      source.buffer = bufferFor(currentColour);
      source.loop = true;
      source.connect(gain);
      source.start();
      gain.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
      status.textContent = `Playing ${currentColour} noise — not the app's native engine`;
    }, 140);
  }

  colourButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentColour = button.dataset.colour;
      colourButtons.forEach((b) => b.classList.toggle("is-active", b === button));
      if (playing) swapSource();
    });
  });

  volume.addEventListener("input", () => {
    volumeValue.textContent = `${volume.value}%`;
    if (context && gain && playing) {
      gain.gain.setTargetAtTime(perceptual(Number(volume.value)), context.currentTime, 0.05);
    }
  });

  toggle.addEventListener("click", () => {
    if (playing) stopSource(0.3); else startSource();
  });

  // Stop audio if the page is hidden for a long time or unloaded — polite to the listener.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stopSource(0.2);
  });
  window.addEventListener("pagehide", () => { if (playing) stopSource(0.1); });

  drawMeter();
})();
