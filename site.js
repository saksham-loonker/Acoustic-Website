/* Acoustic — the round cursor and Fig. 1.
   The cursor is a small navy dot with a terracotta ring: present only on
   precise pointers with motion allowed, and it never blocks clicks.
   Fig. 1 plots the shipped eight-band layout (band edges from the engine
   source); the curve is a raised-cosine schematic, not a measurement. */
(() => {
  "use strict";

  let findOnShelf = null;
  let showOnShelf = null;
  let renderPicker = null;

  /* ---------- the contents rail: which spread is open ---------- */
  const railLinks = document.querySelectorAll('.rail a[href^="#"]');
  if (railLinks.length && "IntersectionObserver" in window) {
    const byId = new Map();
    railLinks.forEach((a) => byId.set(a.getAttribute("href").slice(1), a));
    const current = { id: null };
    const mark = (id) => {
      if (current.id === id) return;
      current.id = id;
      railLinks.forEach((a) => {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best = null, bestR = 0;
        for (const [id, r] of seen) if (r > bestR) { bestR = r; best = id; }
        if (best) mark(best);
      },
      { threshold: [0, 0.15, 0.35, 0.6], rootMargin: "-18% 0px -30% 0px" }
    );
    byId.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

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

  /* ---------- start-sound picker ---------- */
  const picker = document.getElementById("startPicker");
  const pickerResult = document.getElementById("pickerResult");
  if (picker && pickerResult) {
      const answers = {
      water: {
        deep: ["Mountain refuge", "Streams & water — a steady mountain stream is the most even bed in the shelf. Start there."],
        read: ["Cave and stream", "Soft water, no syllables — room to think between the sentences."],
        sleep: ["Cave and stream", "Darker and slower than the open mountain; best company for pre-bed with the volume low."],
        comfort: ["Ocean with distant whales", "Slow weather, low detail — nothing here asks to be solved."],
      },
      voices: {
        deep: ["Colour noise", "Voice-free and steady — the best counter to café chatter while you work."],
        read: ["Soft fireside", "Low crackle, no syllables to accidentally follow."],
        sleep: ["Soft fireside, low", "A hearth without the pop and flare — whisper level only."],
        comfort: ["Colour noise or a café", "A shelf café at low presence, or colour noise if words keep pulling at you."],
      },
      street: {
        deep: ["Colour noise", "Deep and engine-shaped — it sits on street rumble like it belongs to it; the street becomes texture, not events."],
        read: ["Cave and stream", "Water you can keep behind the street — the ears take the stream and lose the engines."],
        sleep: ["Colour noise, low", "Thick enough for buses, quiet enough for sleep — set the volume limit before bed."],
        comfort: ["Mountain refuge", "Water you can put between yourself and the carriageway."],
      },
      quiet: {
        deep: ["Colour noise", "A silent house is full of details the mind chases — an even bed takes them all back."],
        read: ["Public-domain piano", "Reading and plain piano were made for each other."],
        sleep: ["Public-domain piano", "Softer each chapter — and set the volume limit at 4 p.m., midnight-you will thank you."],
        comfort: ["Public-domain piano", "The calmest thing we ship. Change it when you want rain."],
      },
    };
    const chosen = { room: null, task: null };
    const render = () => renderPickerBody();

    const renderPickerBody = () => {
      picker.querySelectorAll(".picker-opts").forEach((group) => {
        const q = group.dataset.q;
        group.querySelectorAll("button").forEach((btn) => {
          btn.setAttribute("aria-pressed", String(chosen[q] === btn.dataset.answer));
        });
      });
      if (!chosen.room || !chosen.task) {
        pickerResult.dataset.ready = "false";
        pickerResult.innerHTML = "<strong>Pick one from each row above — I'll point you somewhere sensible.</strong>";
        return;
      }
      const [title, body] = answers[chosen.room][chosen.task];
      const known = typeof findOnShelf === "function" && findOnShelf(title);
      const link = known
        ? ' <button type="button" class="picker-jump" data-jump="' + title + '">Find it in the shelf index below</button>'
        : "";
      pickerResult.dataset.ready = "true";
      pickerResult.innerHTML = "<strong>" + title + "</strong><span>" + body + link + "</span>";
    };
    pickerResult.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump]");
      if (!btn || typeof showOnShelf !== "function") return;
      showOnShelf(btn.dataset.jump);
      const shelf = document.getElementById("shelfList");
      if (shelf) {
        shelf.setAttribute("tabindex", "-1");
        shelf.focus({ preventScroll: true });
        shelf.scrollIntoView({ behavior: "auto", block: "center" });
      }
    });
    picker.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-answer]");
      if (!btn) return;
      const group = btn.closest(".picker-opts");
      chosen[group.dataset.q] = btn.dataset.answer;
      render();
    });
    renderPicker = render;
    renderPicker();
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

  /* ---------- where the energy sits (measured per file) ---------- */
  const SPECTRUM = {
    low: [
      { t: "Fridge", f: "mechanism", l: 0.988, m: 0.012, h: 0.001 },
      { t: "Parisian paved square, fountain", f: "fountain", l: 0.860, m: 0.114, h: 0.026 },
      { t: "Campaign at night  #1", f: "night", l: 0.652, m: 0.118, h: 0.230 },
      { t: "Metro, Paris  #2", f: "travel", l: 0.393, m: 0.569, h: 0.038 },
      { t: "Ventilation  #2", f: "mechanism", l: 0.367, m: 0.603, h: 0.030 },
      { t: "Forest", f: "forest", l: 0.307, m: 0.164, h: 0.529 },
      { t: "Evening in Gironde, France", f: "night", l: 0.303, m: 0.438, h: 0.259 },
      { t: "Fireplace  #4", f: "fire", l: 0.299, m: 0.408, h: 0.293 },
      { t: "Ventilation  #5", f: "mechanism", l: 0.272, m: 0.671, h: 0.057 },
      { t: "Car micheline", f: "travel", l: 0.253, m: 0.692, h: 0.055 }
    ],
    high: [
      { t: "Forest  #3", f: "forest", l: 0.000, m: 0.000, h: 1.000 },
      { t: "Field cricket", f: "insects", l: 0.000, m: 0.000, h: 1.000 },
      { t: "Singing insect  #1", f: "insects", l: 0.000, m: 0.000, h: 1.000 },
      { t: "Sun and Heat  #1", f: "insects", l: 0.000, m: 0.000, h: 1.000 },
      { t: "Forest with wind and birds", f: "forest", l: 0.000, m: 0.001, h: 0.999 },
      { t: "Woodland birdsong", f: "birds", l: 0.023, m: 0.014, h: 0.962 },
      { t: "Footstep in the Snow  #2", f: "materials", l: 0.004, m: 0.039, h: 0.956 },
      { t: "Cave atmosphere", f: "cave", l: 0.000, m: 0.053, h: 0.947 },
      { t: "Forest brook with blackbirds", f: "forest", l: 0.001, m: 0.086, h: 0.913 },
      { t: "Rain on concrete", f: "rain", l: 0.007, m: 0.085, h: 0.908 }
    ],
    even: [
      { t: "Fireplace  #4", f: "fire", l: 0.299, m: 0.408, h: 0.293 },
      { t: "Evening in Gironde, France", f: "night", l: 0.303, m: 0.438, h: 0.259 },
      { t: "Fireplace  #1", f: "fire", l: 0.186, m: 0.324, h: 0.490 },
      { t: "Beach: Small Waves", f: "shore", l: 0.156, m: 0.495, h: 0.349 },
      { t: "Forest", f: "forest", l: 0.307, m: 0.164, h: 0.529 },
      { t: "Wind through a tree with distant birds", f: "foliage", l: 0.064, m: 0.462, h: 0.474 },
      { t: "Sea Waves", f: "shore", l: 0.043, m: 0.524, h: 0.433 },
      { t: "Mountain Stream  #7", f: "water", l: 0.003, m: 0.496, h: 0.501 },
      { t: "Heidelberg Printing Press  #6", f: "materials", l: 0.090, m: 0.598, h: 0.311 },
      { t: "Small Stream  #4", f: "water", l: 0.002, m: 0.487, h: 0.511 }
    ]
  };

