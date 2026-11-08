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
    domain: "emiqwd-sr.myshopify.com",
    // From the CJ-synced Shopify product (gid://shopify/Product/9117655629942)
    variantIds: { steel: "49307011907702", gold: "49307011842166", rose: "49307011874934" },
    // Supplier SKUs per finish, for reference: steel CJLX155056901AZ · gold CJLX155056902BY · rose CJLX155056903CX
  },

  supplier: {
    name: "CJdropshipping",
    productUrl: "https://www.cjdropshipping.com/product/personalized-simple-round-brand-necklace-polished-mirror-stainless-steel-p-1563137380192890880.html",
    sku: "CJLX1550569",
    shopifyProductId: "9117655629942",
    unitCostAUD: { steel: 9.79, gold: 10.10, rose: 10.23 }, // from Shopify cost per item, synced by CJ app
    personalisationWorkflow: null, // e.g. "CJ POD engraving" / "manual — email supplier" once tested
  },

  /* Photography. Leave null to use the built-in pendant illustration.
     Drop files into assets/img/ and reference them here. */
  images: {
    hero: null,               // Model wearing the necklace, minimalist luxury setting
    heroAlt: "Model wearing the personalised round pendant necklace",
    onModel: null,            // Close-up portrait, necklace worn
    packaging: null,          // Packaging / gift presentation (CJ ships the necklace only — source your own boxes first)
    /* Real product photos synced to Shopify by the CJ app. Shown in the product gallery. */
    supplier: [
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/02976d29-d2d3-4e7a-aa64-82cc2628584c.jpg?v=1794178519",
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/d7eab10e-16d2-4521-bf9f-1478c03a9e49.jpg?v=1794178519",
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/5c6f78fd-f538-45cf-9268-c30bdcb9cd29.jpg?v=1794178519",
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/06f68416-92ec-4449-b634-d84a37ca15c7.jpg?v=1794178519",
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/c45f952e-38ba-4554-9d19-1d6cd805446f.jpg?v=1794178519",
      "https://cdn.shopify.com/s/files/1/0721/3609/7910/files/24da8f72-6abb-46c9-bb09-4523c011822f.jpg?v=1794178519",
    ],
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
      { key: "pendantMaterial", label: "Material", value: "Stainless steel", source: "CJ listing: Material: Stainless steel", confirmed: true },
      { key: "chainMaterial",   label: "Chain material",   value: null, source: null, confirmed: false },
      { key: "diameter",        label: "Pendant diameter", value: "20 mm", source: "CJ listing: disc 20mm", confirmed: true },
      { key: "thickness",       label: "Pendant thickness", value: null, source: null, confirmed: false },
      { key: "chainWidth",      label: "Chain thickness",  value: "1.5 mm", source: "CJ listing: chain thickness 1.5mm", confirmed: true },
      { key: "chainType",       label: "Chain style",      value: null, source: null, confirmed: false },
      { key: "length",          label: "Necklace length",  value: null, source: null, confirmed: false },
      { key: "finish",          label: "Surface finish",   value: "Polished mirror finish", source: "CJ product title: Polished Mirror", confirmed: true },
      { key: "weight",          label: "Weight",           value: "Approx. 11 g", source: "Shopify variant weight synced by CJ app (may be shipping weight) — confirm", confirmed: false },
      { key: "method",          label: "Personalisation method", value: null, source: null, confirmed: false },
      { key: "packaging",       label: "Packaging",        value: null, source: "CJ packing list: Necklace ×1 — no box or pouch included", confirmed: false },
    ],

    finishes: [
      { id: "steel", label: "Silver",    detail: "Stainless steel",           priceDelta: 0, confirmed: true },
      { id: "gold",  label: "Gold",      detail: "Gold-tone electroplated",   priceDelta: 0, confirmed: true },
      { id: "rose",  label: "Rose gold", detail: "Rose gold-tone electroplated", priceDelta: 0, confirmed: true },
    ],

    /* Add verified lengths, e.g. { id: "45", label: "45 cm", detail: "Sits at the collarbone", priceDelta: 0, confirmed: true } */
    chainLengths: [],

    /* ⚠ The CJ listing says nothing about engraving — "Personalized" appears only in the title.
       Keep these unconfirmed until CJ confirms they will engrave customer text on this SKU. */
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
