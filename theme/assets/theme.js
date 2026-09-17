/* ==========================================================================
   HEELGUARD — core behaviour
   Progressive enhancement only: every control works or degrades gracefully.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- utilities */
  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts); }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function one(sel, ctx) { return (ctx || document).querySelector(sel); }

  function trapFocus(container, previouslyFocused) {
    var selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    function keydown(e) {
      if (e.key !== 'Tab') return;
      var items = all(selector, container).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', keydown);
    return function release() {
      container.removeEventListener('keydown', keydown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  /* ------------------------------------------------------- mobile nav drawer */
  (function navDrawer() {
    var drawer = one('[data-drawer]');
    if (!drawer) return;
    var release = null;

    function open(trigger) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      release = trapFocus(drawer, trigger);
      var firstLink = one('.drawer__link, .drawer__group summary', drawer);
      if (firstLink) firstLink.focus();
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      lockScroll(false);
      if (release) { release(); release = null; }
    }

    all('[data-drawer-open]').forEach(function (btn) {
      on(btn, 'click', function () {
        btn.setAttribute('aria-expanded', 'true');
        open(btn);
      });
    });
    all('[data-drawer-close]').forEach(function (btn) { on(btn, 'click', close); });
    on(drawer, 'click', function (e) { if (e.target.hasAttribute('data-drawer-close')) close(); });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        close();
        all('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      }
    });
  })();

  /* ---------------------------------------------------------- floating help */
  (function floatingHelp() {
    var help = one('[data-fhelp]');
    if (!help) return;
    var toggle = one('[data-fhelp-toggle]', help);
    var panel = one('[data-fhelp-panel]', help);

    function setOpen(state) {
      help.classList.toggle('is-open', state);
      if (toggle) toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
      if (panel) panel.setAttribute('aria-hidden', state ? 'false' : 'true');
      if (state && panel) {
        var first = one('a, button', panel);
        if (first) first.focus();
      }
    }
    on(toggle, 'click', function () { setOpen(!help.classList.contains('is-open')); });
    all('[data-fhelp-close]', help).forEach(function (b) {
      on(b, 'click', function () { setOpen(false); if (toggle) toggle.focus(); });
    });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && help.classList.contains('is-open')) { setOpen(false); if (toggle) toggle.focus(); }
    });
    on(document, 'click', function (e) {
      if (help.classList.contains('is-open') && !help.contains(e.target)) setOpen(false);
    });
  })();

  /* --------------------------------------------------------- scroll reveal */
  (function reveal() {
    var targets = all('.reveal');
    if (!targets.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        window.setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ----------------------------------------------------------- tab groups */
  (function tabs() {
    all('[data-tabs]').forEach(function (group) {
      var tabs = all('[role="tab"]', group);
      if (!tabs.length) return;

      function select(idx, focus) {
        tabs.forEach(function (tab, i) {
          var selected = i === idx;
          tab.setAttribute('aria-selected', selected ? 'true' : 'false');
          tab.setAttribute('tabindex', selected ? '0' : '-1');
          var panel = document.getElementById(tab.getAttribute('aria-controls'));
          if (panel) panel.hidden = !selected;
        });
        if (focus) tabs[idx].focus();
      }

      tabs.forEach(function (tab, i) {
        on(tab, 'click', function () { select(i); });
        on(tab, 'keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
          if (e.key === 'Home') next = 0;
          if (e.key === 'End') next = tabs.length - 1;
          if (next !== null) { e.preventDefault(); select(next, true); }
        });
      });
      select(0);
    });
  })();

  /* ---------------------------------------------- product image gallery */
  (function gallery() {
    all('[data-gallery]').forEach(function (gal) {
      var slidesEl = one('[data-gal-slides]', gal);
      if (!slidesEl) return;
      var slides = all('[data-gal-slide]', slidesEl);
      var thumbs = all('[data-gal-thumb]', gal);
      var dots = all('[data-gal-dot]', gal);
      var prev = one('[data-gal-prev]', gal);
      var next = one('[data-gal-next]', gal);
      var current = 0;

      function mark(idx) {
        current = idx;
        thumbs.forEach(function (t, i) { t.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
        dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx === slides.length - 1;
      }

      function goTo(idx) {
        if (idx < 0 || idx >= slides.length) return;
        slidesEl.scrollTo({ left: slides[idx].offsetLeft - slidesEl.offsetLeft, behavior: prefersReduced ? 'auto' : 'smooth' });
        mark(idx);
      }

      thumbs.forEach(function (t, i) { on(t, 'click', function () { goTo(i); }); });
      dots.forEach(function (d, i) { on(d, 'click', function () { goTo(i); }); });
      on(prev, 'click', function () { goTo(current - 1); });
      on(next, 'click', function () { goTo(current + 1); });

      var raf = null;
      on(slidesEl, 'scroll', function () {
        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(function () {
          var mid = slidesEl.scrollLeft + slidesEl.clientWidth / 2;
          var nearest = 0, best = Infinity;
          slides.forEach(function (s, i) {
            var c = s.offsetLeft - slidesEl.offsetLeft + s.clientWidth / 2;
            var d = Math.abs(c - mid);
            if (d < best) { best = d; nearest = i; }
          });
          mark(nearest);
        });
      }, { passive: true });

      mark(0);

      /* Lightbox zoom */
      var lightbox = one('[data-lightbox]');
      if (lightbox) {
        var lbImg = one('[data-lightbox-img]', lightbox);
        var lbCap = one('[data-lightbox-cap]', lightbox);
        var lbRelease = null;

        function openLb(src, alt, cap) {
          if (lbImg) { lbImg.src = src; lbImg.alt = alt || ''; }
          if (lbCap) lbCap.textContent = cap || '';
          lightbox.classList.add('is-open');
          lightbox.setAttribute('aria-hidden', 'false');
          lockScroll(true);
          lbRelease = trapFocus(lightbox, document.activeElement);
          var close = one('[data-lightbox-close]', lightbox);
          if (close) close.focus();
        }
        function closeLb() {
          lightbox.classList.remove('is-open');
          lightbox.setAttribute('aria-hidden', 'true');
          lockScroll(false);
          if (lbRelease) { lbRelease(); lbRelease = null; }
        }
        all('[data-gal-zoom]', gal).forEach(function (btn) {
          on(btn, 'click', function () {
            var slide = slides[current];
            var img = slide ? one('img', slide) : null;
            if (!img) return;
            openLb(img.getAttribute('data-zoom-src') || img.currentSrc || img.src, img.alt, slide.getAttribute('data-caption'));
          });
        });
        all('[data-lightbox-close]', lightbox).forEach(function (b) { on(b, 'click', closeLb); });
        on(lightbox, 'click', function (e) { if (e.target === lightbox) closeLb(); });
        on(document, 'keydown', function (e) { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLb(); });
      }
    });
  })();

  /* ------------------------------------------------------- sticky mobile ATC */
  (function stickyAtc() {
    var bar = one('[data-sticky-atc]');
    var anchor = one('[data-atc-anchor]');
    if (!bar || !anchor) return;
    document.body.classList.add('has-sticky-atc');

    if (!('IntersectionObserver' in window)) { bar.classList.add('is-visible'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { bar.classList.toggle('is-visible', !e.isIntersecting); });
    }, { rootMargin: '-40% 0px 0px 0px' });
    io.observe(anchor);
  })();

  /* ------------------------------------------------ before-you-buy checklist */
  (function checklist() {
    all('[data-checklist]').forEach(function (list) {
      var key = 'hg:checklist:' + (list.getAttribute('data-checklist') || 'default');
      var boxes = all('input[type="checkbox"]', list);
      var counter = one('[data-checklist-count]', list.closest('[data-checklist-scope]') || document);
      var saved = {};
      try { saved = JSON.parse(window.localStorage.getItem(key) || '{}'); } catch (err) { saved = {}; }

      function update() {
        var done = boxes.filter(function (b) { return b.checked; }).length;
        if (counter) counter.textContent = done + ' / ' + boxes.length;
        var state = {};
        boxes.forEach(function (b) { state[b.value] = b.checked; });
        try { window.localStorage.setItem(key, JSON.stringify(state)); } catch (err) { /* private mode */ }
      }

      boxes.forEach(function (b) {
        if (saved[b.value]) b.checked = true;
        on(b, 'change', update);
      });
      update();
    });
  })();

  /* ---------------------------------------------------------- quantity steppers */
  (function qty() {
    all('[data-qty]').forEach(function (wrap) {
      var input = one('input', wrap);
      if (!input) return;
      all('[data-qty-step]', wrap).forEach(function (btn) {
        on(btn, 'click', function () {
          var step = parseInt(btn.getAttribute('data-qty-step'), 10) || 1;
          var min = parseInt(input.getAttribute('min') || '1', 10);
          var value = (parseInt(input.value, 10) || min) + step;
          input.value = Math.max(min, value);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  })();

  /* ------------------------------------------------------- form validation */
  (function forms() {
    all('[data-validate]').forEach(function (form) {
      on(form, 'submit', function (e) {
        var invalid = null;
        all('[required]', form).forEach(function (field) {
          var ok = field.checkValidity();
          field.setAttribute('aria-invalid', ok ? 'false' : 'true');
          var msg = form.querySelector('[data-error-for="' + field.name + '"]');
          if (msg) msg.textContent = ok ? '' : (field.getAttribute('data-error') || 'This field is required.');
          if (!ok && !invalid) invalid = field;
        });
        if (invalid) { e.preventDefault(); invalid.focus(); }
      });
    });
  })();

  /* ------------------------------------------------- header scroll state */
  (function headerState() {
    var header = one('[data-header]');
    if (!header) return;
    var last = 0;
    function check() {
      var y = window.scrollY || 0;
      if ((y > 8) !== (last > 8)) header.classList.toggle('is-scrolled', y > 8);
      last = y;
    }
    on(window, 'scroll', check, { passive: true });
    check();
  })();

  /* ------------------------------ single-open accordions within a group */
  (function exclusiveDisclosures() {
    all('[data-accordion-exclusive]').forEach(function (group) {
      var items = all('details', group);
      items.forEach(function (d) {
        on(d, 'toggle', function () {
          if (!d.open) return;
          items.forEach(function (other) { if (other !== d) other.open = false; });
        });
      });
    });
  })();
})();
