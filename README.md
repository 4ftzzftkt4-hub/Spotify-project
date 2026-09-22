# Heelguard — Specialist Linear Drainage

A Shopify Online Store 2.0 theme for a single-product specialist company selling
**stainless steel linear drains with the Heelguard wedge-wire grate**.

The store is `emiqwd-sr.myshopify.com`. The theme is installed there as an
**unpublished (draft)** theme named *Heelguard — Specialist Linear Drainage (Draft)*.

## What this is

Not a landing page. The site walks a buyer through the whole specification
decision — profile, length, outlet, application, installation, cleaning,
delivery — and only then asks for the order.

```
theme/
├── assets/          design system (3 stylesheets) + 2 progressive-enhancement scripts
├── config/          theme settings schema and the shipped settings/navigation
├── layout/          theme.liquid, password.liquid
├── locales/         en.default
├── sections/        33 sections
├── snippets/        icons, responsive media, SVG technical drawings, docs, SEO meta
└── templates/       homepage, product, cart, 9 content pages, search, 404, customers
```

## The two pieces of real logic

**`assets/configurator.js`** drives the product page. Profile and length come
from the product's own option values, so lengths are never hardcoded. Outlet
options are filtered per profile and travel to the cart as the line-item
property `Outlet configuration`, because the outlet is a manufacturing decision
rather than a variant. Prices arrive pre-formatted from Liquid so currency
formatting can never drift from the store's settings. Unavailable combinations
are shown struck through rather than hidden, and add-to-cart disables itself.

The same file drives the five-question guided selector, which maps answers onto
the published profile and outlet options, links straight into the configurator
with `?profile=&length=&outlet=`, and says plainly when an answer needs a human.

**`snippets/drawing.liquid`** generates the plan, elevation and section views as
inline SVG from the profile width and depth. Section A–A is drawn to scale at
3:1 with the tapered wedge wire at its true 3 mm / 4 mm pitch.

## Accuracy rules this theme follows

Product facts come from the reference specification and nothing else:
304 stainless steel, fully welded construction, 3 mm wedge wire at 4 mm
aperture, 5 × 20 mm perimeter edge bar, tapered cross bars at ~25 mm centres,
three profiles (70 × 22, 85 × 20, 100 × 20 mm), the per-profile outlet options,
removable grate, and internal/pedestrian application only.

Deliberately absent, because the data does not exist: flow rates, load ratings,
standards-compliance claims, warranty terms, Australian-manufacture claims,
certifications, years in business, customer counts and reviews.

Where a fact is the merchant's to supply, the theme hides the field rather than
guessing — phone, email, ABN, address, dispatch and lead times, and the PDF
documents (each renders a labelled *Awaiting upload* state until a URL is set).
Review slots render as visible placeholders until someone ticks
*This is a real review*.

## Needs input before this store can go live

1. **Pricing** — the 30 variants carry provisional figures. Tagged
   `PRICING-PROVISIONAL` on the product.
2. **Lengths** — 600–1500 mm in 100 mm steps is a placeholder range. Tagged
   `LENGTHS-PROVISIONAL`.
3. **Business details** — phone, email, trade email, ABN, address, dispatch and
   lead times (Theme settings → Brand / Contact / Delivery).
4. **Documents** — technical drawings, care guide, installation guide, spec
   sheet (Theme settings → Documents).
5. **Policies** — refund, shipping, privacy, terms. Footer links appear only
   once each is written in Settings → Policies.

## Photography

The twelve images were generated for this build and uploaded to Shopify Files,
then referenced by CDN URL. Ten are attached to the product as media. Replace
them with real photography before launch — every image setting has an
`image_picker` that overrides the URL default.
