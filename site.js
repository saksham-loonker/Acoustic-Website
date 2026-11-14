/* Acoustic — fig. 1: the shipped eight-band layout, plotted.
   Band edges are the real constants from the engine (Config::edges in
   audio/include/acoustic/dsp.h). The curve between edges is a schematic
   raised-cosine, not a measurement of any room, device or ear. */
(() => {
  "use strict";

  const canvas = document.getElementById("figBands");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const EDGES = [80, 160, 315, 630, 1250, 2500, 4000, 6000, 7800];
  const F_MIN = 40;
  const F_MAX = 16000;
  const PAD = { top: 20, right: 16, bottom: 30, left: 40 };

  const W = canvas.width;
  const H = canvas.height;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const xOf = (hz) => PAD.left + (Math.log(hz / F_MIN) / Math.log(F_MAX / F_MIN)) * plotW;
  const yOf = (v) => PAD.top + (1 - v) * plotH;
  const hzAt = (px) => F_MIN * Math.pow(F_MAX / F_MIN, px / plotW);

  function responseAt(hz) {
    for (let i = 0; i < EDGES.length - 1; i++) {
      const lo = EDGES[i];
      const hi = EDGES[i + 1];
      if (hz >= lo && hz <= hi) {
        const t = (Math.log(hz / lo) / Math.log(hi / lo)) * Math.PI;
        return Math.pow(Math.sin(t), 0.65);
      }
    }
    return 0;
  }

  const mono = (px) => `${px}px ui-monospace, "Cascadia Mono", Consolas, monospace`;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // horizontal guides at 25/50/75 % of full scale
    ctx.strokeStyle = "rgba(20,22,26,0.07)";
    ctx.lineWidth = 1;
    for (const v of [0.25, 0.5, 0.75]) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + plotW, y);
      ctx.stroke();
    }

    // response fill
    ctx.beginPath();
    ctx.moveTo(xOf(F_MIN), yOf(0));
    for (let px = 0; px <= plotW; px += 1) {
      ctx.lineTo(PAD.left + px, yOf(responseAt(hzAt(px)) * 0.9));
    }
    ctx.lineTo(xOf(F_MAX), yOf(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(0,35,64,0.09)";
    ctx.fill();

    // response outline
    ctx.beginPath();
    for (let px = 0; px <= plotW; px += 1) {
      const y = yOf(responseAt(hzAt(px)) * 0.9);
      if (px === 0) ctx.moveTo(PAD.left + px, y); else ctx.lineTo(PAD.left + px, y);
    }
    ctx.strokeStyle = "#002340";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // baseline
    ctx.strokeStyle = "rgba(20,22,26,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, yOf(0));
    ctx.lineTo(PAD.left + plotW, yOf(0));
    ctx.stroke();

    // band numbers at geometric centres
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = mono(10);
    for (let i = 0; i < EDGES.length - 1; i++) {
      const mid = Math.sqrt(EDGES[i] * EDGES[i + 1]);
      ctx.fillStyle = "rgba(0,35,64,0.75)";
      ctx.fillText(String(i + 1), xOf(mid), PAD.top + 2);
    }

    // edge ticks with labels below the axis
    ctx.textBaseline = "top";
    for (let i = 0; i < EDGES.length; i++) {
      const x = xOf(EDGES[i]);
      ctx.strokeStyle = "rgba(20,22,26,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, yOf(0));
      ctx.lineTo(x, yOf(0) + 5);
      ctx.stroke();

      ctx.save();
      ctx.translate(x, yOf(0) + 8);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#6A6F76";
      ctx.font = mono(9);
      ctx.fillText(EDGES[i] >= 1000 ? EDGES[i] / 1000 + "k" : String(EDGES[i]), 0, 0);
      ctx.restore();
    }

    // axis captions
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = mono(9);
    ctx.fillStyle = "#6A6F76";
    ctx.fillText("Hz \u2192", PAD.left, PAD.top + plotH + 14);
    ctx.textAlign = "right";
    ctx.fillText("relative energy \u2191", PAD.left + plotW, PAD.top + plotH + 14);
  }

  draw();
})();