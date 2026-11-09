/* Photo engraving preview.
   Draws the customer's text onto a real product photo of the blank disc,
   following the disc's perspective, with a frosted laser-etched finish.
   Base photos and disc positions live in STORE.images.engraveBase. */
(function () {
  const S = window.STORE;
  const BASES = (S.images && S.images.engraveBase) || {};
  const INK = {
    steel: { ink: "rgba(78,82,88,.9)", lift: "rgba(255,255,255,.55)" },
    gold: { ink: "rgba(112,78,28,.85)", lift: "rgba(255,246,220,.5)" },
    rose: { ink: "rgba(118,64,50,.85)", lift: "rgba(255,240,234,.5)" },
  };
  const imgCache = {};
  let grain;

  function loadImg(src) {
    if (!imgCache[src]) {
      imgCache[src] = new Promise((res, rej) => {
        const i = new Image();
        i.decoding = "async";
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });
    }
    return imgCache[src];
  }

  function getGrain() {
    if (grain) return grain;
    grain = document.createElement("canvas");
    grain.width = grain.height = 128;
    const g = grain.getContext("2d");
    const d = g.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return grain;
  }

  function fontById(id) {
    return (S.product.fonts || []).find((f) => f.id === id) || S.product.fonts[0];
  }

  /* Draw one frame. ctx canvas is w×h device pixels. */
  function draw(ctx, w, h, img, base, opts) {
    const back = opts.side === "back";
    const zoom = opts.zoom || 1;
    // cover-fit the square photo, optionally zoomed toward the disc
    const s = Math.max(w / img.width, h / img.height) * zoom;
    const dw = img.width * s, dh = img.height * s;
    const bcx = back ? 1 - base.cx : base.cx;
    let ox = (w - dw) / 2, oy = (h - dh) / 2;
    if (zoom > 1) {
      ox = w / 2 - bcx * dw;
      oy = h / 2 - base.cy * dh;
      ox = Math.min(0, Math.max(w - dw, ox));
      oy = Math.min(0, Math.max(h - dh, oy));
    }
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (back) { ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(img, w - ox - dw, oy, dw, dh); }
    else ctx.drawImage(img, ox, oy, dw, dh);
    ctx.restore();

    const cx = ox + bcx * dw;
    const cy = oy + base.cy * dh;
    const rx = base.rx * dw;
    const ry = base.ry * dh;
    const lines = (opts.lines || []).map((l) => (l || "").trim()).filter(Boolean);
    const font = fontById(opts.font);
    const showPh = !lines.length && opts.placeholder;
    if (!lines.length && !showPh) return;

    // layout in a circle of radius rx, then squash vertically by ry/rx
    const layout = lines.length
      ? Pendant.layoutText(lines, font, rx * 0.95)
      : [{ text: opts.placeholder, y: 0, size: rx * 0.16 }];

    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const o = off.getContext("2d");
    o.save();
    o.translate(cx, cy + ry * 0.07); // sit slightly low: the jump-ring hole is at the top
    o.scale(1, ry / rx);
    o.textAlign = "center";
    o.textBaseline = "middle";
    layout.forEach((l) => {
      const fam = showPh ? "'Jost', sans-serif" : font.css;
      const wt = showPh ? 400 : font.weight || 400;
      o.font = `${wt} ${l.size}px ${fam}`;
      if ("letterSpacing" in o) o.letterSpacing = showPh || (font && font.upper) ? `${(l.size * 0.12).toFixed(1)}px` : "0px";
      o.fillStyle = "#000";
      o.fillText(l.text, 0, l.y);
    });
    o.restore();

    const ink = INK[opts.finish] || INK.steel;
    // colour the glyph mask, then frost it with grain
    o.globalCompositeOperation = "source-in";
    o.fillStyle = ink.ink;
    o.fillRect(0, 0, w, h);
    o.globalCompositeOperation = "source-atop";
    o.globalAlpha = 0.35;
    o.fillStyle = o.createPattern(getGrain(), "repeat");
    o.fillRect(0, 0, w, h);
    o.globalAlpha = 1;

    // highlight lip under each stroke, then the etch itself
    const px = Math.max(1, w / 900);
    ctx.save();
    ctx.globalAlpha = showPh ? 0.18 : 0.55;
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `brightness(4) blur(${px * 0.4}px)`;
    ctx.drawImage(off, 0, px);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = showPh ? 0.22 : 0.92;
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = `blur(${px * 0.35}px)`;
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }

  /** Mount (or redraw) a live engraving preview into a host element. */
  function mount(host, opts) {
    const base = BASES[opts.finish] || BASES.steel;
    if (!base) return;
    let c = host.querySelector("canvas.engrave-canvas");
    if (!c) {
      host.innerHTML = "";
      c = document.createElement("canvas");
      c.className = "engrave-canvas";
      c.setAttribute("role", "img");
      host.appendChild(c);
    }
    const lines = (opts.lines || []).filter((l) => l && l.trim());
    c.setAttribute("aria-label", opts.title || (lines.length ? `Necklace engraved with ${lines.join(", ")}` : "The round pendant necklace"));
    host._opts = opts;
    const token = (host._token = (host._token || 0) + 1);
    const font = fontById(opts.font);
    const fontReady = font && document.fonts ? document.fonts.load(`${font.weight || 400} 48px ${font.css}`).catch(() => {}) : Promise.resolve();
    Promise.all([loadImg(base.src), fontReady]).then(([img]) => {
      if (token !== host._token) return; // a newer draw superseded this one
      // layout size (ignores transforms such as the flip animation)
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const bw = host.offsetWidth || 300, bh = host.offsetHeight || bw;
      const w = Math.max(1, Math.round(bw * dpr));
      const h = Math.max(1, Math.round(bh * dpr));
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      draw(c.getContext("2d"), w, h, img, base, opts);
    }).catch(() => {});
    if (!host._ro && "ResizeObserver" in window) {
      let t;
      host._ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => mount(host, host._opts), 80); });
      host._ro.observe(host);
    }
  }

  /** Markup for a host that mountAll() will fill. */
  function tag(opts, cls = "") {
    return `<div class="engrave-host ${cls}" data-engrave='${JSON.stringify(opts).replace(/'/g, "&#39;")}'></div>`;
  }
  function mountAll(root = document) {
    root.querySelectorAll("[data-engrave]").forEach((el) => {
      try { mount(el, JSON.parse(el.dataset.engrave)); } catch (e) {}
    });
  }

  // Warm the cache so finish switching is instant.
  Object.values(BASES).forEach((b) => b && loadImg(b.src).catch(() => {}));

  window.Engrave = { mount, tag, mountAll };
})();
