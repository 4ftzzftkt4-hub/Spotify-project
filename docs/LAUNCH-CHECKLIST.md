# Launch checklist

The site runs in **preview mode** (`STORE.mode = "preview"` in `assets/js/store-config.js`).
Anything marked `confirmed: false` shows with a ◇ marker in preview and is **hidden in live mode**.
Work through this list, set each item to `confirmed: true`, then switch `mode` to `"live"`.

## 1. Product in Shopify ✅
- [x] Listed via the CJ app → Shopify product `9117655629942`
- [x] Variant IDs and store domain added to `shopify` in the config (checkout tested: correct variant + engraving properties posted)
- [ ] **Set the Shopify product to Draft or Unlisted** — it was synced as *Active* at the CJ app's default prices (A$28–32) with product type "Linear Shower Drain"
- [ ] Set the Shopify variant prices to match `product.price` (Shopify charges its own price, not the website's)

## 2. Supplier facts
Verified from the CJ listing (now `confirmed: true`): stainless steel · 20 mm disc · 1.5 mm chain · polished mirror finish ·
silver / gold-tone / rose gold-tone (electroplated). Cost per item A$9.79–10.23.

Still to confirm with CJ:
| Config field | Why |
|---|---|
| `engraving.front` / `.back` | **Critical.** The listing never mentions engraving — "Personalized" is only in the title. Ask CJ whether they engrave custom text on SKU CJLX1550569, how (laser?), max characters, both sides, and the extra cost/lead time. |
| `fonts` | Which lettering styles CJ can produce. Remove any they can't. |
| `specs.length`, `chainType`, `chainMaterial` | Not stated on the listing. |
| `specs.weight` | 11 g synced by the app — may be shipping weight. |
| `specs.packaging` | CJ packing list is **necklace only — no box**. Source gift boxes or pouches before advertising packaging. |
| `shipping.*` to Australia | Processing time, delivery time, tracking, cost. |

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
