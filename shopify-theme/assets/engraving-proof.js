/* Engraving proof page: turns an order's engraving into print-ready PNGs for CJ. */
(function () {
  const $ = (s) => document.querySelector(s);
  const root = $(".proof");
  if (!root) return;
  const PX = Number(root.dataset.px) || 2000;
  const ALL_FONTS = [
    { id: "classic", label: "Classic", css: "'Cormorant Garamond', Georgia, serif", weight: 600 },
    { id: "modern", label: "Modern", css: "'Jost', 'Helvetica Neue', sans-serif", weight: 500 },
    { id: "script", label: "Script", css: "'Pinyon Script', cursive", weight: 400 },
    { id: "minimal", label: "Minimal", css: "'Josefin Sans', sans-serif", weight: 300, upper: true },
  ];
  const FINISH = { steel: "Silver (stainless steel)", gold: "Gold", rose: "Rose gold" };
  const fontById = (id) => ALL_FONTS.find((f) => f.id === id) || ALL_FONTS[0];

  /* ---------- read the order's details from the link ---------- */
  const q = new URLSearchParams(location.search);
  const parseLines = (v) => {
    if (!v) return [];
    try { const a = JSON.parse(v); if (Array.isArray(a)) return a.map(String); } catch (e) {}
    return v.split("|");
  };
  $("#pf-font").innerHTML = ALL_FONTS.map((f) => `<option value="${f.id}">${f.label}</option>`).join("");
  $("#pf-front").value = parseLines(q.get("front")).join("\n");
  $("#pf-back").value = parseLines(q.get("back")).join("\n");
  $("#pf-font").value = fontById(q.get("font")).id;
  $("#pf-finish").value = FINISH[q.get("finish")] ? q.get("finish") : "steel";
  $("#pf-ref").value = q.get("ref") || "";

  const read = () => ({
    front: $("#pf-front").value.split("\n").map((l) => l.trim()).filter(Boolean),
    back: $("#pf-back").value.split("\n").map((l) => l.trim()).filter(Boolean),
    font: fontById($("#pf-font").value),
    finish: $("#pf-finish").value,
    ref: $("#pf-ref").value.trim(),
  });

  /* ---------- draw ----------
     Same layout maths as the customer's live preview (engrave.js):
     text fitted inside 95% of the disc radius, sitting 7% low to clear the jump-ring hole. */
  function draw(canvas, lines, font, guide) {
    const S = canvas.width, r = S / 2, ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, S, S);
    if (guide) {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = "#b9b4ac"; ctx.lineWidth = S / 400;
      ctx.beginPath(); ctx.arc(r, r, r - ctx.lineWidth, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([S / 120, S / 160]);
      ctx.beginPath(); ctx.arc(r, r * 0.16, r * 0.065, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#9c8058"; ctx.font = `500 ${S / 34}px Jost, sans-serif`; ctx.textAlign = "center";
      ctx.fillText("20 mm disc · jump-ring hole (approx.)", r, S - S / 28);
    }
    if (!lines.length) {
      if (guide) { ctx.fillStyle = "#c9c3ba"; ctx.font = `400 ${S / 22}px Jost, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("No engraving", r, r); }
      return;
    }
    const layout = Pendant.layoutText(lines, font, r * 0.95);
    ctx.save();
    ctx.translate(r, r + r * 0.07);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000";
    layout.forEach((l) => {
      ctx.font = `${font.weight || 400} ${l.size}px ${font.css}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = font.upper ? `${(l.size * 0.12).toFixed(1)}px` : "0px";
      ctx.fillText(l.text, 0, l.y);
    });
    ctx.restore();
  }

  function cjText(d) {
    const side = (name, lines) => lines.length
      ? `${name} of the 20 mm disc, centred, ${lines.length} line${lines.length > 1 ? "s" : ""}:\n${lines.map((l, i) => `  Line ${i + 1}: "${d.font.upper ? l.toUpperCase() : l}"`).join("\n")}`
      : `${name}: no engraving.`;
    return [
      `Order ${d.ref || "(add order number)"} — please laser engrave exactly as written (spelling, capitals and punctuation).`,
      `Finish: ${FINISH[d.finish]}.`,
      side("FRONT", d.front),
      side("BACK", d.back),
      `Lettering: ${d.font.label} style — please match the attached engrave file${d.back.length ? "s" : ""} (black = engraved area).`,
      `Keep text clear of the jump-ring hole at the top of the disc.`,
    ].join("\n");
  }

  function render() {
    const d = read();
    draw($("#proof-front"), d.front, d.font, true);
    draw($("#proof-back"), d.back, d.font, true);
    $("#proof-cj").value = cjText(d);
    $("#proof-ref").textContent = d.ref ? `· ${d.ref}` : "";
    Engrave.mount($("#proof-photo"), { finish: d.finish, lines: d.front, font: d.font.id, zoom: 1.4 });
  }

  function download(side, guide) {
    const d = read();
    const c = document.createElement("canvas");
    c.width = c.height = PX;
    draw(c, side === "front" ? d.front : d.back, d.font, guide);
    const name = `${(d.ref || "engraving").replace(/[^A-Za-z0-9-]+/g, "-")}-${side}${guide ? "-proof" : ""}.png`;
    c.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  }

  document.addEventListener("click", (e) => {
    const dl = e.target.closest("[data-download]"); if (dl) download(dl.dataset.download, false);
    const g = e.target.closest("[data-download-guide]"); if (g) download(g.dataset.downloadGuide, true);
  });
  $("#proof-form").addEventListener("input", render);
  $("#proof-form").addEventListener("change", render);
  $("#proof-copy").addEventListener("click", () => {
    const t = $("#proof-cj"); t.select();
    (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(
      () => ($("#proof-copy").textContent = "Copied"),
      () => document.execCommand && document.execCommand("copy")
    );
  });

  // Wait for every lettering face so the PNGs use the real fonts.
  const loads = ALL_FONTS.map((f) => document.fonts ? document.fonts.load(`${f.weight} 80px ${f.css}`) : Promise.resolve());
  Promise.all(loads).catch(() => {}).then(render);
})();
