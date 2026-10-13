(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PREFIX = "/altura-mockup/";

  /* ---------- Bahasa: Inggris default, Indonesia di data-id ---------- */

  const LANG_KEY = "altura-lang";
  const ATTRS = ["aria-label", "content", "placeholder"];

  function swap(el, attr, lang) {
    const idKey = attr === "text" ? "data-id" : `data-id-${attr}`;
    const idValue = el.getAttribute(idKey);
    if (idValue === null) return;
    const enKey = attr === "text" ? "data-en" : `data-en-${attr}`;
    if (!el.hasAttribute(enKey)) {
      el.setAttribute(enKey, attr === "text" ? el.textContent : el.getAttribute(attr) || "");
    }
    const value = lang === "id" ? idValue : el.getAttribute(enKey);
    if (attr === "text") el.textContent = value;
    else el.setAttribute(attr, value);
  }

  function setLang(lang, save) {
    root.lang = lang;
    const selector = ["[data-id]", ...ATTRS.map((a) => `[data-id-${a}]`)].join(",");
    for (const el of document.querySelectorAll(selector)) {
      swap(el, "text", lang);
      for (const a of ATTRS) swap(el, a, lang);
    }
    for (const b of document.querySelectorAll(".lang button")) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    }
    if (save) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage unavailable */ }
    }
  }

  for (const b of document.querySelectorAll(".lang button")) {
    b.addEventListener("click", () => setLang(b.dataset.lang, true));
  }
  let saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* storage unavailable */ }
  if (saved === "id") setLang("id", false);

  /* ---------- Menu mobile ---------- */

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  function setMenu(open) {
    if (!header || !toggle) return;
    header.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  if (toggle) {
    toggle.addEventListener("click", () => setMenu(!header.hasAttribute("data-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    window.matchMedia("(min-width: 901px)").addEventListener("change", () => setMenu(false));
  }

  /* ---------- Transisi halaman: tirai naik saat keluar, terangkat saat masuk ---------- */

  if (!reduce) {
    if (root.classList.contains("is-entering")) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.remove("is-entering");
        root.classList.add("is-revealing");
        setTimeout(() => root.classList.remove("is-revealing"), 1000);
      }));
    }

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith(PREFIX)) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page or #hash
      e.preventDefault();
      setMenu(false);
      try { sessionStorage.setItem("altura-mockup-nav", "1"); } catch (err) { /* storage unavailable */ }
      root.classList.add("is-leaving");
      setTimeout(() => { location.href = url.href; }, 720);
    });

    window.addEventListener("pageshow", (e) => {
      if (e.persisted) root.classList.remove("is-leaving", "is-entering", "is-revealing");
    });
  }

  /* ---------- Filter portofolio dan wawasan ---------- */

  for (const scope of document.querySelectorAll("[data-filter-scope]")) {
    const buttons = scope.querySelectorAll("[data-filter]");
    const items = scope.querySelectorAll("[data-cat]");
    for (const b of buttons) {
      b.addEventListener("click", () => {
        const f = b.dataset.filter;
        for (const x of buttons) x.setAttribute("aria-pressed", String(x === b));
        for (const i of items) i.hidden = !(f === "all" || i.dataset.cat === f);
      });
    }
  }

  /* ---------- Formulir kontak (mockup: tidak mengirim apa pun) ---------- */

  const form = document.querySelector(".form");
  if (form) {
    const status = form.querySelector(".form-status");
    swap(status, "text", root.lang === "id" ? "id" : "en");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.hidden = false;
      form.reset();
    });
  }

  /* ---------- Logo: satu garis menelusuri simbol, lalu wordmark menyusul ---------- */

  const svg = document.querySelector(".logo-draw");
  if (svg) {
    const pen = svg.querySelector(".pen");
    const dot = svg.querySelector(".pen-dot");
    const clip = svg.querySelector(".word-clip");
    const replay = document.querySelector(".replay");
    const len = pen.getTotalLength();
    const CAP = 25;          // lebih dari setengah lebar garis, supaya ujung bulat tidak tampak di awal
    const SYMBOL_W = 659;    // lebar simbol pada koordinat logo
    const FULL_W = 1801;
    const T_LINE = 2600;     // lama garis menggambar simbol
    const T_WORD0 = 2400;    // wordmark mulai menyapu
    const T_WORD1 = 3400;
    const T_END = 3500;      // simbol asli menggantikan garis
    const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const out = (t) => 1 - Math.pow(1 - t, 3);

    pen.style.strokeDasharray = `${len} ${len}`;
    let raf = 0;
    let run = 0;

    function showFinal() {
      cancelAnimationFrame(raf);
      run++;
      clip.setAttribute("x", "0");
      clip.setAttribute("width", String(FULL_W));
      pen.style.opacity = "0";
      dot.style.opacity = "0";
    }

    function play() {
      cancelAnimationFrame(raf);
      const id = ++run;
      pen.style.transition = "none";
      dot.style.transition = "none";
      pen.style.opacity = "1";
      pen.style.strokeDashoffset = String(len + CAP);
      dot.style.opacity = "1";
      clip.setAttribute("x", String(SYMBOL_W));
      clip.setAttribute("width", "0");
      const t0 = performance.now();
      let ended = false;

      const step = (now) => {
        if (id !== run) return;
        const t = now - t0;
        const p = inOut(Math.min(1, t / T_LINE));
        pen.style.strokeDashoffset = String((len + CAP) * (1 - p));
        const at = Math.max(0, Math.min(len, len * p + CAP * p - CAP));
        const pt = pen.getPointAtLength(at);
        dot.setAttribute("cx", pt.x.toFixed(1));
        dot.setAttribute("cy", pt.y.toFixed(1));
        if (t > T_WORD0 && !ended) {
          const q = out(Math.min(1, (t - T_WORD0) / (T_WORD1 - T_WORD0)));
          clip.setAttribute("width", String((FULL_W - SYMBOL_W) * q));
        }
        if (t >= T_LINE) dot.style.opacity = "0";
        if (t >= T_END && !ended) {
          ended = true;
          pen.style.transition = "opacity 0.45s ease";
          clip.setAttribute("x", "0");
          clip.setAttribute("width", String(FULL_W));
          pen.style.opacity = "0";
        }
        if (t < T_END + 600) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    if (reduce) {
      showFinal();
    } else {
      showFinal();
      const delay = root.classList.contains("is-entering") || root.classList.contains("is-revealing") ? 800 : 250;
      setTimeout(play, delay);
    }
    if (replay) replay.addEventListener("click", () => (reduce ? showFinal() : play()));
  }
})();
