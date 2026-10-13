(() => {
  "use strict";

  /* Language toggle. English is the default text in the HTML; Indonesian lives next to it
     in data-id (text), data-id-aria-label and data-id-content attributes. */

  const STORE_KEY = "altura-lang";

  function swap(el, attr, lang) {
    const idKey = attr === "text" ? "data-id" : `data-id-${attr}`;
    const idValue = el.getAttribute(idKey);
    if (idValue === null) return;

    const enKey = attr === "text" ? "data-en" : `data-en-${attr}`;
    if (!el.hasAttribute(enKey)) {
      el.setAttribute(enKey, attr === "text" ? el.textContent : el.getAttribute(attr));
    }
    const value = lang === "id" ? idValue : el.getAttribute(enKey);
    if (attr === "text") el.textContent = value;
    else el.setAttribute(attr, value);
  }

  function setLang(lang, save) {
    document.documentElement.lang = lang;
    const targets = document.querySelectorAll("[data-id], [data-id-aria-label], [data-id-content]");
    for (const el of targets) {
      swap(el, "text", lang);
      swap(el, "aria-label", lang);
      swap(el, "content", lang);
    }
    for (const button of document.querySelectorAll(".lang button")) {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    }
    if (save) {
      try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* storage unavailable */ }
    }
  }

  for (const button of document.querySelectorAll(".lang button")) {
    button.addEventListener("click", () => setLang(button.dataset.lang, true));
  }

  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* storage unavailable */ }
  if (saved === "id") setLang("id", false);

  /* Hero logo: vertical lines rise one after another, then merge into the solid logo.
     The logo asset is the mask, so the final shape is exactly the logo. Without JS or with
     reduced motion, the plain logo image stays in place. */

  const box = document.querySelector(".hero-logo");
  if (box && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const lines = box.querySelector(".hero-logo-lines");
    const COUNT = 72;
    for (let i = 0; i < COUNT; i++) {
      const line = document.createElement("span");
      // Left-to-right wave with a small sine offset so neighbours do not rise in lockstep.
      const delay = (i / COUNT) * 1.2 + (Math.sin(i * 0.9) + 1) * 0.06;
      line.style.setProperty("--d", `${delay.toFixed(3)}s`);
      lines.appendChild(line);
    }
    box.classList.add("is-lines");
  }
})();
