/* Shared site behaviour: layout, verification helpers, cart, checkout. */
(function () {
  const S = window.STORE;
  const P = S.product;
  const PREVIEW = S.mode !== "live";

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Should this fact be shown to customers? */
  const visible = (item) => !!item && (PREVIEW || item.confirmed === true);
  /** Has a usable value and may be shown. */
  const hasValue = (item) => visible(item) && item.value !== null && item.value !== undefined && item.value !== "";
  /** ◇ marker for unconfirmed facts in preview mode. */
  const flag = (item) =>
    PREVIEW && item && !item.confirmed
      ? `<span class="tbc" title="Awaiting supplier confirmation — hidden in live mode" aria-label="awaiting confirmation">◇</span>`
      : "";

  const money = (n) =>
    new Intl.NumberFormat(S.locale, { style: "currency", currency: S.currency, minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

  const spec = (key) => P.specs.find((s) => s.key === key);
  const fontById = (id) => P.fonts.find((f) => f.id === id);
  const finishById = (id) => P.finishes.find((f) => f.id === id);
  const lengthById = (id) => P.chainLengths.find((l) => l.id === id);

  /* ---------- pricing ---------- */
  function unitPrice(cfg) {
    let p = P.price.value || 0;
    const fin = finishById(cfg.finish);
    if (fin) p += fin.priceDelta || 0;
    const len = lengthById(cfg.length);
    if (len) p += len.priceDelta || 0;
    if (cfg.back && cfg.back.some((l) => l && l.trim())) p += P.engraving.back.priceDelta || 0;
    if (cfg.giftWrap && P.giftWrap.available) p += P.giftWrap.priceDelta || 0;
    return p;
  }

  /* Short, stable reference code for a personalisation — printed on the order
     so the owner can match the preview to the fulfilment request. */
  function refCode(cfg) {
    const str = JSON.stringify([cfg.finish, cfg.font, cfg.length, cfg.front, cfg.back]);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return `${S.brand.monogram}-${(h >>> 0).toString(36).toUpperCase().slice(0, 6).padStart(6, "0")}`;
  }

  /* Human-readable order properties (sent to Shopify, shown in cart). */
  function describe(cfg) {
    const rows = [];
    const fin = finishById(cfg.finish);
    if (fin) rows.push(["Finish", fin.label]);
    const front = (cfg.front || []).filter((l) => l.trim());
    const back = (cfg.back || []).filter((l) => l.trim());
    rows.push(["Engraving – front", front.length ? front.join(" / ") : "None"]);
    if (P.engraving.back.enabled) rows.push(["Engraving – back", back.length ? back.join(" / ") : "None"]);
    const font = fontById(cfg.font);
    if (font && (front.length || back.length)) rows.push(["Engraving style", font.label]);
    const len = lengthById(cfg.length);
    if (len) rows.push(["Chain length", len.label]);
    if (cfg.giftWrap) rows.push(["Gift presentation", "Yes"]);
    if (cfg.giftMessage) rows.push(["Gift message", cfg.giftMessage]);
    rows.push(["Personalisation ref", refCode(cfg)]);
    return rows;
  }

  /* ---------- cart (persisted per browser) ---------- */
  const CART_KEY = "kc_cart_v1";
  const Cart = {
    read() {
      try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
    },
    write(items) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
      renderCart();
      updateCount();
    },
    add(cfg, qty) {
      const items = Cart.read();
      const key = refCode(cfg);
      const existing = items.find((i) => i.key === key);
      if (existing) existing.qty = Math.min(P.maxQuantity, existing.qty + qty);
      else items.push({ key, cfg, qty, added: Date.now() });
      Cart.write(items);
    },
    setQty(key, qty) {
      const items = Cart.read().map((i) => (i.key === key ? { ...i, qty } : i)).filter((i) => i.qty > 0);
      Cart.write(items);
    },
    total() {
      return Cart.read().reduce((s, i) => s + unitPrice(i.cfg) * i.qty, 0);
    },
    count() {
      return Cart.read().reduce((s, i) => s + i.qty, 0);
    },
  };

  /* ---------- checkout: Shopify cart hand-off ----------
     Posts a standard form to https://{shop}/cart/add with one line per
     necklace and personalisation as line-item properties, then redirects
     to Shopify checkout. Properties appear on the order in Shopify admin. */
  function checkout() {
    const items = Cart.read();
    if (!items.length) return;
    const shop = S.shopify.domain;
    const missing = items.some((i) => !S.shopify.variantIds[i.cfg.finish]);
    if (!shop || missing) {
      openModal(
        "Checkout isn’t connected yet",
        `<p>This is a pre-launch build. To take payments, add your Shopify store domain and variant IDs in <code>assets/js/store-config.js</code> → <code>shopify</code>. See <code>docs/FULFILMENT.md</code>.</p>
         <p>Here is exactly what would be sent with this order:</p>
         <pre class="order-dump">${esc(orderText(items))}</pre>
         <button class="btn btn--ghost" data-copy-order>Copy order details</button>`
      );
      const b = $("[data-copy-order]");
      b && b.addEventListener("click", () => navigator.clipboard && navigator.clipboard.writeText(orderText(items)).then(() => (b.textContent = "Copied")));
      return;
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://${shop}/cart/add`;
    const field = (name, value) => {
      const i = document.createElement("input");
      i.type = "hidden"; i.name = name; i.value = value;
      form.appendChild(i);
    };
    items.forEach((item, n) => {
      field(`items[${n}][id]`, S.shopify.variantIds[item.cfg.finish]);
      field(`items[${n}][quantity]`, item.qty);
      describe(item.cfg).forEach(([k, v]) => {
        if (k !== "Finish") field(`items[${n}][properties][${k}]`, v);
      });
    });
    field("return_to", "/checkout");
    document.body.appendChild(form);
    form.submit();
  }

  function orderText(items) {
    return items
      .map((i, n) =>
        [`#${n + 1}  ${P.name} × ${i.qty}  —  ${money(unitPrice(i.cfg) * i.qty)}`]
          .concat(describe(i.cfg).map(([k, v]) => `    ${k}: ${v}`))
          .join("\n")
      )
      .join("\n\n");
  }

  /* ---------- layout ---------- */
  const NAV = [
    ["The Necklace", "necklace.html"],
    ["Personalise", "necklace.html#personalise"],
    ["Our Story", "story.html"],
    ["Jewellery Care", "care.html"],
    ["FAQ", "faq.html"],
    ["Contact", "contact.html"],
  ];

  function header() {
    const here = location.pathname.split("/").pop() || "index.html";
    const link = ([label, href]) => `<a href="${href}" ${here === href ? 'aria-current="page"' : ""}>${label}</a>`;
    const left = NAV.slice(0, 3).map(link).join("");
    const right = NAV.slice(3).map(link).join("");
    return `
      ${PREVIEW ? `<div class="preview-bar" role="note">Pre-launch preview · details marked <span class="tbc">◇</span> await supplier confirmation and are hidden in live mode</div>` : ""}
      <header class="site-header">
        <div class="wrap site-header__inner">
          <button class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
            <span></span><span></span>
          </button>
          <nav class="nav nav--left" aria-label="Primary">${left}</nav>
          <a class="logo" href="index.html" aria-label="${esc(S.brand.name)} — home">${esc(S.brand.name)}</a>
          <div class="header-actions">
            <nav class="nav nav--right" aria-label="Help">${right}</nav>
            <a class="shop-link" href="necklace.html#personalise">Shop</a>
            <button class="icon-btn cart-toggle" aria-label="Open bag" aria-controls="cart">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>
              <span class="cart-count" aria-live="polite">0</span>
            </button>
          </div>
        </div>
        <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile" hidden>
          ${NAV.map(([l, h]) => `<a href="${h}">${l}</a>`).join("")}
          <a class="btn btn--dark" href="necklace.html#personalise">Create your necklace</a>
        </nav>
      </header>`;
  }

  function footer() {
    const soc = Object.entries(S.brand.social).filter(([, v]) => v);
    return `
      <footer class="site-footer">
        <div class="wrap footer-grid">
          <div class="footer-brand">
            <a class="logo logo--footer" href="index.html">${esc(S.brand.name)}</a>
            <p>${esc(S.brand.tagline)}</p>
            ${soc.length ? `<p class="social">${soc.map(([k, v]) => `<a href="${esc(v)}" rel="noopener">${k}</a>`).join("")}</p>` : ""}
          </div>
          <div>
            <h3>The Necklace</h3>
            <a href="necklace.html">The Necklace</a>
            <a href="necklace.html#personalise">Personalise</a>
            <a href="necklace.html#guide">Personalisation Guide</a>
            <a href="care.html">Jewellery Care</a>
          </div>
          <div>
            <h3>Help</h3>
            <a href="delivery.html">Shipping</a>
            <a href="delivery.html#returns">Returns</a>
            <a href="faq.html">FAQs</a>
            <a href="contact.html">Contact</a>
          </div>
          <div>
            <h3>About</h3>
            <a href="story.html">Our Story</a>
            <a href="privacy.html">Privacy Policy</a>
            <a href="terms.html">Terms &amp; Conditions</a>
          </div>
        </div>
        <div class="wrap footer-base">
          <span>© ${new Date().getFullYear()} ${esc(S.brand.name)}</span>
          <span>Prices in ${esc(S.currency)}</span>
        </div>
      </footer>
      <div class="scrim" hidden></div>
      <aside id="cart" class="cart-drawer" aria-label="Your bag" aria-hidden="true" tabindex="-1">
        <div class="cart-drawer__head">
          <h2>Your bag</h2>
          <button class="icon-btn cart-close" aria-label="Close bag">✕</button>
        </div>
        <div class="cart-drawer__body"></div>
        <div class="cart-drawer__foot"></div>
      </aside>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
        <div class="modal__card">
          <button class="icon-btn modal__close" aria-label="Close">✕</button>
          <h2 id="modal-title"></h2>
          <div class="modal__body"></div>
        </div>
      </div>`;
  }

  /* ---------- cart drawer ---------- */
  function renderCart() {
    const body = $(".cart-drawer__body");
    const foot = $(".cart-drawer__foot");
    if (!body) return;
    const items = Cart.read();
    if (!items.length) {
      body.innerHTML = `<div class="cart-empty"><p>Your bag is empty.</p><a class="btn btn--dark" href="necklace.html#personalise">Create your necklace</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = items
      .map((i) => {
        const font = fontById(i.cfg.font);
        const thumb = Pendant.render({ finish: i.cfg.finish, lines: i.cfg.front, font, view: "pendant", chain: false, title: "Your necklace" });
        return `<article class="cart-item">
          <div class="cart-item__thumb">${thumb}</div>
          <div class="cart-item__info">
            <h3>${esc(P.name)}</h3>
            <dl>${describe(i.cfg).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
            <div class="cart-item__row">
              <div class="qty qty--sm" role="group" aria-label="Quantity">
                <button data-qty="${i.key}" data-d="-1" aria-label="Decrease">−</button>
                <span>${i.qty}</span>
                <button data-qty="${i.key}" data-d="1" aria-label="Increase" ${i.qty >= P.maxQuantity ? "disabled" : ""}>+</button>
              </div>
              <strong>${money(unitPrice(i.cfg) * i.qty)}</strong>
            </div>
            <button class="link-btn" data-remove="${i.key}">Remove</button>
          </div>
        </article>`;
      })
      .join("");
    const ship = S.shipping;
    foot.innerHTML = `
      <div class="cart-total"><span>Subtotal</span><strong>${money(Cart.total())}</strong></div>
      <p class="fine">${hasValue(ship.cost) ? esc(ship.cost.value) + flag(ship.cost) : "Shipping calculated at checkout."}</p>
      <p class="fine">Personalised pieces are made to order. Please check every detail before checkout.</p>
      <button class="btn btn--dark btn--block" data-checkout>Checkout</button>`;
  }

  function updateCount() {
    $$(".cart-count").forEach((el) => {
      const c = Cart.count();
      el.textContent = c;
      el.dataset.empty = c ? "false" : "true";
    });
  }

  let lastFocus = null;
  function openCart() {
    renderCart();
    lastFocus = document.activeElement;
    $("#cart").classList.add("is-open");
    $("#cart").setAttribute("aria-hidden", "false");
    $(".scrim").hidden = false;
    document.body.classList.add("no-scroll");
    $("#cart").focus();
  }
  function closeCart() {
    $("#cart").classList.remove("is-open");
    $("#cart").setAttribute("aria-hidden", "true");
    $(".scrim").hidden = true;
    document.body.classList.remove("no-scroll");
    lastFocus && lastFocus.focus && lastFocus.focus();
  }

  function openModal(title, html) {
    const m = $(".modal");
    $("#modal-title").textContent = title;
    $(".modal__body", m).innerHTML = html;
    m.hidden = false;
    document.body.classList.add("no-scroll");
    $(".modal__close", m).focus();
  }
  function closeModal() {
    $(".modal").hidden = true;
    if (!$("#cart").classList.contains("is-open")) document.body.classList.remove("no-scroll");
  }

  /* ---------- shared components ---------- */
  function initAccordions(root = document) {
    $$(".accordion__btn", root).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        panel.style.maxHeight = open ? "0px" : panel.scrollHeight + "px";
        panel.classList.toggle("is-open", !open);
      });
    });
  }

  let accId = 0;
  function accordion(items) {
    return `<div class="accordion">${items
      .map(([q, a]) => {
        const id = "acc" + ++accId;
        return `<div class="accordion__item">
          <h3><button class="accordion__btn" aria-expanded="false" aria-controls="${id}">${q}<span aria-hidden="true"></span></button></h3>
          <div id="${id}" class="accordion__panel" role="region"><div class="accordion__inner">${a}</div></div>
        </div>`;
      })
      .join("")}</div>`;
  }

  function initReveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
  }

  /* Image slot: real photo if configured, otherwise the illustration. */
  function shot(src, alt, brief, fallbackOpts) {
    if (src) return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
    return `<div class="shot-illus">${Pendant.render(fallbackOpts || { finish: "steel" })}${
      PREVIEW && brief ? `<span class="shot-brief">Photo slot · ${esc(brief)}</span>` : ""
    }</div>`;
  }

  /* Render spec rows (only those with values that may be shown). */
  function specRows() {
    return P.specs
      .filter(hasValue)
      .map((s) => `<div class="spec"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}${flag(s)}</dd></div>`)
      .join("");
  }

  /* ---------- boot ---------- */
  function boot() {
    document.body.insertAdjacentHTML("afterbegin", header());
    document.body.insertAdjacentHTML("beforeend", footer());
    $$("[data-brand]").forEach((el) => (el.textContent = S.brand.name));

    const toggle = $(".menu-toggle");
    const mnav = $("#mobile-nav");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mnav.hidden = open;
      document.body.classList.toggle("nav-open", !open);
    });
    mnav.addEventListener("click", (e) => e.target.closest("a") && toggle.click());

    $$(".cart-toggle").forEach((b) => b.addEventListener("click", openCart));
    $(".cart-close").addEventListener("click", closeCart);
    $(".scrim").addEventListener("click", closeCart);
    $(".modal__close").addEventListener("click", closeModal);
    $(".modal").addEventListener("click", (e) => e.target.classList.contains("modal") && closeModal());
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!$(".modal").hidden) closeModal();
      else if ($("#cart").classList.contains("is-open")) closeCart();
    });

    $("#cart").addEventListener("click", (e) => {
      const q = e.target.closest("[data-qty]");
      if (q) {
        const item = Cart.read().find((i) => i.key === q.dataset.qty);
        if (item) Cart.setQty(item.key, Math.min(P.maxQuantity, item.qty + Number(q.dataset.d)));
      }
      const r = e.target.closest("[data-remove]");
      if (r) Cart.setQty(r.dataset.remove, 0);
      if (e.target.closest("[data-checkout]")) checkout();
    });

    const onScroll = () => document.body.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    window.addEventListener("storage", (e) => e.key === CART_KEY && (renderCart(), updateCount()));
    updateCount();
    initAccordions();
    initReveal();
  }

  window.Site = {
    S, P, PREVIEW, $, $$, esc, visible, hasValue, flag, money, spec, fontById, finishById, lengthById,
    unitPrice, refCode, describe, Cart, openCart, openModal, checkout, accordion, initAccordions, initReveal, shot, specRows,
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
