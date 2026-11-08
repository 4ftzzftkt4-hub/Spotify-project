/* Product page: gallery with live "Your design" slide, personaliser, summary, add to bag. */
(function () {
  const { S, P, PREVIEW, $, $$, esc, visible, hasValue, flag, money, spec, fontById, finishById, unitPrice, describe, Cart, openCart, checkout } = Site;

  const finishes = P.finishes.filter(visible);
  const fonts = P.fonts.filter(visible);
  const lengths = P.chainLengths.filter(visible);
  const front = P.engraving.front;
  const back = P.engraving.back;
  const canFront = visible(front) && front.enabled;
  const canBack = visible(back) && back.enabled;
  const allowed = new RegExp(P.engraving.allowedPattern);

  /* ---------- state (draft persisted per browser) ---------- */
  const DRAFT_KEY = "kc_draft_v1";
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch {}
  const state = {
    finish: finishById(draft.finish) && visible(finishById(draft.finish)) ? draft.finish : finishes[0] && finishes[0].id,
    font: fontById(draft.font) && visible(fontById(draft.font)) ? draft.font : fonts[0] && fonts[0].id,
    length: lengths.find((l) => l.id === draft.length) ? draft.length : lengths.length === 1 ? lengths[0].id : null,
    front: pad(draft.front, front.maxLines),
    back: pad(draft.back, back.maxLines),
    giftWrap: false,
    giftMessage: "",
    side: "front",
    qty: 1,
    confirmed: false,
  };
  function pad(arr, n) {
    const a = Array.isArray(arr) ? arr.slice(0, n) : [];
    while (a.length < n) a.push("");
    return a;
  }
  const cfg = () => ({
    finish: state.finish,
    font: state.font,
    length: state.length,
    front: canFront ? state.front.slice() : [],
    back: canBack ? state.back.slice() : [],
    giftWrap: state.giftWrap,
    giftMessage: state.giftMessage.trim(),
  });
  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ finish: state.finish, font: state.font, length: state.length, front: state.front, back: state.back })); } catch {}
  };
  const hasText = () => state.front.some((l) => l.trim()) || state.back.some((l) => l.trim());

  /* ---------- gallery ---------- */
  const imgs = S.images;
  const dia = spec("diameter");
  function slides() {
    const f = state.finish;
    const list = [
      { id: "design", label: "Your design", live: true },
      { id: "front", label: "Front · polished", html: () => Pendant.render({ finish: f, view: "pendant", title: "Front of pendant" }) },
      { id: "back", label: "Back view", html: () => Pendant.render({ finish: f, view: "pendant", side: "back", title: "Back of pendant" }) },
      { id: "macro", label: "Mirror finish close-up", html: () => Pendant.render({ finish: f, view: "macro", title: "Polished mirror finish" }) },
      { id: "model", label: "Worn", html: () => Site.shot(imgs.onModel, "The necklace worn", "On model, collarbone close-up", { finish: f, view: "full" }), photo: !!imgs.onModel },
      { id: "chain", label: "Chain detail", html: () => Pendant.render({ finish: f, view: "chain", title: "Chain and bail detail" }) },
    ];
    if (hasValue(dia)) {
      list.push({
        id: "scale", label: "Scale",
        html: () => `<div class="scale-ref"><div class="scale-ref__inner">
          <div class="scale-ref__coin" style="width:110px">${Pendant.render({ finish: f, view: "pendant", chain: false })}<br>${esc(dia.value)} diameter${flag(dia)}</div>
          <div><div class="ruler" aria-hidden="true"></div><div class="scale-ref__coin" style="margin-top:8px">Illustrative scale</div></div></div></div>`,
      });
    }
    const pack = spec("packaging");
    if (imgs.packaging || (PREVIEW && pack)) {
      list.push({ id: "pack", label: "Packaging", html: () => Site.shot(imgs.packaging, "Packaging presentation", "Packaging — confirm before showing", { finish: f, view: "pendant" }), photo: !!imgs.packaging });
    }
    return list;
  }

  let current = 0;
  let SLIDES = [];
  function buildGallery() {
    SLIDES = slides();
    $("#gallery-main").innerHTML =
      SLIDES.map((s, i) => `<div class="gallery__slide ${i === current ? "is-active" : ""}" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${esc(s.label)}"><div class="zoomable">${s.live ? '<div id="live" style="width:100%;height:100%;display:grid;place-items:center"></div>' : s.html()}</div></div>`).join("") +
      `<span class="gallery__label" id="gallery-label">${esc(SLIDES[current].label)}</span>
       ${canBack ? `<div class="sides preview__toggle" role="tablist" aria-label="Preview side" id="live-sides"><button role="tab" data-side="front" aria-selected="${state.side === "front"}">Front</button><button role="tab" data-side="back" aria-selected="${state.side === "back"}">Back</button></div>` : ""}
       <button class="gallery__nav gallery__nav--prev" aria-label="Previous image">‹</button>
       <button class="gallery__nav gallery__nav--next" aria-label="Next image">›</button>`;
    $("#gallery-thumbs").innerHTML = SLIDES.map(
      (s, i) => `<button class="gallery__thumb" data-go="${i}" aria-label="${esc(s.label)}" aria-current="${i === current}">${s.live ? Pendant.render({ finish: state.finish, lines: state.front, font: fontById(state.font), view: "pendant", chain: false }) : s.html()}</button>`
    ).join("");
    $("#gallery-dots").innerHTML = SLIDES.map((s, i) => `<button data-go="${i}" aria-label="${esc(s.label)}" aria-current="${i === current}"></button>`).join("");
    renderLive(false);
  }
  function go(i) {
    current = (i + SLIDES.length) % SLIDES.length;
    $$(".gallery__slide").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.i) === current));
    $$("[data-go]").forEach((el) => el.setAttribute("aria-current", String(Number(el.dataset.go) === current)));
    $("#gallery-label").textContent = SLIDES[current].label;
    const sides = $("#live-sides");
    if (sides) sides.style.display = SLIDES[current].live ? "" : "none";
    $("#gallery-main").classList.remove("is-zoomed");
  }

  /* ---------- live preview ---------- */
  function renderLive(animate) {
    const host = $("#live");
    if (!host) return;
    const side = canBack ? state.side : "front";
    const lines = side === "back" ? state.back : state.front;
    const draw = () => {
      host.innerHTML = Pendant.render({
        finish: state.finish, lines, font: fontById(state.font), side, view: "full",
        placeholder: side === "back" ? "BACK" : canFront ? "YOUR TEXT" : "",
        title: `Preview of your necklace, ${side}`,
      });
    };
    if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.style.transition = "transform .35s ease";
      host.style.transform = "rotateY(90deg)";
      setTimeout(() => { draw(); host.style.transform = "rotateY(0)"; }, 340);
    } else draw();
    const mini = $("#mini-preview");
    if (mini) mini.innerHTML = Pendant.render({ finish: state.finish, lines, font: fontById(state.font), side, view: "pendant", chain: false });
    const t = $(".gallery__thumb[data-go='0']");
    if (t) t.innerHTML = Pendant.render({ finish: state.finish, lines: state.front, font: fontById(state.font), view: "pendant", chain: false });
  }

  /* ---------- controls ---------- */
  function stepNo() {
    let n = 0;
    return () => String(++n).padStart(2, "0");
  }

  function buildControls() {
    const next = stepNo();
    const parts = [];

    if (finishes.length) {
      parts.push(`<div class="opt">
        <div class="opt__head"><span class="label"><span class="step-n">${next()}</span> Finish</span><span class="opt__value" id="finish-value"></span></div>
        <div class="swatches" role="radiogroup" aria-label="Finish">
          ${finishes.map((f) => `<button class="swatch swatch--${f.id}" role="radio" data-finish="${f.id}" aria-checked="${f.id === state.finish}"><span class="swatch__dot"></span><span class="swatch__label">${esc(f.label)}${flag(f)}</span></button>`).join("")}
        </div></div>`);
    }

    if (canFront) {
      const lineInputs = (side, conf) =>
        Array.from({ length: conf.maxLines }, (_, i) => `
          <div class="engrave-line">
            <label class="sr-only" for="${side}-${i}">${side === "front" ? "Front" : "Back"} engraving, line ${i + 1}</label>
            <input class="input" id="${side}-${i}" data-side="${side}" data-line="${i}" maxlength="${conf.maxCharsPerLine}" autocomplete="off" autocapitalize="words" spellcheck="true"
              placeholder="${i === 0 ? (side === "front" ? "e.g. Isabella" : "e.g. 12.04.2019") : `Line ${i + 1} (optional)`}" value="${esc((side === "front" ? state.front : state.back)[i])}">
            <span class="count" data-count="${side}-${i}"></span>
          </div>`).join("");
      parts.push(`<div class="opt">
        <div class="opt__head"><span class="label"><span class="step-n">${next()}</span> Your engraving${flag(front)}</span><span class="opt__value">Up to ${front.maxLines} lines</span></div>
        ${canBack ? `<div class="sides" role="tablist" aria-label="Engraving side">
            <button role="tab" id="tab-front" aria-controls="panel-front" data-tab="front" aria-selected="true">Front</button>
            <button role="tab" id="tab-back" aria-controls="panel-back" data-tab="back" aria-selected="false">Back ${back.priceDelta ? `<small>+${money(back.priceDelta)}</small>` : ""}${flag(back)}</button>
          </div>` : ""}
        <div id="panel-front" role="tabpanel" aria-labelledby="tab-front"><div class="engrave-lines">${lineInputs("front", front)}</div>
          <div class="ideas" aria-label="Ideas">${["Name", "Initials", "Date", "A word"].map((x) => `<button type="button" data-idea="${x}">${x}</button>`).join("")}</div></div>
        ${canBack ? `<div id="panel-back" role="tabpanel" aria-labelledby="tab-back" hidden><div class="engrave-lines">${lineInputs("back", back)}</div>
          <p class="hint">The back is a lovely place for a date, a short message or coordinates.</p></div>` : ""}
        <p class="hint" id="char-hint" aria-live="polite">Letters, numbers and . , ’ &amp; - / # + : are supported. Leave blank for a plain polished pendant.</p>
      </div>`);
    }

    if (canFront && fonts.length > 1) {
      parts.push(`<div class="opt">
        <div class="opt__head"><span class="label"><span class="step-n">${next()}</span> Lettering</span><span class="opt__value" id="font-value"></span></div>
        <div class="fonts" role="radiogroup" aria-label="Lettering style">
          ${fonts.map((f) => `<button class="font-chip" role="radio" data-font="${f.id}" aria-checked="${f.id === state.font}"><span class="font-chip__sample" style="font-family:${esc(f.css)};font-weight:${f.weight}" data-sample="${f.id}"></span><span class="font-chip__name">${esc(f.label)}${flag(f)}</span></button>`).join("")}
        </div></div>`);
    }

    if (lengths.length) {
      parts.push(`<div class="opt">
        <div class="opt__head"><span class="label"><span class="step-n">${next()}</span> Chain length</span><span class="opt__value" id="length-value"></span></div>
        <div class="lengths" role="radiogroup" aria-label="Chain length">
          ${lengths.map((l) => `<button class="length-chip" role="radio" data-length="${l.id}" aria-checked="${l.id === state.length}"><strong>${esc(l.label)}${flag(l)}</strong>${l.detail ? `<span>${esc(l.detail)}</span>` : ""}${l.priceDelta ? `<span> +${money(l.priceDelta)}</span>` : ""}</button>`).join("")}
        </div></div>`);
    } else if (PREVIEW) {
      parts.push(`<div class="opt"><div class="opt__head"><span class="label"><span class="step-n">${next()}</span> Chain length</span></div>
        <p class="preview-note">Chain length selector appears here once lengths are confirmed with the supplier and added to <code>product.chainLengths</code>.</p></div>`);
    }

    if (visible(P.giftWrap) && P.giftWrap.available) {
      parts.push(`<div class="opt"><label class="confirm"><input type="checkbox" id="gift-wrap"> <span>${esc(P.giftWrap.label)}${P.giftWrap.priceDelta ? ` (+${money(P.giftWrap.priceDelta)})` : ""}${flag(P.giftWrap)}</span></label>
        ${visible(P.giftMessage) && P.giftMessage.available ? `<div class="field" style="margin:12px 0 0"><label for="gift-msg">Gift message (optional)</label><textarea class="input" id="gift-msg" maxlength="${P.giftMessage.maxChars}" style="min-height:90px"></textarea></div>` : ""}</div>`);
    }

    $("#controls").innerHTML = parts.join("");
  }

  /* ---------- summary & price ---------- */
  function renderSummary() {
    const c = cfg();
    const rows = describe(c).filter(([k]) => k !== "Personalisation ref");
    $("#summary-rows").innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("") + `<dt>Quantity</dt><dd>${state.qty}</dd>`;
    const total = unitPrice(c) * state.qty;
    const priceShown = visible(P.price);
    $("#summary-total").innerHTML = priceShown ? `<span>Total</span><strong>${money(total)}</strong>` : `<span>Total</span><strong>—</strong>`;
    $("#price").innerHTML = priceShown ? `${money(unitPrice(c))}${flag(P.price)} <small>incl. GST where applicable</small>` : "";
    $("#sticky-price").textContent = priceShown ? money(total) : "";
    const f = finishById(state.finish);
    $("#finish-value") && ($("#finish-value").textContent = f ? f.detail : "");
    const fo = fontById(state.font);
    $("#font-value") && ($("#font-value").textContent = fo ? fo.label : "");
    const l = lengths.find((x) => x.id === state.length);
    $("#length-value") && ($("#length-value").textContent = l ? l.label : "Select a length");
    $$("[data-sample]").forEach((el) => {
      const fontObj = fontById(el.dataset.sample);
      const txt = state.front.find((x) => x.trim()) || "Aa";
      el.textContent = fontObj.upper ? txt.toUpperCase() : txt;
    });
    $$("[data-count]").forEach((el) => {
      const [side, i] = el.dataset.count.split("-");
      const max = (side === "front" ? front : back).maxCharsPerLine;
      const n = (side === "front" ? state.front : state.back)[i].length;
      el.textContent = n ? `${n}/${max}` : "";
      el.classList.toggle("is-full", n >= max);
    });
    $("#qty-out").textContent = state.qty;
    $("#qty-dec").disabled = state.qty <= 1;
    $("#qty-inc").disabled = state.qty >= P.maxQuantity;

    // confirm wording + button state
    $("#confirm-text").textContent = hasText()
      ? "I’ve checked the spelling, spacing and dates of my engraving. It will be produced exactly as entered."
      : "I’d like a plain polished pendant with no engraving.";
    const blockers = [];
    if (lengths.length && !state.length) blockers.push("Choose a chain length");
    if (!state.confirmed) blockers.push("Please confirm your details");
    const ok = !blockers.length;
    ["#add", "#buy", "#sticky-add"].forEach((s) => ($(s).dataset.blocked = String(!ok)));
    $("#blocker").textContent = ok ? "" : blockers[0];
  }

  function update(opts = {}) {
    renderSummary();
    renderLive(opts.flip);
    saveDraft();
    if (opts.toDesign && current !== 0) go(0);
  }

  /* ---------- add to bag ---------- */
  function attemptAdd(then) {
    if (lengths.length && !state.length) {
      $(".lengths") && $(".lengths").scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Please choose a chain length");
      return;
    }
    if (!state.confirmed) {
      $("#confirm").scrollIntoView({ behavior: "smooth", block: "center" });
      $("#confirm-box").focus();
      toast("Please confirm your details first");
      return;
    }
    Cart.add(cfg(), state.qty);
    state.confirmed = false;
    $("#confirm-box").checked = false;
    renderSummary();
    then();
  }

  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("is-shown"), 2600);
  }

  /* ---------- events ---------- */
  function bind() {
    const root = $("#personalise");

    root.addEventListener("click", (e) => {
      const fin = e.target.closest("[data-finish]");
      if (fin) {
        state.finish = fin.dataset.finish;
        $$("[data-finish]").forEach((b) => b.setAttribute("aria-checked", String(b === fin)));
        buildGallery(); go(current); update({ toDesign: true });
      }
      const fo = e.target.closest("[data-font]");
      if (fo) {
        state.font = fo.dataset.font;
        $$("[data-font]").forEach((b) => b.setAttribute("aria-checked", String(b === fo)));
        update({ toDesign: true });
      }
      const le = e.target.closest("[data-length]");
      if (le) {
        state.length = le.dataset.length;
        $$("[data-length]").forEach((b) => b.setAttribute("aria-checked", String(b === le)));
        update();
      }
      const tab = e.target.closest("[data-tab]");
      if (tab) setSide(tab.dataset.tab, true);
      const idea = e.target.closest("[data-idea]");
      if (idea) {
        const ex = { Name: ["Isabella"], Initials: ["A · J"], Date: ["12.04.2019"], "A word": ["Always"] }[idea.dataset.idea];
        state.front = pad(ex, front.maxLines);
        $$("[data-side='front']").forEach((inp, i) => (inp.value = state.front[i]));
        setSide("front", false);
        update({ toDesign: true });
        $("#front-0").focus();
      }
    });

    root.addEventListener("input", (e) => {
      const inp = e.target.closest("[data-line]");
      if (inp) {
        const raw = inp.value;
        const clean = Array.from(raw).filter((ch) => allowed.test(ch)).join("").replace(/\s{2,}/g, " ");
        const hint = $("#char-hint");
        if (clean !== raw.replace(/\s{2,}/g, " ")) {
          hint.textContent = "Some characters can’t be engraved and were removed.";
          hint.classList.add("is-warn");
        } else {
          hint.textContent = "Letters, numbers and . , ’ & - / # + : are supported. Leave blank for a plain polished pendant.";
          hint.classList.remove("is-warn");
        }
        if (clean !== raw) inp.value = clean;
        (inp.dataset.side === "front" ? state.front : state.back)[inp.dataset.line] = clean;
        state.confirmed = false;
        $("#confirm-box").checked = false;
        if (canBack && state.side !== inp.dataset.side) { state.side = inp.dataset.side; syncSideButtons(); }
        update({ toDesign: true });
      }
      if (e.target.id === "gift-msg") { state.giftMessage = e.target.value; renderSummary(); }
    });
    root.addEventListener("change", (e) => {
      if (e.target.id === "gift-wrap") { state.giftWrap = e.target.checked; renderSummary(); }
      if (e.target.id === "confirm-box") { state.confirmed = e.target.checked; renderSummary(); }
    });
    root.addEventListener("keydown", (e) => {
      const inp = e.target.closest("[data-line]");
      if (inp && e.key === "Enter") {
        e.preventDefault();
        const nextInp = $(`[data-side='${inp.dataset.side}'][data-line='${Number(inp.dataset.line) + 1}']`);
        nextInp && nextInp.focus();
      }
    });

    $("#qty-dec").addEventListener("click", () => { state.qty = Math.max(1, state.qty - 1); renderSummary(); });
    $("#qty-inc").addEventListener("click", () => { state.qty = Math.min(P.maxQuantity, state.qty + 1); renderSummary(); });
    $("#add").addEventListener("click", () => attemptAdd(() => { openCart(); }));
    $("#buy").addEventListener("click", () => attemptAdd(() => checkout()));
    $("#sticky-add").addEventListener("click", () => attemptAdd(() => openCart()));

    // gallery
    const main = $("#gallery-main");
    document.addEventListener("click", (e) => {
      const g = e.target.closest("[data-go]");
      if (g) go(Number(g.dataset.go));
      const sd = e.target.closest("#live-sides [data-side]");
      if (sd) { e.stopPropagation(); setSide(sd.dataset.side, true); }
    });
    main.addEventListener("click", (e) => {
      if (e.target.closest(".gallery__nav--prev")) return go(current - 1);
      if (e.target.closest(".gallery__nav--next")) return go(current + 1);
      if (e.target.closest("#live-sides")) return;
      main.classList.toggle("is-zoomed");
    });
    main.addEventListener("mousemove", (e) => {
      if (!main.classList.contains("is-zoomed")) return;
      const r = main.getBoundingClientRect();
      const z = $(".is-active .zoomable", main);
      z && (z.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
    });
    main.addEventListener("mouseleave", () => main.classList.remove("is-zoomed"));
    let x0 = null;
    main.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    main.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { main.classList.remove("is-zoomed"); go(current + (dx < 0 ? 1 : -1)); }
      x0 = null;
    });
    main.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") go(current + 1);
      if (e.key === "ArrowLeft") go(current - 1);
    });

    // sticky bar + mini preview on mobile
    const sticky = $("#sticky-buy");
    const buyBtns = $(".buy-actions");
    const gallery = $(".gallery");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.target === buyBtns) sticky.classList.toggle("is-shown", !en.isIntersecting && en.boundingClientRect.top > 0);
        if (en.target === gallery) $("#mini-preview").classList.toggle("is-shown", !en.isIntersecting && en.boundingClientRect.top < 0);
      });
    });
    io.observe(buyBtns);
    io.observe(gallery);
    document.body.classList.add("has-sticky");
    $("#mini-preview").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function syncSideButtons() {
    $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === state.side)));
    $$("#live-sides [data-side]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.side === state.side)));
    const pf = $("#panel-front"), pb = $("#panel-back");
    if (pf && pb) { pf.hidden = state.side !== "front"; pb.hidden = state.side !== "back"; }
  }
  function setSide(side, flip) {
    if (!canBack) return;
    const changed = state.side !== side;
    state.side = side;
    syncSideButtons();
    if (current !== 0) go(0);
    if (changed) renderLive(flip);
  }

  /* ---------- static product info ---------- */
  function renderInfo() {
    $("#title").textContent = P.name;
    $("#intro").textContent = P.shortDescription;
    $$("[data-specs]").forEach((el) => (el.innerHTML = Site.specRows() || `<p class="muted">Full specifications will be published once confirmed.</p>`));

    const meta = [];
    meta.push(["Made to order — personalised for you", true]);
    const sp = S.shipping.processingTime, sd = S.shipping.deliveryTime;
    if (hasValue(sp)) meta.push([`Processing: ${esc(sp.value)}${flag(sp)}`]);
    if (hasValue(sd)) meta.push([`Delivery: ${esc(sd.value)}${flag(sd)}`]);
    if (hasValue(S.shipping.cost)) meta.push([`${esc(S.shipping.cost.value)}${flag(S.shipping.cost)}`]);
    meta.push([`Personalised pieces: <a href="delivery.html#returns" style="text-decoration:underline">returns policy</a>`]);
    $("#meta").innerHTML = meta.map(([t]) => `<li><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6"/></svg><span>${t}</span></li>`).join("");

    const shipRows = Content.shippingRows();
    const accItems = [
      ["Product details", `<dl class="specs" style="grid-template-columns:1fr">${Site.specRows() || ""}</dl>${Site.specRows() ? "" : "<p>Full specifications will be published once confirmed.</p>"}`],
      ["Personalisation guide", `<p>Enter up to ${front.maxLines} short lines. Names, initials, dates and single words look best. Shorter text is engraved larger.</p><p>Check spelling, spacing and the order of day and month in dates. Your engraving is produced exactly as entered.</p><p>The preview is a digital illustration. The finished engraving may vary slightly in size, spacing and depth.</p>`],
      ["Care", `<ul>${S.care.slice(0, 4).map((c) => `<li><strong>${esc(c.title)}.</strong> ${esc(c.body)}</li>`).join("")}</ul><p><a href="care.html" style="text-decoration:underline">Full care guide</a></p>`],
      ["Shipping & returns", `${shipRows.length ? `<p>${shipRows.map(([k, v]) => `<strong>${k}:</strong> ${esc(v.value)}${flag(v)}`).join("<br>")}</p>` : `<p>Delivery options and estimates are shown at checkout.</p>`}<p>${esc(S.policies.personalisedReturns)}</p><p><a href="delivery.html" style="text-decoration:underline">Shipping &amp; returns</a></p>`],
    ];
    $("#pdp-accordion").innerHTML = Site.accordion(accItems);

    const faqAll = Object.fromEntries(Content.faqGroups().flatMap(([, i]) => i));
    $("#pdp-faq").innerHTML = Site.accordion(
      ["What can I engrave?", "Can I engrave both sides?", "Will the final product look exactly like the preview?", "Can I change my personalisation after ordering?", "Can I return a personalised necklace?", "How long does delivery take?"]
        .filter((q) => faqAll[q]).map((q) => [q, faqAll[q]])
    );

    // Product structured data (no ratings until real reviews exist)
    const ld = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: P.name,
      description: P.description,
      brand: { "@type": "Brand", name: S.brand.name },
      material: hasValue(spec("pendantMaterial")) && spec("pendantMaterial").confirmed ? spec("pendantMaterial").value : undefined,
    };
    if (P.price.confirmed) {
      ld.offers = { "@type": "Offer", price: P.price.value, priceCurrency: S.currency, availability: "https://schema.org/MadeToOrder", url: location.href.split("#")[0] };
    }
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- boot ---------- */
  renderInfo();
  buildControls();
  buildGallery();
  bind();
  syncSideButtons();
  renderSummary();
  if (location.hash === "#personalise" && innerWidth > 920) setTimeout(() => $("#front-0") && $("#front-0").focus({ preventScroll: true }), 400);
})();
