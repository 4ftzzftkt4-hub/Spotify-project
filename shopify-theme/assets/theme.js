/* Keep Close theme — shared behaviour: Shopify cart drawer, menus, accordions, reveal. */
(function () {
  const S = window.STORE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Shopify money format, e.g. "${{amount}}" — amounts are in cents. */
  function money(cents) {
    const fmt = S.moneyFormat || "${{amount}}";
    const n = (cents || 0) / 100;
    const two = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const none = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) =>
      k === "amount_no_decimals" ? none : k === "amount_with_comma_separator" ? two.replace(".", ",") : two);
  }

  function toast(msg) {
    const t = $(".toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-shown");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("is-shown"), 2800);
  }

  /* ---------- cart ---------- */
  async function getCart() { return (await fetch("/cart.js", { headers: { Accept: "application/json" } })).json(); }
  async function addToCart(item) {
    const r = await fetch("/cart/add.js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ items: [item] }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.description || data.message || "Couldn’t add to bag");
    await renderCart();
    return data;
  }
  async function changeLine(line, quantity) {
    const r = await fetch("/cart/change.js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ line, quantity }) });
    if (!r.ok) toast("Couldn’t update your bag");
    await renderCart();
  }

  /* Save a proof link for every personalised necklace on the order.
     Cart attributes appear in Shopify admin -> Orders -> Additional details;
     customers don't see them. */
  async function syncProofs(cart) {
    const lines = cart.items.filter((it) => it.properties && it.properties._finish).map((it) => {
      const p = it.properties;
      const q = new URLSearchParams({ ref: p["Personalisation ref"] || "", finish: p._finish, font: p._font || "", front: p._front || "[]", back: p._back || "[]" });
      const opt = (it.options_with_values || []).map((o) => o.value).join(" ");
      return `${p["Personalisation ref"] || "Necklace"} (${opt} x${it.quantity}): ${location.origin}/pages/engraving-proof?${q}`;
    });
    const want = lines.join("\n");
    const have = (cart.attributes && cart.attributes["Engraving proofs"]) || "";
    if (want === have) return;
    try {
      await fetch("/cart/update.js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ attributes: { "Engraving proofs": want } }) });
    } catch (e) {}
  }

  async function renderCart() {
    const body = $(".cart-drawer__body"), foot = $(".cart-drawer__foot");
    if (!body) return;
    const cart = await getCart();
    syncProofs(cart);
    $$(".cart-count").forEach((el) => { el.textContent = cart.item_count; el.dataset.empty = String(!cart.item_count); });
    if (!cart.items.length) {
      body.innerHTML = `<div class="cart-empty"><p>Your bag is empty.</p><a class="btn btn--dark" href="${esc((S.productUrl || "/collections/all") + "#personalise")}">Create your necklace</a></div>`;
      foot.innerHTML = ""; return;
    }
    body.innerHTML = cart.items.map((it, i) => {
      const p = it.properties || {};
      let front = [];
      try { front = JSON.parse(p._front || "[]"); } catch (e) {}
      const thumb = p._finish
        ? `<div class="engrave-host" data-engrave="${esc(JSON.stringify({ finish: p._finish, lines: front, font: p._font, zoom: 2.2 }))}"></div>`
        : it.image ? `<img src="${esc(it.image)}" alt="">` : "";
      const props = Object.entries(p).filter(([k, v]) => k[0] !== "_" && v);
      const opts = (it.options_with_values || []).filter((o) => o.value !== "Default Title");
      return `<article class="cart-item">
        <div class="cart-item__thumb">${thumb}</div>
        <div class="cart-item__info">
          <h3>${esc(it.product_title)}</h3>
          <dl>${opts.map((o) => `<dt>${esc(o.name)}</dt><dd>${esc(o.value)}</dd>`).join("")}${props.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          <div class="cart-item__row">
            <div class="qty qty--sm" role="group" aria-label="Quantity">
              <button type="button" data-line="${i + 1}" data-q="${it.quantity - 1}" aria-label="Decrease">−</button><span>${it.quantity}</span><button type="button" data-line="${i + 1}" data-q="${it.quantity + 1}" aria-label="Increase">+</button>
            </div>
            <strong>${money(it.final_line_price)}</strong>
          </div>
          <button type="button" class="link-btn" data-line="${i + 1}" data-q="0">Remove</button>
        </div></article>`;
    }).join("");
    window.Engrave && Engrave.mountAll(body);
    foot.innerHTML = `
      <div class="cart-total"><span>Subtotal</span><strong>${money(cart.total_price)}</strong></div>
      <p class="fine">${esc(S.shippingNote || "Shipping calculated at checkout.")}</p>
      <p class="fine">Personalised pieces are made to order. Please check every detail before checkout.</p>
      <a class="btn btn--dark btn--block" href="/checkout">Checkout</a>`;
  }

  let lastFocus;
  async function openCart() {
    lastFocus = document.activeElement;
    await renderCart();
    $("#cart").classList.add("is-open"); $("#cart").setAttribute("aria-hidden", "false");
    $(".scrim").hidden = false; document.body.classList.add("no-scroll"); $("#cart").focus();
  }
  function closeCart() {
    $("#cart").classList.remove("is-open"); $("#cart").setAttribute("aria-hidden", "true");
    $(".scrim").hidden = true; document.body.classList.remove("no-scroll");
    lastFocus && lastFocus.focus && lastFocus.focus();
  }

  /* ---------- shared UI ---------- */
  function initAccordions(root = document) {
    $$(".accordion__btn", root).forEach((btn) => {
      if (btn.dataset.bound) return; btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        panel.style.maxHeight = open ? "0px" : panel.scrollHeight + "px";
      });
    });
  }
  function initReveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches || window.Shopify && Shopify.designMode) {
      els.forEach((e) => e.classList.add("is-in")); return;
    }
    const io = new IntersectionObserver((ents) => ents.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  function boot() {
    const toggle = $(".menu-toggle"), mnav = $("#mobile-nav");
    toggle && toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open)); mnav.hidden = open; document.body.classList.toggle("nav-open", !open);
    });
    $$(".cart-toggle").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openCart(); }));
    $(".cart-close") && $(".cart-close").addEventListener("click", closeCart);
    $(".scrim") && $(".scrim").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => e.key === "Escape" && $("#cart").classList.contains("is-open") && closeCart());
    $("#cart") && $("#cart").addEventListener("click", (e) => {
      const b = e.target.closest("[data-line]"); if (b) changeLine(Number(b.dataset.line), Math.max(0, Number(b.dataset.q)));
    });
    const onScroll = () => document.body.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    initAccordions(); initReveal();
    window.Engrave && Engrave.mountAll(document);
    getCart().then((c) => c.item_count && syncProofs(c)).catch(() => {});
  }

  // Theme editor: re-run when a section is added or changed
  document.addEventListener("shopify:section:load", (e) => { initAccordions(e.target); window.Engrave && Engrave.mountAll(e.target); $$("[data-reveal]", e.target).forEach((x) => x.classList.add("is-in")); });

  window.Theme = { money, toast, addToCart, openCart, renderCart, initAccordions };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
