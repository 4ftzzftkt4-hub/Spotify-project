# Keep Close — personalised round necklace storefront

A one-product jewellery website built around a personalised round stainless steel pendant, with a live
engraving preview, cart and Shopify checkout hand-off.

**Run locally:** `python3 -m http.server 8000` then open http://localhost:8000. No build step.

| Page | File |
|---|---|
| Home | `index.html` |
| Product + personaliser | `necklace.html` |
| Our story / Care / FAQ / Shipping & returns / Contact | `story.html`, `care.html`, `faq.html`, `delivery.html`, `contact.html` |
| Legal templates | `privacy.html`, `terms.html` |

- **All product facts, prices, options and policies live in `assets/js/store-config.js`.** Nothing customer-facing is hard-coded.
- `assets/js/pendant.js` draws the pendant (finish, engraving, front/back) as SVG.
- `assets/js/personalise.js` runs the personaliser, gallery and live preview.
- `assets/js/site.js` handles layout, the bag and checkout.

Before launch, work through **`docs/LAUNCH-CHECKLIST.md`**. Checkout and supplier details are in **`docs/FULFILMENT.md`**.

## Shopify theme
`shopify-theme/` is the same site as a Shopify Online Store 2.0 theme (zip: `keep-close-theme.zip`). See **`docs/SHOPIFY-SETUP.md`**.
