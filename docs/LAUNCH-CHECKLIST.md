# Launch checklist

The site runs in **preview mode** (`STORE.mode = "preview"` in `assets/js/store-config.js`).
Anything marked `confirmed: false` shows with a ◇ marker in preview and is **hidden in live mode**.
Work through this list, set each item to `confirmed: true`, then switch `mode` to `"live"`.

## 1. Get the product into Shopify
- [ ] In Shopify admin → Apps → CJdropshipping, list the necklace to the store as a **draft**:
      https://www.cjdropshipping.com/product/personalized-simple-round-brand-necklace-polished-mirror-stainless-steel-p-1563137380192890880.html
- [ ] Copy each finish variant's numeric ID into `shopify.variantIds` and the store domain into `shopify.domain`.

## 2. Confirm with the supplier (CJ listing / CJ support)
| Config field | Current value | Status |
|---|---|---|
| `specs.pendantMaterial` | Stainless steel (from title) | verify |
| `specs.diameter` | 20 mm (search-index summary) | verify |
| `specs.chainWidth` | 1.5 mm (search-index summary) | verify |
| `specs.finish` | Polished mirror finish (from title) | verify |
| `specs.chainMaterial`, `thickness`, `chainType`, `length`, `weight` | — | fill in |
| `specs.method` (laser / engraved / printed?) | — | fill in |
| `specs.packaging` | — | fill in |
| `finishes` (silver / gold / rose gold) | listing summary | verify each |
| `chainLengths` | none | add verified lengths |
| `engraving.front` / `.back` — is custom engraving offered, max characters, lines, both sides? | assumed | **critical** |
| `fonts` — which lettering styles can CJ produce? | 4 assumed | remove any they can't |
| `shipping.*` to Australia — processing time, delivery time, tracking, cost | — | fill in |
| `giftWrap` / `giftMessage` | off | enable only if offered |

## 3. Business details
- [ ] `brand.name` (working name "Keep Close"), `brand.email`, social links
- [ ] `product.price` — set your retail price, then `confirmed: true`
- [ ] `policies.changeWindow`
- [ ] Review `privacy.html` and `terms.html`; fill in the bracketed details (ABN, email, countries)

## 4. Photography
Add files to `assets/img/` and reference them in `STORE.images`. Until then the site uses the
built-in pendant illustration. Shots needed: hero (model wearing necklace), on-model close-up,
4 lifestyle shots (briefs are in the config), packaging. Keep the necklace identical to the real product.

## 5. Test before going live
- [ ] Place a real test order end-to-end and confirm the personalisation reaches CJ (see `docs/FULFILMENT.md`)
- [ ] Switch to `mode: "live"` and re-check every page
