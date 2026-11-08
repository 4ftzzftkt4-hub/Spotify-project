/* ==========================================================================
   STORE CONFIGURATION — the single source of truth for the website.
   --------------------------------------------------------------------------
   Every product fact, option, price and policy shown on the site comes from
   this file. Nothing customer-facing is hard-coded in the pages.

   VERIFICATION RULE
   Each fact carries `confirmed: true | false`.
     - mode "preview": unconfirmed items are shown with a ◇ marker so you can
       review the full design before launch.
     - mode "live":    unconfirmed items are HIDDEN from customers.
   Before launch: confirm each item with the supplier (see
   docs/LAUNCH-CHECKLIST.md), set `confirmed: true`, then set mode to "live".
   ========================================================================== */

window.STORE = {
  mode: "preview", // "preview" | "live"

  brand: {
    name: "Keep Close",            // Working name — change freely.
    monogram: "KC",                // Used for order reference codes.
    tagline: "One necklace. Your story.",
    email: null,                   // e.g. "hello@yourdomain.com" — required before launch.
    social: { instagram: null, tiktok: null, pinterest: null }, // full URLs once accounts exist
  },

  locale: "en-AU",
  currency: "AUD",

  /* Shopify checkout hand-off.
     Create the product in Shopify with one variant per finish, then paste the
     store domain and each variant's numeric ID below. Personalisation is sent
     as line-item properties, visible on every order in Shopify admin. */
  shopify: {
    domain: null,                  // e.g. "your-store.myshopify.com"
    variantIds: { steel: null, gold: null, rose: null },
  },

  supplier: {
    name: "CJdropshipping",
    productUrl: "https://www.cjdropshipping.com/product/personalized-simple-round-brand-necklace-polished-mirror-stainless-steel-p-1563137380192890880.html",
    sku: null,
    personalisationWorkflow: null, // e.g. "CJ POD engraving" / "manual — email supplier" once tested
  },

  /* Photography. Leave null to use the built-in pendant illustration.
     Drop files into assets/img/ and reference them here. */
  images: {
    hero: null,               // Model wearing the necklace, minimalist luxury setting
    heroAlt: "Model wearing the personalised round pendant necklace",
    onModel: null,            // Close-up portrait, necklace worn
    packaging: null,          // Packaging / gift presentation (only once packaging confirmed)
    lifestyle: [
      { src: null, alt: "Necklace worn with a casual knit and denim", brief: "Everyday — knitwear, daylight" },
      { src: null, alt: "Necklace layered with a fine chain over a white shirt", brief: "Layered — open-collar shirt" },
      { src: null, alt: "Necklace worn with evening wear", brief: "Evening — black neckline, warm light" },
      { src: null, alt: "Necklace in its gift presentation", brief: "Gifting — hands, packaging, ribbon" },
    ],
  },

  product: {
    name: "The Signature Round Necklace",
    handle: "signature-round-necklace",
    shortDescription:
      "A personalised stainless steel pendant designed to make everyday jewellery more meaningful.",
    description:
      "A simple round pendant with a polished mirror finish, personalised with the details that matter to you.",

    /* Prices are editable placeholders until you set your own. */
    price: { value: 59, confirmed: false },

    /* Specifications. `source` records where the value came from. */
    specs: [
      { key: "pendantMaterial", label: "Pendant material", value: "Stainless steel", source: "Supplier product title", confirmed: false },
      { key: "chainMaterial",   label: "Chain material",   value: null, source: null, confirmed: false },
      { key: "diameter",        label: "Pendant diameter", value: "20 mm", source: "Supplier listing summary (search index) — verify on listing", confirmed: false },
      { key: "thickness",       label: "Pendant thickness", value: null, source: null, confirmed: false },
      { key: "chainWidth",      label: "Chain width",      value: "1.5 mm", source: "Supplier listing summary (search index) — verify on listing", confirmed: false },
      { key: "chainType",       label: "Chain style",      value: null, source: null, confirmed: false },
      { key: "length",          label: "Necklace length",  value: null, source: null, confirmed: false },
      { key: "finish",          label: "Surface finish",   value: "Polished mirror finish", source: "Supplier product title", confirmed: false },
      { key: "weight",          label: "Weight",           value: null, source: null, confirmed: false },
      { key: "method",          label: "Personalisation method", value: null, source: null, confirmed: false },
      { key: "packaging",       label: "Packaging",        value: null, source: null, confirmed: false },
    ],

    finishes: [
      { id: "steel", label: "Silver",    detail: "Polished steel",      priceDelta: 0, confirmed: false },
      { id: "gold",  label: "Gold",      detail: "Gold-tone plating",   priceDelta: 0, confirmed: false },
      { id: "rose",  label: "Rose gold", detail: "Rose gold-tone plating", priceDelta: 0, confirmed: false },
    ],

    /* Add verified lengths, e.g. { id: "45", label: "45 cm", detail: "Sits at the collarbone", priceDelta: 0, confirmed: true } */
    chainLengths: [],

    engraving: {
      front: { enabled: true, maxLines: 3, maxCharsPerLine: 12, confirmed: false },
      back:  { enabled: true, maxLines: 3, maxCharsPerLine: 14, priceDelta: 10, confirmed: false },
      allowedPattern: "[A-Za-z0-9 .,'&\\-/#+:]", // characters customers can type
    },

    /* Engraving styles. Only keep styles the supplier can actually produce. */
    fonts: [
      { id: "classic", label: "Classic", sample: "Serif",  css: "'Cormorant Garamond', Georgia, serif", weight: 600, confirmed: false },
      { id: "modern",  label: "Modern",  sample: "Sans",   css: "'Jost', 'Helvetica Neue', sans-serif", weight: 500, confirmed: false },
      { id: "script",  label: "Script",  sample: "Script", css: "'Pinyon Script', cursive", weight: 400, confirmed: false },
      { id: "minimal", label: "Minimal", sample: "LIGHT",  css: "'Josefin Sans', sans-serif", weight: 300, upper: true, confirmed: false },
    ],

    giftWrap: { available: false, priceDelta: 0, label: "Gift presentation", confirmed: false },
    giftMessage: { available: false, maxChars: 180, confirmed: false },
    maxQuantity: 5,
  },

  shipping: {
    destinations:      { value: null, confirmed: false }, // e.g. "Australia and New Zealand"
    processingTime:    { value: null, confirmed: false }, // e.g. "3–5 business days to personalise and dispatch"
    deliveryTime:      { value: null, confirmed: false }, // e.g. "6–10 business days after dispatch"
    tracking:          { value: null, confirmed: false }, // e.g. "Tracked delivery on every order"
    cost:              { value: null, confirmed: false }, // e.g. "Free on all orders"
    international:     { value: null, confirmed: false },
  },

  policies: {
    // Written to be accurate under the Australian Consumer Law. Have them reviewed.
    personalisedReturns:
      "Because each necklace is made to your personalisation, we can’t accept change-of-mind returns on personalised pieces. This doesn’t affect your rights under the Australian Consumer Law.",
    faultyItems:
      "If your necklace arrives faulty, damaged, or with personalisation that differs from what you submitted, contact us with your order number and photos and we’ll arrange a remedy — a replacement, repair or refund as required by the Australian Consumer Law.",
    ourMistake:
      "If the engraving doesn’t match the details shown on your order, we’ll remake it at no cost to you.",
    yourMistake:
      "Engraving is produced exactly as entered. If a spelling error was entered at checkout, contact us as quickly as possible — we’ll do our best to update it if production hasn’t started.",
    changeWindow: { value: null, confirmed: false }, // e.g. "within 12 hours of ordering"
  },

  /* Care guidance. General stainless-steel care that doesn't make product claims.
     Replace or extend with supplier care instructions when available. */
  care: [
    { title: "Cleaning", body: "Wipe the pendant and chain gently with a soft, dry jewellery or microfibre cloth. For a deeper clean, use a little mild soap in lukewarm water, rinse, and dry straight away." },
    { title: "Drying", body: "Pat the necklace completely dry after it gets wet, paying attention to the chain links and clasp, before you store it." },
    { title: "Storage", body: "Store it on its own, in a soft pouch or lined box, with the clasp fastened so the chain doesn’t tangle." },
    { title: "Avoiding scratches", body: "A mirror polish will show fine marks over time. Keep it away from harder jewellery, keys and rough surfaces, and take it off for the gym and gardening." },
    { title: "The polished surface", body: "Use only a soft cloth on the mirror face. Avoid abrasive pads, toothpaste or polishing compounds, which can dull the reflective finish and soften engraved detail." },
    { title: "What to avoid", body: "Put perfume, lotion and hairspray on before your necklace. Remove it before swimming in chlorinated pools or the sea, and keep it away from bleach and household cleaning chemicals." },
  ],
};
