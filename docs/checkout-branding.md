# Branding the checkout

Shopify hosts checkout; it is not a theme template, so none of it lives in this
repo. What follows is the exact set of values to enter by hand so the hosted
checkout reads as a continuation of the site rather than a different website.

Every value below is taken from `theme/assets/base.css`, so they match the
storefront exactly rather than approximately.

## Why this is manual

The Checkout Branding API (`checkoutBrandingUpsert`) would set all of this in
one call, but it is gated to Shopify Plus:

```
shop.plan       { displayName: "Basic", shopifyPlus: false, partnerDevelopment: false }
checkoutBranding        -> Access denied
checkoutBrandingUpsert  -> Access denied
  "Required access: ... the shop must be on a Plus plan or a Development store plan."
```

Both reads and writes are denied on Basic. The admin checkout editor is the
supported route on this plan, and it exposes a subset of the same controls.

**Where:** Settings -> Checkout -> Customize (opens the checkout editor).

The rows the editor offers vary by plan and change over time. Enter what is
there and skip what is not; anything missing is a Plus-only control, not a
mistake.

## Colours

The site layers two surfaces: a warm paper canvas with white cards on top,
separated by hairlines. Checkout has the same two layers, so map them the same
way.

| Editor control | Value | Theme token |
|---|---|---|
| Page / canvas background | `#F5F3F0` | `--paper` |
| Section / card background | `#FFFFFF` | `--white` |
| Body text | `#0B0C0E` | `--ink` |
| Accent, links, focus rings | `#35576B` | `--accent` |
| Primary button background | `#0B0C0E` | `--ink` |
| Primary button text | `#F5F3F0` | `--paper` |
| Primary button hover | `#24404F` | `--accent-deep` |
| Borders on white | `#DFDFE0` | `--line` over `--white` |
| Borders on paper | `#D7D5D3` | `--line` over `--paper` |
| Input borders | `#C0C0C1` | `--line-strong` over `--white` |
| Error | `#A23B2E` | the `aria-invalid` colour |
| Success | `#2F6B4F` | `--ok` |
| Warning | `#8A5A18` | `--warn` |

The buttons are deliberately near-black rather than the blue accent. That is
how the storefront works: `.btn` is `--ink` and only *hovers* to the accent.
Making the checkout button blue would look more branded and match less.

## Typography

| Setting | Value |
|---|---|
| Both font families | **Inter** (in Shopify's font library) |
| Base weight | 400 |
| Bold weight | 600 |
| Base size | 16px |
| Letter case | None — never uppercase |

The site also loads IBM Plex Mono, but only for small index numbers and eyebrow
labels. Do **not** set it as a checkout font: checkout has no equivalent
element, and it would render body copy as monospace. Inter for both slots is
the faithful match.

## Shape and spacing

| Setting | Value |
|---|---|
| Corner radius | **2px** (3px anywhere a "large" radius is offered) |
| Section borders | 1px, solid, visible |
| Shadows | none, or the smallest available |
| Dividers | visible, 1px solid |

The 2px radius is the whole visual signature — the site is deliberately sharp.
Rounded checkout fields are the single change most likely to make it feel like
a different site.

## Logo

No logo image exists yet; the storefront header is a text wordmark
("SLATESTREAM" in Inter). Leaving the checkout logo empty makes Shopify render
the shop name as text, which is consistent. If a wordmark image is made later,
upload it and set the position to match the header: left-aligned, inline.

## Keep

Leave the buyer-journey breadcrumb and the cart link **visible**. Both help
customers orient mid-checkout, and hiding them trades trust for tidiness.

## Do not touch

The editor cannot break payments, but to be explicit: this is a visual pass
only. Do not remove or reorder required fields, change the shipping or payment
steps, or add checkout apps as part of this work.

## What is not achievable on Basic

- Per-scheme colour roles (separate control, selected-state and hover colours)
- Custom uploaded font files
- Section-level background, padding and shadow control
- Checkout favicon
- Order-status and thank-you page branding beyond what the editor offers

If the store moves to Plus, all of it can be set in a single
`checkoutBrandingUpsert` call. The exact input was built and validated against
the schema during this work; the values in this document are that payload.
