/* Product page: gallery with live engraving preview, personaliser, Shopify cart. */
(function () {
  const D = JSON.parse(document.getElementById("product-data").textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const T = window.Theme;
  const fonts = window.STORE.product.fonts;
  const E = D.engraving;
  const canFront = !!E.enabled;
  const canBack = canFront && !!E.back.enabled;
  const ALLOWED = /[A-Za-z0-9 .,'&\-\/#+:·]/;

  /* finish key for the photo engraving bases */
  const finishKey = (label) => {
    const l = String(label || "").toLowerCase();
    return l.includes("rose") ? "rose" : l.includes("gold") ? "gold" : "steel";
  };
  const finishes = [];
  D.variants.forEach((v) => {
    const label = v.options[D.finishIndex];
    if (!finishes.find((f) => f.label === label)) finishes.push({ label, key: finishKey(label) });
  });
  const variantFor = (label) => D.variants.find((v) => v.options[D.finishIndex] === label);

  /* ---------- state ---------- */
  const pad = (a, n) => { a = Array.isArray(a) ? a.slice(0, n) : []; while (a.length < n) a.push(""); return a; };
  const DRAFT = "kc_draft_v2";
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(DRAFT)) || {}; } catch (e) {}
  const startVariant = D.variants.find((v) => v.id === D.selectedVariant) || D.variants[0];
  const state = {
    finish: finishes.find((f) => f.label === draft.finish) ? draft.finish : startVariant.options[D.finishIndex],
    font: fonts.find((f) => f.id === draft.font) ? draft.font : fonts[0].id,
    front: pad(draft.front, E.front.lines),
    back: pad(draft.back, E.back.lines),
    side: "front", qty: 1, confirmed: false,
  };
  const save = () => { try { localStorage.setItem(DRAFT, JSON.stringify({ finish: state.finish, font: state.font, front: state.front, back: state.back })); } catch (e) {} };
  const variant = () => variantFor(state.finish) || startVariant;
  const fkey = () => finishKey(state.finish);
  const font = () => fonts.find((f) => f.id === state.font) || fonts[0];
  const clean = (arr) => arr.map((l) => l.trim()).filter(Boolean);
  const hasText = () => canFront && (clean(state.front).length || (canBack && clean(state.back).length));

  function refCode() {
    const str = JSON.stringify([state.finish, state.font, state.front, state.back]);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return "KC-" + (h >>> 0).toString(36).toUpperCase().slice(0, 6).padStart(6, "0");
  }
  function properties() {
    if (!canFront) return {};
    const f = clean(state.front), b = clean(state.back);
    const p = {};
    p["Engraving – front"] = f.length ? f.join(" / ") : "None";
    if (canBack) p["Engraving – back"] = b.length ? b.join(" / ") : "None";
    if (f.length || b.length) p["Engraving style"] = font().label;
    p["Personalisation ref"] = refCode();
    // hidden (underscore) properties drive the cart thumbnail preview
    p["_finish"] = fkey();
    p["_font"] = state.font;
    p["_front"] = JSON.stringify(f);
    p["_back"] = JSON.stringify(canBack ? b : []);
    return p;
  }

  /* ---------- gallery ---------- */
  let current = 0;
  const slides = [{ live: true, label: canFront ? "Your design" : "Front" }].concat(
    D.media.map((m) => ({ src: m.src, thumb: m.thumb, alt: m.alt, label: m.alt }))
  );
  function buildGallery() {
    $("#gallery-main").innerHTML =
      slides.map((s, i) => `<div class="gallery__slide ${i === 0 ? "is-active" : ""}" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${esc(s.label)}"><div class="zoomable">${s.live ? '<div id="live" class="engrave-host"></div>' : `<img src="${esc(s.src)}" alt="${esc(s.alt)}" loading="lazy">`}</div></div>`).join("") +
      `<span class="gallery__label" id="gallery-label">${esc(slides[0].label)}</span>
       ${canBack ? `<div class="sides preview__toggle" role="tablist" aria-label="Preview side" id="live-sides"><button type="button" role="tab" data-side="front" aria-selected="true">Front</button><button type="button" role="tab" data-side="back" aria-selected="false">Back</button></div>` : ""}
       <button type="button" class="gallery__nav gallery__nav--prev" aria-label="Previous image">‹</button>
       <button type="button" class="gallery__nav gallery__nav--next" aria-label="Next image">›</button>`;
    $("#gallery-thumbs").innerHTML = slides.map((s, i) => `<button type="button" class="gallery__thumb" data-go="${i}" aria-label="${esc(s.label)}" aria-current="${i === 0}">${s.live ? '<div class="engrave-host" id="live-thumb"></div>' : `<img src="${esc(s.thumb)}" alt="" loading="lazy">`}</button>`).join("");
    $("#gallery-dots").innerHTML = slides.map((s, i) => `<button type="button" data-go="${i}" aria-label="${esc(s.label)}" aria-current="${i === 0}"></button>`).join("");
  }
  function go(i) {
    current = (i + slides.length) % slides.length;
    $$(".gallery__slide").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.i) === current));
    $$("[data-go]").forEach((el) => el.setAttribute("aria-current", String(Number(el.dataset.go) === current)));
    $("#gallery-label").textContent = slides[current].label;
    const sd = $("#live-sides"); if (sd) sd.style.display = slides[current].live ? "" : "none";
    $("#gallery-main").classList.remove("is-zoomed");
  }

  function renderLive(flip) {
    const host = $("#live"); if (!host) return;
    const side = canBack ? state.side : "front";
    const lines = canFront ? (side === "back" ? state.back : state.front) : [];
    const opts = { finish: fkey(), lines, font: state.font, side, placeholder: canFront ? (side === "back" ? "BACK" : "YOUR TEXT") : "", title: `Preview of your necklace, ${side}` };
    if (flip && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.style.transition = "transform .3s ease, opacity .3s ease";
      host.style.transform = "rotateY(90deg)"; host.style.opacity = ".4";
      setTimeout(() => { Engrave.mount(host, opts); host.style.transform = "rotateY(0)"; host.style.opacity = "1"; }, 300);
    } else Engrave.mount(host, opts);
    Engrave.mount($("#mini-preview"), { ...opts, placeholder: "", zoom: 2.4 });
    Engrave.mount($("#live-thumb"), { finish: fkey(), lines: canFront ? state.front : [], font: state.font, zoom: 2 });
  }

  /* ---------- controls ---------- */
  function buildControls() {
    let n = 0;
    const step = () => String(++n).padStart(2, "0");
    const parts = [];
    if (finishes.length > 1) {
      parts.push(`<div class="opt"><div class="opt__head"><span class="label"><span class="step-n">${step()}</span> Finish</span><span class="opt__value" id="finish-value"></span></div>
        <div class="swatches" role="radiogroup" aria-label="Finish">${finishes.map((f) => `<button type="button" class="swatch swatch--${f.key}" role="radio" data-finish="${esc(f.label)}" aria-checked="${f.label === state.finish}"><span class="swatch__dot"></span><span class="swatch__label">${esc(f.label)}</span></button>`).join("")}</div></div>`);
    }
    if (canFront) {
      const inputs = (side, conf, arr) => Array.from({ length: conf.lines }, (_, i) => `
        <div class="engrave-line"><label class="sr-only" for="${side}-${i}">${side === "front" ? "Front" : "Back"} engraving, line ${i + 1}</label>
        <input class="input" id="${side}-${i}" data-side="${side}" data-line="${i}" maxlength="${conf.chars}" autocomplete="off" spellcheck="true"
          placeholder="${i === 0 ? (side === "front" ? "e.g. Isabella" : "e.g. 12.04.2019") : `Line ${i + 1} (optional)`}" value="${esc(arr[i])}">
        <span class="count" data-count="${side}-${i}"></span></div>`).join("");
      parts.push(`<div class="opt"><div class="opt__head"><span class="label"><span class="step-n">${step()}</span> Your engraving</span><span class="opt__value">Up to ${E.front.lines} line${E.front.lines > 1 ? "s" : ""}</span></div>
        ${canBack ? `<div class="sides" role="tablist" aria-label="Engraving side"><button type="button" role="tab" id="tab-front" data-tab="front" aria-selected="true">Front</button><button type="button" role="tab" id="tab-back" data-tab="back" aria-selected="false">Back</button></div>` : ""}
        <div id="panel-front" role="tabpanel"><div class="engrave-lines">${inputs("front", E.front, state.front)}</div>
          <div class="ideas">${["Name", "Initials", "Date", "A word"].map((x) => `<button type="button" data-idea="${x}">${x}</button>`).join("")}</div></div>
        ${canBack ? `<div id="panel-back" role="tabpanel" hidden><div class="engrave-lines">${inputs("back", E.back, state.back)}</div><p class="hint">The back is a lovely place for a date, a short message or coordinates.</p></div>` : ""}
        <p class="hint" id="char-hint" aria-live="polite">Letters, numbers and . , ’ &amp; - / # + : are supported. Leave blank for a plain polished pendant.</p></div>`);
      if (fonts.length > 1) {
        parts.push(`<div class="opt"><div class="opt__head"><span class="label"><span class="step-n">${step()}</span> Lettering</span><span class="opt__value" id="font-value"></span></div>
          <div class="fonts" role="radiogroup" aria-label="Lettering style">${fonts.map((f) => `<button type="button" class="font-chip" role="radio" data-font="${f.id}" aria-checked="${f.id === state.font}"><span class="font-chip__sample" style="font-family:${esc(f.css)};font-weight:${f.weight}" data-sample="${f.id}"></span><span class="font-chip__name">${esc(f.label)}</span></button>`).join("")}</div></div>`);
      }
    }
    $("#controls").innerHTML = parts.join("");
  }

  function renderSummary() {
    const v = variant();
    const rows = [[D.finishOption || "Finish", state.finish]];
    Object.entries(properties()).forEach(([k, val]) => { if (k[0] !== "_" && k !== "Personalisation ref") rows.push([k, val]); });
    rows.push(["Quantity", state.qty]);
    $("#summary-rows").innerHTML = rows.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join("");
    $("#summary-total").innerHTML = `<span>Total</span><strong>${T.money(v.price * state.qty)}</strong>`;
    $("#price").textContent = T.money(v.price);
    $("#sticky-price").textContent = T.money(v.price * state.qty);
    const fv = $("#font-value"); if (fv) fv.textContent = font().label;
    const fin = $("#finish-value"); if (fin) fin.textContent = state.finish;
    $$("[data-sample]").forEach((el) => {
      const f = fonts.find((x) => x.id === el.dataset.sample);
      const txt = clean(state.front)[0] || "Aa";
      el.textContent = f.upper ? txt.toUpperCase() : txt;
    });
    $$("[data-count]").forEach((el) => {
      const [side, i] = el.dataset.count.split("-");
      const max = (side === "front" ? E.front : E.back).chars;
      const len = (side === "front" ? state.front : state.back)[i].length;
      el.textContent = len ? `${len}/${max}` : ""; el.classList.toggle("is-full", len >= max);
    });
    $("#qty-out").textContent = state.qty;
    $("#qty-dec").disabled = state.qty <= 1;
    $("#qty-inc").disabled = state.qty >= D.maxQty;
    $("#confirm-text").textContent = hasText()
      ? "I’ve checked the spelling, spacing and dates of my engraving. It will be produced exactly as entered."
      : canFront ? "I’d like a plain polished pendant with no engraving." : "I’ve checked my selection.";
    const ok = state.confirmed && v.available;
    ["#add", "#buy", "#sticky-add"].forEach((s) => ($(s).dataset.blocked = String(!ok)));
    $("#add").textContent = v.available ? "Add to bag" : "Sold out";
    $("#blocker").textContent = !v.available ? "This finish is sold out." : state.confirmed ? "" : "Please confirm your details";
  }

  function update(o = {}) { renderSummary(); renderLive(o.flip); save(); if (o.toDesign && current !== 0) go(0); }

  async function add(then) {
    if (!variant().available) return T.toast("This finish is sold out");
    if (!state.confirmed) { $("#confirm").scrollIntoView({ behavior: "smooth", block: "center" }); $("#confirm-box").focus(); return T.toast("Please confirm your details first"); }
    const btns = ["#add", "#buy", "#sticky-add"].map((s) => $(s));
    btns.forEach((b) => (b.disabled = true));
    try {
      await T.addToCart({ id: variant().id, quantity: state.qty, properties: properties() });
      state.confirmed = false; $("#confirm-box").checked = false; renderSummary();
      then();
    } catch (e) {
      T.toast(e.message || "Couldn’t add to bag — please try again");
    } finally { btns.forEach((b) => (b.disabled = false)); }
  }

  function setSide(side, flip) {
    if (!canBack) return;
    const changed = state.side !== side;
    state.side = side;
    $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === side)));
    $$("#live-sides [data-side]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.side === side)));
    const pf = $("#panel-front"), pb = $("#panel-back");
    if (pf && pb) { pf.hidden = side !== "front"; pb.hidden = side !== "back"; }
    if (current !== 0) go(0);
    if (changed) renderLive(flip);
  }

  function bind() {
    const root = $("#personalise");
    root.addEventListener("click", (e) => {
      const fin = e.target.closest("[data-finish]");
      if (fin) {
        state.finish = fin.dataset.finish;
        $$("[data-finish]").forEach((b) => b.setAttribute("aria-checked", String(b === fin)));
        const url = new URL(location.href); url.searchParams.set("variant", variant().id); history.replaceState(null, "", url);
        update({ toDesign: true });
      }
      const fo = e.target.closest("[data-font]");
      if (fo) { state.font = fo.dataset.font; $$("[data-font]").forEach((b) => b.setAttribute("aria-checked", String(b === fo))); update({ toDesign: true }); }
      const tab = e.target.closest("[data-tab]"); if (tab) setSide(tab.dataset.tab, true);
      const idea = e.target.closest("[data-idea]");
      if (idea) {
        state.front = pad({ Name: ["Isabella"], Initials: ["A · J"], Date: ["12.04.2019"], "A word": ["Always"] }[idea.dataset.idea], E.front.lines);
        $$("[data-side='front']").forEach((inp, i) => (inp.value = state.front[i]));
        setSide("front", false); update({ toDesign: true }); $("#front-0").focus();
      }
    });
    root.addEventListener("input", (e) => {
      const inp = e.target.closest("[data-line]"); if (!inp) return;
      const raw = inp.value;
      const val = Array.from(raw).filter((ch) => ALLOWED.test(ch)).join("").replace(/\s{2,}/g, " ");
      const hint = $("#char-hint");
      const removed = val !== raw.replace(/\s{2,}/g, " ");
      hint.textContent = removed ? "Some characters can’t be engraved and were removed." : "Letters, numbers and . , ’ & - / # + : are supported. Leave blank for a plain polished pendant.";
      hint.classList.toggle("is-warn", removed);
      if (val !== raw) inp.value = val;
      (inp.dataset.side === "front" ? state.front : state.back)[inp.dataset.line] = val;
      state.confirmed = false; $("#confirm-box").checked = false;
      if (canBack && state.side !== inp.dataset.side) setSide(inp.dataset.side, false);
      update({ toDesign: true });
    });
    root.addEventListener("keydown", (e) => {
      const inp = e.target.closest("[data-line]");
      if (inp && e.key === "Enter") { e.preventDefault(); const nx = $(`[data-side='${inp.dataset.side}'][data-line='${Number(inp.dataset.line) + 1}']`); nx && nx.focus(); }
    });
    $("#confirm-box").addEventListener("change", (e) => { state.confirmed = e.target.checked; renderSummary(); });
    $("#qty-dec").addEventListener("click", () => { state.qty = Math.max(1, state.qty - 1); renderSummary(); });
    $("#qty-inc").addEventListener("click", () => { state.qty = Math.min(D.maxQty, state.qty + 1); renderSummary(); });
    $("#add").addEventListener("click", () => add(() => T.openCart()));
    $("#sticky-add").addEventListener("click", () => add(() => T.openCart()));
    $("#buy").addEventListener("click", () => add(() => (location.href = "/checkout")));

    const main = $("#gallery-main");
    document.addEventListener("click", (e) => {
      const g = e.target.closest("[data-go]"); if (g) go(Number(g.dataset.go));
      const sd = e.target.closest("#live-sides [data-side]"); if (sd) { e.stopPropagation(); setSide(sd.dataset.side, true); }
    });
    main.addEventListener("click", (e) => {
      if (e.target.closest(".gallery__nav--prev")) return go(current - 1);
      if (e.target.closest(".gallery__nav--next")) return go(current + 1);
      if (e.target.closest("#live-sides")) return;
      main.classList.toggle("is-zoomed");
    });
    main.addEventListener("mousemove", (e) => {
      if (!main.classList.contains("is-zoomed")) return;
      const r = main.getBoundingClientRect(); const z = $(".is-active .zoomable", main);
      z && (z.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
    });
    main.addEventListener("mouseleave", () => main.classList.remove("is-zoomed"));
    main.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(current + 1); if (e.key === "ArrowLeft") go(current - 1); });
    let x0 = null;
    main.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    main.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1)); x0 = null; });

    const sticky = $("#sticky-buy"), gal = $(".gallery");
    // the floating preview only appears once the customer starts personalising
    let galleryHidden = false, touched = false;
    const syncMini = () => $("#mini-preview").classList.toggle("is-shown", galleryHidden && touched);
    root.addEventListener("input", () => { touched = true; syncMini(); });
    root.addEventListener("click", (e) => { if (e.target.closest("[data-finish],[data-font],[data-tab],[data-idea]")) { touched = true; syncMini(); } });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.target.classList.contains("buy-actions")) sticky.classList.toggle("is-shown", !en.isIntersecting && en.boundingClientRect.top > 0);
      if (en.target === gal) { galleryHidden = !en.isIntersecting && en.boundingClientRect.top < 0; syncMini(); }
    }));
    io.observe($(".buy-actions")); io.observe(gal);
    document.body.classList.add("has-sticky");
    $("#mini-preview").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  function boot() {
    buildControls(); buildGallery(); bind(); renderSummary(); renderLive(false);
  }
  // engrave.js and theme.js are deferred too; run after they've loaded
  if (window.Engrave && window.Theme) boot(); else window.addEventListener("DOMContentLoaded", boot);
})();
