# Launch checklist

Everything in this store that is **provisional**, and everything that can only be
done by hand in Shopify admin. Work top to bottom before taking a real order.

Last reviewed: 22 September 2026.

---

## 1. Placeholders that must be replaced

These are live on the store right now. None of them are real. Each one is
deliberately labelled so it cannot be mistaken for a genuine figure.

| What | Where it lives | Replace with |
|---|---|---|
| **Prices** — $289 to $691 across 30 variants | Shopify → Products → variants | Real pricing from the supplier |
| **Lengths** — 600–1500mm in 100mm steps | Shopify → Products → Length option | The lengths actually manufactured |
| **Configuration dropdown** — "Configuration A/B/C — placeholder" | Theme editor → Product → *Configuration dropdown — PLACEHOLDER*, or `theme/sections/main-product.liquid` (search `STEP 04`) | The real configuration names, one per line |
| **Shipping rate** — "PLACEHOLDER — rate not set", $0.00 AUD, Australia | Settings → Shipping and delivery → General profile | Real freight pricing |
| **Variant weights** — every variant is `0 kg` | Shopify → Products → variants → Shipping | Real shipped weights |

> The shipping rate is the dangerous one. At $0.00 a customer can complete an
> order and pay nothing for freight on a steel channel up to 1.5m long. Price it
> before the store takes real traffic.

## 2. Inventory behaviour — decide which model you want

All 30 variants are currently:

- inventory tracking **off**
- inventory policy **`CONTINUE`** (keep selling when out of stock)

That is the made-to-order model, and it matches the published 10–15 business day
lead time for custom drains. Nothing ever shows "Sold out".

If you switch to holding real stock, turn tracking **on** per variant and set the
policy back to `DENY`, or the store will oversell. The two settings go together —
tracking off with `DENY` is the broken combination that blocked Add to cart on
20 September, because the storefront reads the zero stock record and refuses the
line even though the Admin API reports the variant as available.

## 3. Manual steps — blocked from the API

| Task | Where | Why it is manual |
|---|---|---|
| **Publish the theme** | Online Store → Themes → *Actions → Publish* | The connector blocks `themePublish` outright. Until this is done the public site is the factory Horizon theme and every content page looks empty. |
| **Password-protect the storefront** | Online Store → Preferences → Restrict access | No API mutation exists for this. Relevant while placeholder prices are public. |
| **Confirm a payment provider is active** | Settings → Payments | Not reliably readable through the API. `supportedDigitalWallets` lists `SHOPIFY_PAY`, which suggests Shopify Payments is on, but verify. No provider means no orders. |
| **Fix the privacy policy** | Settings → Policies | Needs the `write_legal_policies` scope, which this connector does not hold. Still carries the old email and "13 William Street". |
| **Paste the shipping policy** | Settings → Policies → Shipping policy | Same scope limitation. Source text is in `content/shipping-policy.html`. |
| **Store contact email** | Settings → Store details | Still `wrightww20@gmail.com`. No `shopUpdate` mutation exists. |
| **Location address** | Settings → Locations | Still "13 William Street" while billing is 17 Scenic Avenue. Shipping rates anchor to the origin location, so fix it if stock ships from elsewhere. |
| **Delete 2 orphan theme files** | Online Store → Themes → Edit code | `templates/page.custom.json` and `sections/custom-cta.liquid`. The connector blocks `themeFilesDelete`. Nothing references either one, but until they go, "Custom drains CTA" still appears in the theme editor's Add-section list. |

## 4. Already done

- Phone number removed from the theme, both policy documents and the live
  Legal Notice page. Email replaces it everywhere a call-us link used to sit.
- Product `ACTIVE` and published to the Online Store, with 13 images.
- Add to cart works (inventory policy fixed).
- Australia shipping zone exists, so checkout reaches the payment step.
- Main menu and footer menu rebuilt to match the site.
- Cart carries line item properties through to the order, so the outlet
  configuration and the configuration dropdown both appear on the order.

## 5. Verifying a change reached the store

`themeFilesUpsert` **fails silently** when the file arrives by staged upload —
`userErrors` comes back empty and nothing is written. This is how
`config/settings_schema.json` sat unwritten on the store for three days.

Always confirm by checksum:

```bash
python3 tools/validate_theme.py theme     # catches the rules Shopify enforces
md5sum theme/config/settings_schema.json  # compare against checksumMd5 from the API
```

Sending the body as `TEXT` rather than a staged `URL` surfaces the real
validation error, at the cost of putting the whole file in the request.
