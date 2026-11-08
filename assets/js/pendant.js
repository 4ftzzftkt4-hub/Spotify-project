/* Pendant renderer — draws the round mirror-polished pendant as SVG.
   Used for the hero, gallery, cart thumbnails and the live preview.
   It is an illustration, not a manufacturing proof. */
(function () {
  const PALETTES = {
    steel: {
      stops: ["#fbfbfc", "#d9dce0", "#f7f8f9", "#aeb3b9", "#eef0f2", "#c4c8cd", "#fdfdfd"],
      rim: ["#8f949a", "#f5f6f7", "#7c8187"],
      ink: "#5d6268", shine: "#ffffff",
    },
    gold: {
      stops: ["#fdf3d4", "#e2c07a", "#fff7de", "#bf9546", "#f3dc9e", "#d4ac5f", "#fff9e6"],
      rim: ["#a57b32", "#fbe7b0", "#8e6a29"],
      ink: "#7a5720", shine: "#fffaf0",
    },
    rose: {
      stops: ["#fbe8e0", "#ddaa97", "#fff1eb", "#bd806c", "#f2cdbf", "#cf9785", "#fff4ef"],
      rim: ["#a06655", "#f8d8cc", "#8a5546"],
      ink: "#7d4536", shine: "#fff8f5",
    },
  };

  let uid = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* Fit up to 3 lines of text inside a circle of radius r. */
  function layoutText(lines, font, r) {
    const clean = lines.map((l) => (l || "").trim()).filter(Boolean);
    if (!clean.length) return [];
    const n = clean.length;
    const widthFactor = font && font.id === "script" ? 0.48 : font && font.upper ? 0.66 : 0.56;
    const lineGap = 1.18;
    // largest size where every line fits its chord
    let size = r * (n === 1 ? 0.5 : n === 2 ? 0.36 : 0.27);
    for (let i = 0; i < 40; i++) {
      const total = size * lineGap * (n - 1);
      const fits = clean.every((t, idx) => {
        const y = -total / 2 + idx * size * lineGap;
        const half = Math.sqrt(Math.max(0, (r * 0.8) ** 2 - (Math.abs(y) + size * 0.45) ** 2));
        return t.length * size * widthFactor <= half * 2;
      });
      if (fits) break;
      size *= 0.93;
    }
    const total = size * lineGap * (n - 1);
    return clean.map((t, idx) => ({ text: font && font.upper ? t.toUpperCase() : t, y: -total / 2 + idx * size * lineGap, size }));
  }

  /**
   * render(opts) -> SVG string
   * opts: finish, lines[], font, side ("front"|"back"), chain (bool), view ("full"|"pendant"|"macro"),
   *       placeholder (string shown faintly when no text), title
   */
  function render(opts = {}) {
    const id = "p" + ++uid;
    const pal = PALETTES[opts.finish] || PALETTES.steel;
    const font = opts.font || null;
    const r = 100;
    const view = opts.view || "full";
    const lines = layoutText(opts.lines || [], font, r);
    const showPlaceholder = !lines.length && opts.placeholder;
    const angle = opts.side === "back" ? -48 : 32;

    const vb = {
      pendant: "-118 -150 236 270",
      macro: "-70 -70 140 140",
      chain: "-80 -230 160 160",
      full: "-170 -330 340 470",
    }[view] || "-170 -330 340 470";

    const stops = pal.stops
      .map((c, i) => `<stop offset="${(i / (pal.stops.length - 1)).toFixed(3)}" stop-color="${c}"/>`)
      .join("");

    const chain =
      opts.chain === false || view === "macro"
        ? ""
        : `<g fill="none" stroke-linecap="round">
            <path d="M-6 -128 C -60 -190 -120 -260 -160 -340" stroke="${pal.rim[0]}" stroke-width="3.2" opacity=".55"/>
            <path d="M-6 -128 C -60 -190 -120 -260 -160 -340" stroke="${pal.rim[1]}" stroke-width="2.2" stroke-dasharray="3.2 2.4"/>
            <path d="M6 -128 C 60 -190 120 -260 160 -340" stroke="${pal.rim[0]}" stroke-width="3.2" opacity=".55"/>
            <path d="M6 -128 C 60 -190 120 -260 160 -340" stroke="${pal.rim[1]}" stroke-width="2.2" stroke-dasharray="3.2 2.4"/>
          </g>`;

    const text = lines
      .map(
        (l) => `
        <text x="0" y="${(l.y + 0.9).toFixed(1)}" font-size="${l.size.toFixed(1)}" fill="${pal.shine}" opacity=".85">${esc(l.text)}</text>
        <text x="0" y="${l.y.toFixed(1)}" font-size="${l.size.toFixed(1)}" fill="${pal.ink}" opacity=".9">${esc(l.text)}</text>`
      )
      .join("");

    const fontAttr = font
      ? `font-family="${esc(font.css)}" font-weight="${font.weight || 400}" ${font.upper ? 'letter-spacing="2"' : ""}`
      : `font-family="'Cormorant Garamond', serif"`;

    return `<svg class="pendant-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opts.title || "Round pendant illustration")}">
      <defs>
        <linearGradient id="${id}f" gradientTransform="rotate(${angle} .5 .5)">${stops}</linearGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${pal.rim[1]}"/><stop offset=".5" stop-color="${pal.rim[0]}"/><stop offset="1" stop-color="${pal.rim[2]}"/>
        </linearGradient>
        <radialGradient id="${id}s" cx=".32" cy=".28" r=".55">
          <stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}d" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dy="9" dx="3"/>
          <feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${chain}
      <g filter="url(#${id}d)">
        <!-- bail -->
        <rect x="-9" y="-136" width="18" height="40" rx="6" fill="url(#${id}r)"/>
        <rect x="-4.5" y="-129" width="9" height="13" rx="4" fill="#00000022"/>
        <!-- disc -->
        <circle r="${r}" fill="url(#${id}r)"/>
        <circle r="${r - 3.5}" fill="url(#${id}f)"/>
        <circle r="${r - 3.5}" fill="url(#${id}s)"/>
        <path d="M ${-r * 0.62} ${-r * 0.55} A ${r * 0.85} ${r * 0.85} 0 0 1 ${r * 0.2} ${-r * 0.88}" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <g text-anchor="middle" dominant-baseline="central" ${fontAttr}>
        ${text}
        ${showPlaceholder ? `<text y="0" font-size="20" fill="${pal.ink}" opacity=".28" font-family="'Jost',sans-serif" letter-spacing="3">${esc(opts.placeholder)}</text>` : ""}
      </g>
    </svg>`;
  }

  window.Pendant = { render, PALETTES };
})();
