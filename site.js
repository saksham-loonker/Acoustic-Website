/* Acoustic — the round cursor and Fig. 1.
   The cursor is a small navy dot with a terracotta ring: present only on
   precise pointers with motion allowed, and it never blocks clicks.
   Fig. 1 plots the shipped eight-band layout (band edges from the engine
   source); the curve is a raised-cosine schematic, not a measurement. */
(() => {
  "use strict";

  const fine = window.matchMedia("(pointer: fine)").matches;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- custom round cursor ---------- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (fine && !calm && dot && ring) {
    document.documentElement.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const hot = "a, button, summary, input, [data-scene], .rig-row button";
    document.addEventListener("mouseover", (e) => {
      ring.classList.toggle("is-active", Boolean(e.target.closest(hot)));
    });

    const step = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- compat checker ---------- */
  const form = document.getElementById("compatForm");
  const result = document.getElementById("compatResult");
  if (form && result) {
    const verSelect = form.querySelector("select");
    const answers = {
      below10: ["no", "This one is a shame: Acoustic needs Android 10 (API 29) or newer, and your phone tops out before that. The install would install but refuse to run — no point sending you the build."],
      "10": ["ok", "Yes — Android 10 is the floor, and it is exactly the build we test against most. Email with the subject Acoustic try-out and you'll usually hear back within a day or two."],
      "11": ["ok", "Yes — Android 11 runs it cleanly. Email sakshamloonker@gmail.com with the subject Acoustic try-out."],
      "12": ["ok", "Yes — Android 12 and 12L are both fully supported (API 31–32). Email for a testing build."],
      "13": ["ok", "Yes — Android 13 is supported, 64-bit only (arm64-v8a). Email sakshamloonker@gmail.com with the subject Acoustic try-out."],
      "14": ["ok", "Yes — Android 14 (API 34) is our main test target. Email for a build and you'll be running in minutes."],
      "15": ["ok", "Yes — Android 15 is supported. Email with the subject Acoustic try-out and mention your model."],
      "16": ["ok", "Yes — Android 16 (API 36) is supported. Email for a testing build; if anything misbehaves on the new platform, we want to know."],
    };
    form.addEventListener("submit", (e) => e.preventDefault());
    verSelect.addEventListener("change", () => {
      const a = answers[verSelect.value];
      if (!a) { result.textContent = ""; result.className = "compat-result"; return; }
      result.textContent = (a[0] === "ok" ? "Good news: " : "Straight answer: ") + a[1];
      result.className = "compat-result " + a[0];
    });
  }

  /* ---------- Fig. 1: the shipped eight-band layout ---------- */
  const canvas = document.getElementById("figBands");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const EDGES = [80, 160, 315, 630, 1250, 2500, 4000, 6000, 7800];
  const F_MIN = 40;
  const F_MAX = 16000;
  const PAD = { top: 18, right: 14, bottom: 30, left: 40 };

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
    ctx.strokeStyle = "rgba(38,33,28,0.07)";
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
    ctx.fillStyle = "rgba(196,85,47,0.13)";
    ctx.fill();

    // response outline
    ctx.beginPath();
    for (let px = 0; px <= plotW; px += 1) {
      const y = yOf(responseAt(hzAt(px)) * 0.9);
      if (px === 0) ctx.moveTo(PAD.left + px, y); else ctx.lineTo(PAD.left + px, y);
    }
    ctx.strokeStyle = "#C4552F";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // baseline
    ctx.strokeStyle = "rgba(38,33,28,0.35)";
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
      ctx.fillStyle = "rgba(0,35,64,0.8)";
      ctx.fillText(String(i + 1), xOf(mid), PAD.top + 2);
    }

    // edge ticks with labels below the axis
    ctx.textBaseline = "top";
    for (let i = 0; i < EDGES.length; i++) {
      const x = xOf(EDGES[i]);
      ctx.strokeStyle = "rgba(38,33,28,0.5)";
      ctx.beginPath();
      ctx.moveTo(x, yOf(0));
      ctx.lineTo(x, yOf(0) + 5);
      ctx.stroke();

      ctx.save();
      ctx.translate(x, yOf(0) + 8);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#57534B";
      ctx.font = mono(9);
      ctx.fillText(EDGES[i] >= 1000 ? EDGES[i] / 1000 + "k" : String(EDGES[i]), 0, 0);
      ctx.restore();
    }

    // axis captions
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = mono(9);
    ctx.fillStyle = "#57534B";
    ctx.fillText("Hz →", PAD.left, PAD.top + plotH + 14);
    ctx.textAlign = "right";
    ctx.fillText("relative energy ↑", PAD.left + plotW, PAD.top + plotH + 14);
  }

  draw();
})();
