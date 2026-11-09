# Setting up Keep Close on Shopify

The website is now a Shopify theme: `shopify-theme/` (upload-ready zip: `keep-close-theme.zip`).
Everything on it — text, photos, sections, FAQ — is editable in **Online Store → Themes → Customize**.

A preview copy is already installed (unpublished) in the SlateStream store as **"Keep Close (preview)"**.
It doesn't affect the live drain site. Delete it once the new store is set up.

## 1. Create the Keep Close store (you)
Shopify only lets the account owner create stores.
1. In Shopify admin, click the store name (bottom-left) → **All stores** → **Create store**.
2. Name it **Keep Close**, choose Australia / AUD, and pick a plan.

## 2. Connect CJ and add the necklace (you)
1. In the new store: **Apps → Shopify App Store → CJdropshipping → Install**, and log in with your existing CJ account.
2. Push the necklace (SKU CJLX1550569) to the store as a **Draft**.

## 3. Install the theme (you, 2 minutes)
1. **Online Store → Themes → Add theme → Upload zip file** → choose `keep-close-theme.zip`.
2. Click **Publish** on "Keep Close".

## 4. Things Claude can do once you reconnect Shopify to the new store
Tell Claude "I've made the Keep Close store" and it will:
- Tidy the CJ product (title, description, Finish = Silver / Gold / Rose gold, price, photos, SEO) — as already done in SlateStream.
- Create the pages and attach their templates:

  | Page title | Handle | Template |
  |---|---|---|
  | Our Story | `our-story` | `page.story` |
  | Jewellery Care | `jewellery-care` | `page.care` |
  | FAQ | `faq` | `page.faq` |
  | Contact | `contact` | `page.contact` |
- Set the header's **Signature product** and the homepage **Signature product** section to the necklace.

## 5. Policies (you)
**Settings → Policies**: add Refund, Privacy, Terms of service and Shipping policies. They appear in the footer automatically.
Use the wording in `delivery.html`, `privacy.html` and `terms.html` from this repo as a starting point and have it reviewed.

## 6. Before taking real orders
- [ ] Confirm with CJ that they engrave customer text on SKU CJLX1550569 (and which fonts / how many characters).
      Turn off any lettering styles they can't do in **Customize → Theme settings → Engraving**.
- [ ] Place a test order. In **Orders**, check the line item shows *Engraving – front / back / style / Personalisation ref*,
      and check the order inside the CJ app shows the same (see `docs/FULFILMENT.md`).
- [ ] Fill in **Theme settings → Delivery & returns** once CJ's processing and shipping times to Australia are confirmed.
- [ ] Set the product to **Active**.

## How the theme works
| Feature | Where |
|---|---|
| Live engraving preview on real photos | `assets/engrave.js`, base photos `assets/base-*.jpg` (disc positions in `layout/theme.liquid`) |
| Personaliser, gallery, add to bag | `sections/main-product.liquid`, `assets/product.js` |
| Bag drawer (Shopify cart API) | `assets/theme.js` |
| Engraving limits, lettering styles, delivery text | Theme settings (Customize → ⚙) |
| Engraving saved to orders | Line-item properties: `Engraving – front`, `Engraving – back`, `Engraving style`, `Personalisation ref` (plus hidden `_finish`, `_font`, `_front` for the bag preview) |

Back engraving has no extra charge in the theme (Shopify can't add a fee from a text field without an app).
If CJ charges for it, either raise the base price or add a paid "Back engraving" add-on product.
