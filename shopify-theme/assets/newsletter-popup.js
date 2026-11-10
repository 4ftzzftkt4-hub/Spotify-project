/* Welcome pop-up: shows once, after a delay or a third of a scroll; never over the bag or checkout steps. */
(function () {
  const pop = document.getElementById("nl-popup");
  if (!pop) return;
  const KEY = "kc_nl_popup";
  const delay = (Number(pop.dataset.delay) || 10) * 1000;
  const snooze = (Number(pop.dataset.snoozeDays) || 14) * 864e5;
  const success = !!pop.querySelector("[data-nl-success]");
  const hasError = !!pop.querySelector(".nl-popup__error");
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(read(), v))); } catch (e) {} };

  let lastFocus;
  function open() {
    if (!pop.hidden) return;
    lastFocus = document.activeElement;
    pop.hidden = false;
    requestAnimationFrame(() => pop.classList.add("is-open"));
    document.body.classList.add("nl-open");
    const f = pop.querySelector("#nl-email") || pop.querySelector("[data-nl-copy]") || pop.querySelector(".nl-popup__close");
    setTimeout(() => f && f.focus({ preventScroll: true }), 50);
  }
  function close() {
    pop.classList.remove("is-open");
    document.body.classList.remove("nl-open");
    setTimeout(() => (pop.hidden = true), 250);
    if (!success) write({ dismissedAt: Date.now() });
    lastFocus && lastFocus.focus && lastFocus.focus();
  }

  pop.addEventListener("click", (e) => { if (e.target.closest("[data-nl-close]")) close(); });
  document.addEventListener("keydown", (e) => {
    if (pop.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // keep focus inside the dialog
      const f = [...pop.querySelectorAll("a[href], button, input")].filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  const copy = pop.querySelector("[data-nl-copy]");
  copy && copy.addEventListener("click", () => {
    const code = document.getElementById("nl-code").textContent.trim();
    const done = () => (copy.textContent = "Copied");
    navigator.clipboard ? navigator.clipboard.writeText(code).then(done, () => {}) : done();
  });

  // Just signed up (or the form needs fixing): open straight away.
  if (success) { write({ subscribed: true }); open(); return; }
  if (hasError) { open(); return; }
  if (pop.dataset.designMode === "true") return; // don't pop up inside the theme editor

  const state = read();
  if (state.subscribed) return;
  if (state.dismissedAt && Date.now() - state.dismissedAt < snooze) return;
  if (/^\/(cart|checkout|account)/.test(location.pathname)) return;

  let fired = false;
  const tryOpen = () => {
    if (fired) return;
    // wait while the bag is open or the customer is mid-personalisation
    if (document.body.classList.contains("no-scroll") || (document.activeElement && document.activeElement.matches("input, textarea"))) {
      setTimeout(tryOpen, 4000); return;
    }
    fired = true; open();
  };
  setTimeout(tryOpen, delay);
  addEventListener("scroll", function onS() {
    if (scrollY > document.body.scrollHeight * 0.33) { removeEventListener("scroll", onS); setTimeout(tryOpen, 600); }
  }, { passive: true });

  // Theme editor: show the pop-up when its settings are selected
  document.addEventListener("shopify:section:select", (e) => { if (e.target.contains(pop)) open(); });
  document.addEventListener("shopify:section:deselect", (e) => { if (e.target.contains(pop)) close(); });
})();
