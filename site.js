/* Acoustic — small print for a small page: scroll progress, the cursor, and the breathing figure. */
(() => {
  "use strict";

  /* ---------- scroll progress hairline ---------- */
  const progress = document.getElementById("progress");
  if (progress) {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
    };
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- custom cursor (precise pointers only, motion respected) ---------- */
  const fine = window.matchMedia("(pointer: fine)").matches;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !still) {
    document.body.classList.add("cursor-ready");
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    const ringLabel = document.createElement("span");
    ring.appendChild(ringLabel);
    document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("pointermove", (event) => {
      mx = event.clientX; my = event.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const labelled = (el) => el && el.closest && el.closest("[data-cursor]");
    document.addEventListener("pointerover", (event) => {
      const target = labelled(event.target);
      const interactive = target || (event.target.closest && event.target.closest("a, button, input, summary, label"));
      if (interactive) {
        ring.classList.add("grow");
        ringLabel.textContent = target ? target.getAttribute("data-cursor") : "";
      } else {
        ring.classList.remove("grow");
        ringLabel.textContent = "";
      }
    });
    document.addEventListener("pointerdown", () => ring.classList.add("press"));
    document.addEventListener("pointerup", () => ring.classList.remove("press"));
  }

  /* ---------- fig. 1: a breathing interference figure ---------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = canvas.width, H = canvas.height;

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const strokes = [
        { amp: 18, k: 0.021, speed: 0.00022, y: H * 0.36, alpha: 0.95, width: 2.1 },
        { amp: 11, k: 0.034, speed: 0.00031, y: H * 0.52, alpha: 0.6, width: 1.5 },
        { amp: 6.5, k: 0.052, speed: 0.00042, y: H * 0.66, alpha: 0.38, width: 1.1 },
      ];
      for (const s of strokes) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 35, 64, ${s.alpha})`;
        ctx.lineWidth = s.width;
        for (let x = 0; x <= W; x += 2) {
          const env = Math.sin((x / W) * Math.PI) ** 1.6; // soft edges, like a breath
          const y = s.y + Math.sin(x * s.k + t * s.speed * 1000) * s.amp * env
                          + Math.sin(x * s.k * 2.7 - t * s.speed * 630) * s.amp * 0.35 * env;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduced) requestAnimationFrame(draw);
    };
    draw(performance.now());
  }
})();