const specBars = document.getElementById("specBars");
const specRead = document.getElementById("specRead");
if (specBars && specRead) {
    const LABELS = { low: "Low-heavy", high: "High-heavy", even: "Most even" };
    const NOTES = {
      low: "Sorted by how much of each recording sits in the bottom two bands. Machines, vents and traffic lead — which is the honest reason a fridge is in the shelf at all.",
      high: "Sorted the other way: insects, leaves and rain sit almost entirely in the top three bands. Bright, detailed, no rumble.",
      even: "Sorted by the smallest spread between the three groups — these carry energy across the whole range rather than piling it in one end.",
    };

    const paint = (key) => {
      const rows = SPECTRUM[key];
      specBars.textContent = "";
      rows.forEach((r) => {
        const line = document.createElement("div");
        line.className = "spec-row";
        const name = document.createElement("span");
        name.className = "spec-name";
        name.textContent = r.t;
        const track = document.createElement("span");
        track.className = "spec-track";
        [["l", "spec-low", "low"], ["m", "spec-mid", "mid"], ["h", "spec-high", "high"]].forEach((seg) => {
          const part = document.createElement("span");
          part.className = "spec-seg " + seg[1];
          part.style.width = (r[seg[0]] * 100).toFixed(1) + "%";
          part.title = seg[2] === "l" ? "low" : seg[2] === "m" ? "mid" : "high";
          track.appendChild(part);
        });
        line.appendChild(name);
        line.appendChild(track);
        specBars.appendChild(line);
      });
      specRead.textContent = NOTES[key];
      const lead = key === "low" ? "l" : key === "high" ? "h" : "l";
      const leadName = lead === "l" ? "low" : "high";
      specBars.setAttribute(
        "aria-label",
        LABELS[key] + " order: " + rows.map((r) => r.t + " " + Math.round(r[lead] * 100) + "% " + leadName).join(", ")
      );
      document.querySelectorAll("[data-spec]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.spec === key));
      });
    };

    document.querySelectorAll("[data-spec]").forEach((btn) => {
      btn.addEventListener("click", () => paint(btn.dataset.spec));
    });
    paint("low");
  }

