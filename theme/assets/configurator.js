/* ==========================================================================
   HEELGUARD — product configurator + guided selector

   The configurator is the whole purchase decision, so it is built to be
   explicit: every selection restates what it means, availability is never
   hidden, and the outlet choice travels to the cart as a line-item property
   so the order tells the workshop exactly what to build.

   Prices arrive pre-formatted from Liquid — no money formatting in JS, so
   currency and locale can never drift from the store's own settings.
   ========================================================================== */
(function () {
  'use strict';

  function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function one(sel, ctx) { return (ctx || document).querySelector(sel); }
  function on(el, evt, fn) { if (el) el.addEventListener(evt, fn); }

  function parseJSON(el, fallback) {
    if (!el) return fallback;
    try { return JSON.parse(el.textContent); } catch (err) { return fallback; }
  }

  /* ====================================================== CONFIGURATOR ==== */
  all('[data-configurator]').forEach(function (root) {
    var variants = parseJSON(one('[data-cfg-variants]', root), []);
    var outletMap = parseJSON(one('[data-cfg-outlets]', root), {});
    if (!variants.length) return;

    var form = one('[data-cfg-form]', root);
    var idInput = one('[data-cfg-variant-id]', root);
    var outletInput = one('[data-cfg-outlet-input]', root);
    var priceEl = one('[data-cfg-price]', root);
    var skuEl = one('[data-cfg-sku]', root);
    var availEl = one('[data-cfg-availability]', root);
    var availDot = one('[data-cfg-dot]', root);
    var submitEl = one('[data-cfg-submit]', root);
    var outletWrap = one('[data-cfg-outlets-list]', root);
    var summaryEls = all('[data-cfg-summary]');
    var stickyPrice = one('[data-sticky-price]');
    var stickyConfig = one('[data-sticky-config]');

    var profileBtns = all('[data-cfg-profile]', root);
    var lengthBtns = all('[data-cfg-length]', root);

    var state = {
      profile: null,
      length: null,
      outlet: null
    };

    /* Seed from the current variant, then let the URL override it so a
       recommendation from the guided selector can link straight in. */
    var initial = variants.filter(function (v) { return v.available; })[0] || variants[0];
    state.profile = initial.profile;
    state.length = initial.length;

    var params = new URLSearchParams(window.location.search);
    if (params.get('profile')) state.profile = params.get('profile');
    if (params.get('length')) state.length = params.get('length');
    var wantedOutlet = params.get('outlet');

    function findVariant(profile, length) {
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].profile === profile && variants[i].length === length) return variants[i];
      }
      return null;
    }

    function lengthAvailableFor(profile, length) {
      var v = findVariant(profile, length);
      return !!(v && v.available);
    }

    function renderOutlets() {
      if (!outletWrap) return;
      var options = outletMap[state.profile] || [];

      if (!options.length) {
        outletWrap.innerHTML = '';
        return;
      }

      /* Keep the current choice when the new profile still offers it. */
      var keep = null;
      for (var i = 0; i < options.length; i++) {
        if (options[i].name === state.outlet) { keep = options[i].name; break; }
        if (wantedOutlet && options[i].name === wantedOutlet) { keep = options[i].name; }
      }
      state.outlet = keep || options[0].name;
      wantedOutlet = null;

      outletWrap.innerHTML = options.map(function (o) {
        var pressed = o.name === state.outlet;
        return '' +
          '<button class="opt-outlet" type="button" data-cfg-outlet="' + escapeAttr(o.name) + '"' +
          ' aria-pressed="' + pressed + '">' +
          '<span class="opt-outlet__radio" aria-hidden="true"></span>' +
          '<span class="opt-outlet__name">' + escapeHTML(o.name) + '</span>' +
          '<span class="opt-outlet__glyph" data-pos="' + escapeAttr(o.pos || 'centre') + '" aria-hidden="true"></span>' +
          (o.desc ? '<span class="opt-outlet__desc">' + escapeHTML(o.desc) + '</span>' : '') +
          '</button>';
      }).join('');

      all('[data-cfg-outlet]', outletWrap).forEach(function (btn) {
        on(btn, 'click', function () {
          state.outlet = btn.getAttribute('data-cfg-outlet');
          sync();
        });
      });
    }

    function escapeHTML(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function escapeAttr(str) { return escapeHTML(str); }

    function sync() {
      var variant = findVariant(state.profile, state.length);

      /* Profiles */
      profileBtns.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-cfg-profile') === state.profile ? 'true' : 'false');
      });

      /* Lengths — mark what this profile can actually supply rather than
         silently hiding it, so the customer can see the full range. */
      lengthBtns.forEach(function (btn) {
        var len = btn.getAttribute('data-cfg-length');
        btn.setAttribute('aria-pressed', len === state.length ? 'true' : 'false');
        btn.setAttribute('data-available', lengthAvailableFor(state.profile, len) ? 'true' : 'false');
      });

      /* Outlets */
      all('[data-cfg-outlet]', root).forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-cfg-outlet') === state.outlet ? 'true' : 'false');
      });

      /* Readouts */
      if (variant) {
        if (priceEl) priceEl.textContent = variant.price;
        if (skuEl) skuEl.textContent = variant.sku ? 'SKU ' + variant.sku : '';
        if (idInput) idInput.value = variant.id;
      }
      if (outletInput) outletInput.value = state.outlet || '';

      var available = !!(variant && variant.available);
      if (availEl) {
        availEl.textContent = available
          ? (availEl.getAttribute('data-label-available') || 'Available to order')
          : (availEl.getAttribute('data-label-unavailable') || 'Not available in this configuration — talk to us');
      }
      if (availDot) availDot.setAttribute('data-state', available ? 'in' : 'out');
      if (submitEl) {
        submitEl.disabled = !available;
        submitEl.textContent = available
          ? (submitEl.getAttribute('data-label-available') || 'Add to cart')
          : (submitEl.getAttribute('data-label-unavailable') || 'Unavailable');
      }

      /* Step value read-back — each step restates the decision in words. */
      var stepValues = {
        profile: state.profile,
        length: state.length,
        outlet: state.outlet
      };
      all('[data-cfg-step-value]', root).forEach(function (el) {
        var key = el.getAttribute('data-cfg-step-value');
        el.textContent = stepValues[key] || '—';
      });

      var summary = [state.profile, state.length, state.outlet].filter(Boolean).join(' · ');
      summaryEls.forEach(function (el) { el.textContent = summary; });
      if (stickyConfig) stickyConfig.textContent = summary;
      if (stickyPrice && variant) stickyPrice.textContent = variant.price;

      root.setAttribute('data-state-profile', state.profile || '');
      root.setAttribute('data-state-length', state.length || '');

      /* Keep any profile-specific drawing panel in step with the choice. */
      all('[data-profile-sync]').forEach(function (el) {
        el.hidden = el.getAttribute('data-profile-sync') !== state.profile;
      });
    }

    profileBtns.forEach(function (btn) {
      on(btn, 'click', function () {
        state.profile = btn.getAttribute('data-cfg-profile');
        renderOutlets();
        sync();
      });
    });

    lengthBtns.forEach(function (btn) {
      on(btn, 'click', function () {
        state.length = btn.getAttribute('data-cfg-length');
        sync();
      });
    });

    /* Guard the form: the outlet is a real manufacturing decision, so it must
       be present before anything reaches the cart. */
    on(form, 'submit', function (e) {
      var variant = findVariant(state.profile, state.length);
      if (!variant || !variant.available) {
        e.preventDefault();
        return;
      }
      if (outletInput && !outletInput.value) {
        e.preventDefault();
        var firstOutlet = one('[data-cfg-outlet]', root);
        if (firstOutlet) firstOutlet.focus();
      }
    });

    renderOutlets();
    sync();
  });

  /* ==================================================== GUIDED SELECTOR === */
  all('[data-wizard]').forEach(function (wiz) {
    var steps = parseJSON(one('[data-wiz-steps]', wiz), []);
    if (!steps.length) return;

    var rules = parseJSON(one('[data-wiz-rules]', wiz), {});
    var productUrl = wiz.getAttribute('data-product-url') || '';
    var bodyEl = one('[data-wiz-body]', wiz);
    var fillEl = one('[data-wiz-fill]', wiz);

    var index = 0;
    var answers = {};

    function progress() {
      var pct = Math.round((index / steps.length) * 100);
      if (fillEl) fillEl.style.width = pct + '%';
    }

    function recommend() {
      /* The recommendation is deliberately conservative: it maps the answers
         onto the published profile and outlet options and says plainly where a
         human should confirm. It never invents a length the store doesn't sell. */
      var width = answers.width;
      var profile = rules.width_to_profile && rules.width_to_profile[width]
        ? rules.width_to_profile[width]
        : rules.default_profile;

      var outletKey = answers.outlet;
      var outlets = (rules.profile_outlets && rules.profile_outlets[profile]) || [];
      var outlet = outlets[0] || '';
      if (outletKey === 'end') {
        for (var i = 0; i < outlets.length; i++) {
          if (/end/i.test(outlets[i])) { outlet = outlets[i]; break; }
        }
      }

      var length = answers.length || '';
      var needsHuman = (outletKey === 'end' && !/end/i.test(outlet)) || answers.length === 'unsure' || answers.application === 'other';

      return { profile: profile, outlet: outlet, length: length, needsHuman: needsHuman };
    }

    function renderResult() {
      var rec = recommend();
      var q = [];
      if (rec.profile) q.push('profile=' + encodeURIComponent(rec.profile));
      if (rec.length && rec.length !== 'unsure') q.push('length=' + encodeURIComponent(rec.length));
      if (rec.outlet) q.push('outlet=' + encodeURIComponent(rec.outlet));
      var href = productUrl + (q.length ? '?' + q.join('&') : '');

      if (fillEl) fillEl.style.width = '100%';

      bodyEl.innerHTML = '' +
        '<div class="wiz__result">' +
        '<div class="wiz__meta"><span class="label label--accent">Recommendation</span>' +
        '<button class="wiz__back" type="button" data-wiz-restart>Start again</button></div>' +
        '<p class="wiz__q">Based on your answers, start here.</p>' +
        '<div class="wiz__rec"><div class="wiz__rec-grid">' +
        '<div class="wiz__rec-item"><span class="wiz__rec-k">Profile</span><span class="wiz__rec-v">' +
        (rec.profile || '—') + '</span></div>' +
        '<div class="wiz__rec-item"><span class="wiz__rec-k">Length</span><span class="wiz__rec-v">' +
        (rec.length && rec.length !== 'unsure' ? rec.length : 'To confirm') + '</span></div>' +
        '<div class="wiz__rec-item"><span class="wiz__rec-k">Outlet</span><span class="wiz__rec-v" style="font-size:var(--fs-sm)">' +
        (rec.outlet || '—') + '</span></div>' +
        '</div></div>' +
        '<p class="wiz__caveat">' +
        (rec.needsHuman
          ? 'One of your answers needs a person to look at it — outlet position and unusual applications depend on your plumbing and floor construction. Send us your details before ordering.'
          : 'This is a starting point, not a specification. Confirm the outlet position and floor construction against your own plans, and check with your plumber before ordering.') +
        '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.75rem">' +
        (productUrl ? '<a class="btn" href="' + href + '">Open this configuration</a>' : '') +
        (wiz.getAttribute('data-help-url')
          ? '<a class="btn btn--ghost" href="' + wiz.getAttribute('data-help-url') + '">Have us check it</a>'
          : '') +
        '</div></div>';

      on(one('[data-wiz-restart]', bodyEl), 'click', function () {
        index = 0;
        answers = {};
        render();
      });
    }

    function render() {
      if (index >= steps.length) { renderResult(); return; }

      var step = steps[index];
      progress();

      var cols = step.options.length > 3 ? '2' : String(step.options.length);

      bodyEl.innerHTML = '' +
        '<div class="wiz__meta">' +
        '<span class="label label--accent">Step ' + (index + 1) + ' of ' + steps.length + '</span>' +
        (index > 0 ? '<button class="wiz__back" type="button" data-wiz-back>Back</button>' : '') +
        '</div>' +
        '<p class="wiz__q">' + step.question + '</p>' +
        (step.hint ? '<p class="wiz__hint">' + step.hint + '</p>' : '') +
        '<div class="wiz__options" data-cols="' + cols + '">' +
        step.options.map(function (o) {
          var pressed = answers[step.key] === o.value;
          return '<button class="wiz__opt" type="button" data-wiz-choose="' + o.value + '" aria-pressed="' + pressed + '">' +
            '<span class="wiz__opt-name">' + o.label + '</span>' +
            (o.desc ? '<span class="wiz__opt-desc">' + o.desc + '</span>' : '') +
            '</button>';
        }).join('') +
        '</div>';

      all('[data-wiz-choose]', bodyEl).forEach(function (btn) {
        on(btn, 'click', function () {
          answers[step.key] = btn.getAttribute('data-wiz-choose');
          index += 1;
          render();
        });
      });
      on(one('[data-wiz-back]', bodyEl), 'click', function () {
        index = Math.max(0, index - 1);
        render();
      });
    }

    render();
  });
})();