/* ---------- the shelf index (every bundled file, from the manifest) ---------- */
  const SHELF = [
    { t: "Woodland birdsong", f: "birds", k: "ambience", d: "60 s", b: "Stream with woodland birds", c: "kvgarlic; edited by Porrumentzio" },
    { t: "Cave atmosphere", f: "cave", k: "ambience", d: "60 s", b: "Cave and stream", c: "Joseph SARDIN" },
    { t: "Fire, Foley", f: "fire", k: "ambience", d: "36 s", b: "", c: "Joseph SARDIN & Axeline T." },
    { t: "Fireplace  #1", f: "fire", k: "ambience", d: "62 s", b: "Soft fireside", c: "Joseph SARDIN" },
    { t: "Fireplace  #4", f: "fire", k: "ambience", d: "79 s", b: "", c: "Joseph SARDIN" },
    { t: "Quiet hearth", f: "fire", k: "ambience", d: "45 s", b: "Quiet hearth", c: "Joseph SARDIN" },
    { t: "Wind in a cornfield", f: "foliage", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Wind in shrub", f: "foliage", k: "ambience", d: "120 s", b: "Soft fireside", c: "Joseph SARDIN" },
    { t: "Wind in Tall Grass", f: "foliage", k: "ambience", d: "85 s", b: "", c: "Joseph SARDIN" },
    { t: "Wind in the Trees", f: "foliage", k: "ambience", d: "120 s", b: "Mountain refuge", c: "Joseph SARDIN" },
    { t: "Wind through a tree with distant birds", f: "foliage", k: "ambience", d: "60 s", b: "", c: "Joseph SARDIN" },
    { t: "At the woodland edge", f: "forest", k: "ambience", d: "90 s", b: "Woodland edge", c: "Joseph SARDIN" },
    { t: "Forest", f: "forest", k: "ambience", d: "54 s", b: "", c: "Joseph SARDIN" },
    { t: "Forest  #2", f: "forest", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Forest  #3", f: "forest", k: "ambience", d: "120 s", b: "", c: "Pierre SIBANARCO" },
    { t: "Forest  #5", f: "forest", k: "ambience", d: "97 s", b: "", c: "Joseph SARDIN" },
    { t: "Forest brook with blackbirds", f: "forest", k: "ambience", d: "90 s", b: "Woodland brook", c: "Pierre SIBANARCO" },
    { t: "Forest with wind and birds", f: "forest", k: "ambience", d: "90 s", b: "", c: "Joseph SARDIN" },
    { t: "Fountain of a Japanese Temple", f: "fountain", k: "ambience", d: "62 s", b: "", c: "Olivier du Japon" },
    { t: "Parisian paved square, fountain", f: "fountain", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Water fountain for cat or dog", f: "fountain", k: "ambience", d: "35 s", b: "", c: "Joseph SARDIN" },
    { t: "Field cricket", f: "insects", k: "ambience", d: "37 s", b: "", c: "Joseph SARDIN" },
    { t: "Singing insect  #1", f: "insects", k: "ambience", d: "27 s", b: "", c: "Joseph SARDIN" },
    { t: "Sun and Heat  #1", f: "insects", k: "ambience", d: "45 s", b: "", c: "Joseph SARDIN" },
    { t: "Feet in Leaves  #1", f: "materials", k: "ambience", d: "64 s", b: "", c: "Joseph SARDIN" },
    { t: "Footstep in the Snow  #2", f: "materials", k: "ambience", d: "56 s", b: "", c: "Joseph SARDIN" },
    { t: "Heidelberg Printing Press  #6", f: "materials", k: "ambience", d: "40 s", b: "", c: "Mireille B." },
    { t: "Paper", f: "materials", k: "ambience", d: "30 s", b: "", c: "Joseph SARDIN" },
    { t: "Pencil  #1", f: "materials", k: "ambience", d: "33 s", b: "", c: "Joseph SARDIN" },
    { t: "Sewing machine, slow speed", f: "materials", k: "ambience", d: "26 s", b: "", c: "Joseph SARDIN" },
    { t: "Tent or curtain shower", f: "materials", k: "ambience", d: "26 s", b: "", c: "Joseph SARDIN" },
    { t: "Electric hood  #1", f: "mechanism", k: "ambience", d: "29 s", b: "", c: "Joseph SARDIN" },
    { t: "Fridge", f: "mechanism", k: "ambience", d: "36 s", b: "Fridge focus", c: "Joseph SARDIN" },
    { t: "Ventilation  #2", f: "mechanism", k: "ambience", d: "35 s", b: "", c: "Joseph SARDIN" },
    { t: "Ventilation  #5", f: "mechanism", k: "ambience", d: "77 s", b: "", c: "Joseph SARDIN & Axeline T." },
    { t: "Campaign at night  #1", f: "night", k: "ambience", d: "75 s", b: "", c: "Joseph SARDIN" },
    { t: "Evening in Gironde, France", f: "night", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Mountain, Evening  #1", f: "night", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN & Axeline T." },
    { t: "Humpback whale song", f: "ocean life", k: "ambience", d: "38 s", b: "Ocean with distant whales", c: "Spyrogumas" },
    { t: "Rain on car windshield", f: "rain", k: "ambience", d: "73 s", b: "", c: "Joseph SARDIN" },
    { t: "Rain on concrete", f: "rain", k: "ambience", d: "81 s", b: "", c: "Joseph SARDIN" },
    { t: "Rain Under an Umbrella", f: "rain", k: "ambience", d: "31 s", b: "", c: "Pierre SIBANARCO" },
    { t: "Summer Rain on Terrace", f: "rain", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Beach: Small Waves", f: "shore", k: "ambience", d: "57 s", b: "", c: "DenisChardonnet" },
    { t: "Cliff  #1", f: "shore", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Sea of the Beach of Dellec  #2", f: "shore", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Sea Waves", f: "shore", k: "ambience", d: "120 s", b: "Ocean with distant whales", c: "Joseph SARDIN" },
    { t: "Small Waves, Froth and Beach", f: "shore", k: "ambience", d: "98 s", b: "", c: "Joseph SARDIN" },
    { t: "Car micheline", f: "travel", k: "ambience", d: "120 s", b: "", c: "gamin" },
    { t: "Metro, Paris  #2", f: "travel", k: "ambience", d: "54 s", b: "", c: "Joseph SARDIN" },
    { t: "Old metro, interior", f: "travel", k: "ambience", d: "120 s", b: "", c: "Joseph SARDIN" },
    { t: "Cave  #2", f: "water", k: "ambience", d: "71 s", b: "", c: "Joseph SARDIN" },
    { t: "Flowing woodland stream", f: "water", k: "ambience", d: "60 s", b: "Stream with woodland birds", c: "gluckose" },
    { t: "Mountain Stream  #7", f: "water", k: "ambience", d: "120 s", b: "Mountain refuge", c: "Joseph SARDIN & Axeline T." },
    { t: "Ocean from the shore", f: "water", k: "ambience", d: "90 s", b: "Woodland edge", c: "Joseph SARDIN" },
    { t: "Small Stream", f: "water", k: "ambience", d: "96 s", b: "", c: "Joseph SARDIN" },
    { t: "Small Stream  #4", f: "water", k: "ambience", d: "105 s", b: "", c: "Joseph SARDIN" },
    { t: "Watercourse 5.2", f: "water", k: "ambience", d: "60 s", b: "", c: "Joseph SARDIN" },
    { t: "Waves among small rocks", f: "water", k: "ambience", d: "90 s", b: "Rocky coast", c: "Joseph SARDIN" },
    { t: "Calm ambient pads", f: "ambient", k: "music", d: "120 s", b: "", c: "The Cynic Project (cynicmusic)" },
    { t: "In the middle of nowhere", f: "guitar", k: "music", d: "96 s", b: "", c: "Centurion_of_war" },
    { t: "LaDaDa Guitar", f: "guitar", k: "music", d: "120 s", b: "", c: "Alex McCulloch (Pro Sensory)" },
    { t: "A new town", f: "harp", k: "music", d: "62 s", b: "", c: "The Cynic Project (cynicmusic)" },
    { t: "Goldberg Variations: Aria", f: "other music", k: "music", d: "300 s", b: "", c: "Kimiko Ishizaka" },
    { t: "Bach — Prelude 1 in C major", f: "piano", k: "music", d: "163 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 10 in E minor", f: "piano", k: "music", d: "121 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 14 in F-sharp minor", f: "piano", k: "music", d: "65 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 17 in A-flat major", f: "piano", k: "music", d: "93 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 24 in B minor", f: "piano", k: "music", d: "148 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 4 in C-sharp minor", f: "piano", k: "music", d: "178 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 8 in E-flat minor", f: "piano", k: "music", d: "238 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Bach — Prelude 9 in E major", f: "piano", k: "music", d: "105 s", b: "", c: "Johann Sebastian Bach (composition); Kimiko Ishizaka (piano performance)" },
    { t: "Gentle piano solo", f: "piano", k: "music", d: "120 s", b: "", c: "Tozan" },
    { t: "Simple piano chords", f: "piano", k: "music", d: "41 s", b: "", c: "8125" },
    { t: "Beautiful forest", f: "strings", k: "music", d: "70 s", b: "", c: "nene" },
    { t: "Jazz flute", f: "winds", k: "music", d: "74 s", b: "", c: "Alex McCulloch (Pro Sensory)" }
  ];

  const shelfList = document.getElementById("shelfList");
  const shelfChips = document.getElementById("shelfChips");
  const shelfSearch = document.getElementById("shelfSearch");
  const shelfCount = document.getElementById("shelfCount");
  if (shelfList && shelfChips && shelfSearch && shelfCount) {
    const KIND_ORDER = ["all", "ambience", "music"];
    const FAMILY_LABELS = [...new Set(SHELF.map((x) => x.f))];
    const FAMILIES = ["all"].concat(
      [...new Set(SHELF.map((x) => x.f))].sort((a, b) => a.localeCompare(b))
    );
    let kind = "all";
    let family = "all";
    let blendOnly = "";
    let query = "";

    const chip = (label, pressed, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "shelf-chip";
      b.textContent = label;
      b.setAttribute("aria-pressed", String(pressed));
      b.addEventListener("click", onClick);
      return b;
    };

    const renderChips = () => {
      shelfChips.textContent = "";
      KIND_ORDER.forEach((k) => {
        if (k === "all") return;
        shelfChips.appendChild(chip(
          k === "ambience" ? "Field recordings" : "Music works",
          kind === k,
          () => { kind = kind === k ? "all" : k; blendOnly = ""; render(); }
        ));
      });
      FAMILIES.forEach((f) => {
        if (f === "all") return;
        shelfChips.appendChild(chip(
          f,
          family === f,
          () => { family = family === f ? "all" : f; blendOnly = ""; render(); }
        ));
      });
    };

    const render = () => {
      renderChips();
      const q = query.trim().toLowerCase();
      const hits = SHELF.filter((x) => {
        if (blendOnly && x.b !== blendOnly) return false;
        if (kind !== "all" && x.k !== kind) return false;
        if (family !== "all" && x.f !== family) return false;
        if (q && !(x.t + " " + x.f + " " + x.c).toLowerCase().includes(q)) return false;
        return true;
      });

      const filtered = blendOnly || kind !== "all" || family !== "all" || Boolean(q);
      shelfCount.innerHTML =
        "<b>" + hits.length + "</b> of 76 files" +
        (blendOnly ? ' in <b>' + blendOnly + "</b>" : "") +
        (filtered ? " match" : " — the whole shelf, nothing held back");

      shelfList.textContent = "";
      if (!hits.length) {
        const p = document.createElement("p");
        p.className = "shelf-empty";
        p.textContent = "Nothing in the bundle matches that. The shelf is fixed at 76 files — try a family like water, fire or piano.";
        shelfList.appendChild(p);
        return;
      }
      const frag = document.createDocumentFragment();
      hits.forEach((x) => {
        const row = document.createElement("div");
        row.className = "shelf-row";
        const left = document.createElement("span");
        left.className = "shelf-row-t";
        left.textContent = x.t;
        const right = document.createElement("span");
        right.className = "shelf-row-m";
        right.textContent = (x.k === "music" ? "music · " + x.f : "recording · " + x.f) + " · " + x.d;
        row.appendChild(left);
        row.appendChild(right);
        if (x.b) {
          const tag = document.createElement("span");
          tag.className = "shelf-row-b";
          tag.textContent = x.b;
          row.appendChild(tag);
        }
        frag.appendChild(row);
      });
      shelfList.appendChild(frag);
    };

    shelfSearch.addEventListener("input", () => {
      query = shelfSearch.value;
      blendOnly = "";
      render();
    });

    // The picker runs earlier in this file, so it reaches the shelf through these
    // two small hooks rather than sharing state.
    // A picker answer is usually a blend, a family, or generated noise rather
    // than a file name, so the jump resolves whichever one the shelf can show.
    findOnShelf = (title) => {
      const t = String(title).toLowerCase();
      if (SHELF.some((x) => x.t.toLowerCase() === t)) return true;
      if (FAMILY_LABELS.some((f) => f.toLowerCase() === t)) return true;
      if (typeof BLENDS !== "undefined" && BLENDS.some((b) => b[0].toLowerCase() === t)) return true;
      if (/piano/.test(t) && FAMILY_LABELS.includes("piano")) return true;
      return false;
    };
    showOnShelf = (title) => {
      const t = String(title).toLowerCase();
      kind = "all";
      family = "all";
      blendOnly = "";
      query = "";

      const file = SHELF.find((x) => x.t.toLowerCase() === t);
      const fam = FAMILY_LABELS.find((f) => f.toLowerCase() === t);
      const blend = typeof BLENDS !== "undefined"
        ? BLENDS.find((b) => b[0].toLowerCase() === t)
        : null;
      // the picker says "public-domain piano"; the shelf files them under "piano"
      const kindWord = /piano/.test(t) ? "piano" : null;

      if (file) {
        query = file.t;
      } else if (blend) {
        blendOnly = blend[0];
      } else if (fam) {
        family = fam;
      } else if (kindWord && FAMILY_LABELS.includes(kindWord)) {
        family = kindWord;
      } else {
        return false;
      }

      shelfSearch.value = query;
      render();
      if (renderPicker) renderPicker();
      return true;
    };

    render();
    if (renderPicker) renderPicker();
  }

/* ---------- the ten blends (the app's own recipe table) ---------- */
  const BLEND_ASSETS = {
    "bsb-3222": ["Mountain Stream #7", "water", "120 s"],
    "bsb-0904": ["Wind in the Trees", "foliage", "120 s"],
    "bsb-2135": ["Cave atmosphere", "cave", "60 s"],
    "bsb-0030": ["Fireplace #1", "fire", "62 s"],
    "bsb-0907": ["Wind in shrub", "foliage", "120 s"],
    "nature-stream": ["Flowing woodland stream", "water", "60 s"],
    "nature-birds": ["Woodland birdsong", "birds", "60 s"],
    "bsb-0698": ["Sea Waves", "shore", "120 s"],
    "nature-whale": ["Humpback whale song", "ocean-life", "38 s"],
    "bsb-1445": ["Waves among small rocks", "water", "90 s"],
    "bsb-2857": ["Quiet hearth", "fire", "45 s"],
    "bsb-2713": ["Forest brook with blackbirds", "forest", "90 s"],
    "bsb-1046": ["Ocean from the shore", "water", "90 s"],
    "bsb-0905": ["At the woodland edge", "forest", "90 s"],
    "bsb-1157": ["Fridge", "mechanism", "36 s"],
  };
  const BLENDS = [
    ["Mountain refuge", 0.85, 0.15, "bsb-3222", "bsb-0904"],
    ["Cave and stream", 0.25, 0.75, "bsb-2135", "bsb-3222"],
    ["Soft fireside", 0.8, 0.2, "bsb-0030", "bsb-0907"],
    ["Stream with woodland birds", 0.85, 0.15, "nature-stream", "nature-birds"],
    ["Ocean with distant whales", 0.9, 0.1, "bsb-0698", "nature-whale"],
    ["Rocky coast", 0.92, 0.08, "bsb-1445", "nature-whale"],
    ["Woodland brook", 0.8, 0.2, "nature-stream", "bsb-2713"],
    ["Woodland edge", 0.85, 0.15, "bsb-1046", "bsb-0905"],
    ["Quiet hearth", 1.0, 0.0, "bsb-2857", null],
    ["Fridge focus", 1.0, 0.0, "bsb-1157", null],
  ];

  const blendList = document.getElementById("blendGrid") && document.getElementById("blendGrid").querySelector(".blend-list");
  const blendDetail = document.getElementById("blendDetail");
  if (blendList && blendDetail) {
    const pct = (v) => Math.round(v * 100) + "%";
    const row = (id, amount, accent) => {
      const a = BLEND_ASSETS[id];
      if (!a) return "";
      return (
        '<div class="blend-amt' + (accent ? " accent" : "") + '">' +
          '<div class="blend-amt-top"><span><b>' + a[0] + "</b> " +
            '<span class="meta">' + a[1] + " · " + a[2] + " · CC0</span></span>" +
            '<span class="pct">' + pct(amount) + "</span></div>" +
          '<div class="blend-bar"><span style="width:' + pct(amount) + '"></span></div>' +
        "</div>"
      );
    };
    const show = (i) => {
      const b = BLENDS[i];
      const sum = b[4]
        ? "A <b>bed and an accent</b>: the two amounts above are the mix the app ships. The bars are drawn from those two numbers, not from a measurement of your room."
        : "One recording, no accent — <b>all of it</b>, and nothing else in the mix. The other nine entries blend two sources.";
      blendDetail.innerHTML =
        "<h3>" + b[0] + "</h3>" +
        '<p class="blend-sub">' + (b[4] ? "two sources · fixed amounts" : "one source · no accent") + "</p>" +
        '<div class="blend-amounts">' + row(b[3], b[1], false) + (b[4] ? row(b[4], b[2], true) : "") + "</div>" +
        '<p class="blend-sum">' + sum + "</p>";
      blendList.querySelectorAll(".blend-tab").forEach((t, n) => {
        t.setAttribute("aria-pressed", String(n === i));
      });
    };
    BLENDS.forEach((b, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "blend-tab";
      btn.innerHTML = '<span class="bt-no">' + String(i + 1).padStart(2, "0") + "</span><span>" + b[0] + "</span>";
      btn.addEventListener("click", () => show(i));
      blendList.appendChild(btn);
    });
    show(0);
  }

  /* ---------- the two practice benches ---------- */
  const cCan = document.getElementById("toolCeiling");
  const cRead = document.getElementById("ceilRead");
  if (cCan && cCan.getContext && cRead) {
    const g = cCan.getContext("2d");
    const W = cCan.width, H = cCan.height;
    const P = { t: 22, r: 18, b: 40, l: 54 };
    const pw = W - P.l - P.r, ph = H - P.t - P.b;
    const X = (v) => P.l + v * pw;
    const Y = (v) => P.t + (1 - v) * ph;
    const mono = (px) => px + 'px ui-monospace, "Cascadia Mono", Consolas, monospace';

    const drawCeiling = (pct) => {
      const ceiling = pct / 100;
      g.clearRect(0, 0, W, H);

      // the hard ceiling, drawn as a terracotta wall
      g.strokeStyle = "rgba(196,85,47,0.85)";
      g.setLineDash([5, 4]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(X(ceiling), Y(0));
      g.lineTo(X(ceiling), Y(1));
      g.stroke();
      g.setLineDash([]);

      // the clipped transfer: unity below the ceiling, flat above it
      g.beginPath();
      g.moveTo(X(0), Y(0));
      for (let px = 0; px <= pw; px += 2) {
        const v = px / pw;
        g.lineTo(X(v), Y(Math.min(v, ceiling)));
      }
      g.strokeStyle = "#F2E9DB";
      g.lineWidth = 2.4;
      g.lineJoin = "round";
      g.stroke();

      g.lineTo(X(1), Y(0));
      g.closePath();
      g.fillStyle = "rgba(242,233,219,0.10)";
      g.fill();

      // above the line: what never gets through
      g.fillStyle = "rgba(196,85,47,0.14)";
      g.fillRect(X(ceiling), Y(1), X(1) - X(ceiling), Y(ceiling) - Y(1));

      // axes
      g.strokeStyle = "rgba(237,231,220,0.45)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(P.l, Y(0));
      g.lineTo(P.l + pw, Y(0));
      g.moveTo(P.l, Y(0));
      g.lineTo(P.l, Y(1));
      g.stroke();

      g.font = mono(11);
      g.fillStyle = "#A79E90";
      g.textAlign = "center";
      g.textBaseline = "top";
      for (let v = 0; v <= 1.0001; v += 0.25) {
        g.fillText(Math.round(v * 100) + "%", X(v), Y(0) + 10);
      }
      g.textAlign = "left";
      g.fillText("what leaves the phone", P.l - 40, P.t - 12);
      g.textAlign = "right";
      g.fillText("what you ask for →", P.l + pw, Y(0) + 26);

      g.fillStyle = "#F0D9BF";
      g.textAlign = "left";
      g.textBaseline = "bottom";
      g.fillText("nothing above " + pct + "%", Math.min(X(ceiling) + 8, P.l + pw - 4), Y(1) + 4);
    };

    const describe = (pct) => {
      const note =
        pct <= 20 ? "whisper territory — the quietest ceiling the app will hold" :
        pct <= 40 ? "a low ceiling, for a room you already half-trust" :
        pct <= 70 ? "the everyday range most people land in" :
        "loud, and the line still holds — the app clamps above it, not the other way round";
      cRead.innerHTML =
        "Ceiling at <code>" + pct + "%</code>. Every layer, every automatic move and every queued change is held below the terracotta line — <b>" +
        note + "</b>. Drag the slider: the flat top is the part of the sound the phone refuses to make.";
    };

    const range = document.createElement("input");
    range.type = "range";
    range.min = "10";
    range.max = "100";
    range.step = "5";
    range.value = "60";
    range.id = "ceilRange";
    range.setAttribute("aria-label", "Ceiling, in percent");
    const out = document.createElement("output");
    out.setAttribute("for", "ceilRange");
    const ctl = document.createElement("div");
    ctl.className = "tool-ctl";
    const lab = document.createElement("label");
    lab.setAttribute("for", "ceilRange");
    lab.textContent = "Ceiling";
    ctl.appendChild(lab);
    ctl.appendChild(range);
    ctl.appendChild(out);
    cRead.parentNode.insertBefore(ctl, cRead);

    const paint = () => {
      const v = Number(range.value);
      out.textContent = v + "%";
      drawCeiling(v);
      describe(v);
    };
    range.addEventListener("input", paint);
    paint();
  }

  const fCan = document.getElementById("toolFader");
  const tilt = document.getElementById("tilt");
  const tiltOut = document.getElementById("tiltOut");
  const fRead = document.getElementById("faderRead");
  if (fCan && fCan.getContext && tilt && tiltOut && fRead) {
    const g = fCan.getContext("2d");
    const W = fCan.width, H = fCan.height;
    const P = { t: 26, r: 18, b: 44, l: 40 };
    const pw = W - P.l - P.r, ph = H - P.t - P.b;
    const EDGES = [80, 160, 315, 630, 1250, 2500, 4000, 6000, 7800];
    const L0 = Math.log(EDGES[0]);
    const L1 = Math.log(EDGES[EDGES.length - 1]);
    const X = (hz) => P.l + ((Math.log(hz) - L0) / (L1 - L0)) * pw;
    const Y = (db) => P.t + (1 - (db + 12) / 24) * ph;
    const mono = (px) => px + 'px ui-monospace, "Cascadia Mono", Consolas, monospace';

    const paint = () => {
      const t = Number(tilt.value);
      const half = t / 2; // total tilt across the range, in dB
      g.clearRect(0, 0, W, H);

      // zero line
      g.strokeStyle = "rgba(237,231,220,0.25)";
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(P.l, Y(0));
      g.lineTo(P.l + pw, Y(0));
      g.stroke();
      g.setLineDash([]);

      // the tilt as a straight ramp across the shipped edges
      const steps = 240;
      g.beginPath();
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const hz = Math.exp(L0 + f * (L1 - L0));
        const db = -half + 2 * half * f;
        const x = X(hz), y = Y(db);
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokeStyle = t === 0 ? "#F2E9DB" : (t > 0 ? "#E8B48B" : "#A8C6B2");
      g.lineWidth = 2.4;
      g.lineJoin = "round";
      g.stroke();

      g.lineTo(X(EDGES[EDGES.length - 1]), Y(0));
      g.lineTo(X(EDGES[0]), Y(0));
      g.closePath();
      g.fillStyle = "rgba(242,233,219,0.08)";
      g.fill();

      // the band numbers, from the same edges the engine ships
      g.font = mono(10);
      g.textAlign = "center";
      g.textBaseline = "top";
      g.fillStyle = "#8D8478";
      for (let i = 0; i < EDGES.length - 1; i++) {
        const mid = Math.sqrt(EDGES[i] * EDGES[i + 1]);
        g.fillText(String(i + 1), X(mid), P.t + 2);
      }
      for (let i = 0; i < EDGES.length; i++) {
        const x = X(EDGES[i]);
        g.strokeStyle = "rgba(237,231,220,0.4)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, Y(0));
        g.lineTo(x, Y(0) + 5);
        g.stroke();
        g.save();
        g.translate(x, Y(0) + 8);
        g.rotate(-Math.PI / 4);
        g.textAlign = "left";
        g.textBaseline = "middle";
        g.fillStyle = "#8D8478";
        g.font = mono(9);
        g.fillText(EDGES[i] >= 1000 ? EDGES[i] / 1000 + "k" : String(EDGES[i]), 0, 0);
        g.restore();
      }

      g.textAlign = "left";
      g.textBaseline = "top";
      g.font = mono(9);
      g.fillStyle = "#8D8478";
      g.fillText("+12", 4, P.t - 4);
      g.fillText("  0", 4, Y(0) - 4);
      g.fillText("−12", 4, P.t + ph - 10);
    };

    const describe = () => {
      const t = Number(tilt.value);
      const word = t === 0 ? "even" : (t > 0 ? "brighter" : "darker");
      tiltOut.textContent = word;
      const note =
        t === 0 ? "no tilt: the bed is the same everywhere, which is what most people start with" :
        t > 0 ? "more of the top two octaves, less of the bottom — the classic “thin the rumble, keep the air” shape" :
        "more weight at the bottom, less at the top — thick, low, and the usual cure for a room that hisses";
      fRead.innerHTML =
        "Tilt at <code>" + (t > 0 ? "+" : "") + t + "</code> — <b>" + word + "</b>. This is a sketch of the slope you would ask the engine for, drawn across the eight shipped edges: " +
        note + ". The app does this with eight bands, not a free EQ curve.";
    };

    tilt.addEventListener("input", () => { paint(); describe(); });
    paint();
    describe();
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
