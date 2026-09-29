# Pricing model — internal

**Internal only.** Nothing in this file is customer-facing. COGS, margins and
supplier terms must never reach the theme, a product description, a metafield
or a page.

Prepared 29 September 2026. Prices in AUD.

---

## 1. Supplier cost structure

Cost per unit falls with **your** purchase-order size. This is the point most
easily got wrong: a customer buying one unit does not put you on the 1-unit
cost tier. Your cost is fixed by the size of the PO you place, then applies to
every unit from that PO regardless of how customers buy.

| PO qty | Cost/unit | PO total |
|---:|---:|---:|
| 1 | $95 | $95 |
| 2 | $89 | $178 |
| 3 | $85 | $255 |
| 4 | $81 | $324 |
| 5 | $77 | $385 |
| 6 | $74 | $444 |
| 7 | $71 | $497 |
| 8 | $68 | $544 |
| 9 | $65 | $585 |
| 10 | $62 | $620 |

The quote covers **900mm only**, and does not vary by width — 70mm, 85mm and
100mm all cost the same. So a single retail price across the three widths is
justified by the cost base, not just by simplicity.

### Two unverified assumptions that move every number

1. **Is $95 landed or ex-works?** If freight, duty and handling are on top,
   true COGS is higher. On a 900mm steel channel, inbound freight is not
   trivial. Every figure below assumes $95 is landed into Buderim.
2. **Is $95 GST-inclusive or exclusive?** If GST is payable on import on top of
   $95, COGS is effectively $104.50 and margins drop roughly 3 points.

Confirm both with the supplier before committing to a price.

## 2. How margin is calculated here

Store prices are GST-inclusive (`shop.taxesIncluded: true`). GST is remitted to
the ATO, so it is never revenue. Margin is therefore computed on **ex-GST**
revenue:

```
net revenue = price_incl / 1.10
gross profit = net revenue - COGS
gross margin % = gross profit / net revenue
markup % = gross profit / COGS
```

Payment fees assume Shopify Payments AU on Basic at **1.75% + $0.30** domestic.
Verify against the actual rate in Settings → Payments.

## 3. Price required to hit a target margin

Ex-GST price. Multiply by 1.10 for the shelf price.

| COGS | 30% | 40% | 50% | 55% | 60% | 65% |
|---:|---:|---:|---:|---:|---:|---:|
| $95 | 135.71 | 158.33 | 190.00 | 211.11 | 237.50 | 271.43 |
| $89 | 127.14 | 148.33 | 178.00 | 197.78 | 222.50 | 254.29 |
| $85 | 121.43 | 141.67 | 170.00 | 188.89 | 212.50 | 242.86 |
| $81 | 115.71 | 135.00 | 162.00 | 180.00 | 202.50 | 231.43 |
| $77 | 110.00 | 128.33 | 154.00 | 171.11 | 192.50 | 220.00 |
| $74 | 105.71 | 123.33 | 148.00 | 164.44 | 185.00 | 211.43 |
| $71 | 101.43 | 118.33 | 142.00 | 157.78 | 177.50 | 202.86 |
| $68 | 97.14 | 113.33 | 136.00 | 151.11 | 170.00 | 194.29 |
| $65 | 92.86 | 108.33 | 130.00 | 144.44 | 162.50 | 185.71 |
| $62 | 88.57 | 103.33 | 124.00 | 137.78 | 155.00 | 177.14 |

Break-even shelf price at $95 COGS is **$104.50 incl GST**. Note how far below
the market that sits — the constraint on price here is positioning and
credibility, not cost.

## 4. Market evidence

Gathered 29 September 2026. **Every figure came from search result snippets,
not from reading the page** — this container's network proxy blocks retail
domains. Spot-check each before you rely on it.

| Tier | Brand / source | Product | Price | Grade | Notes |
|---|---|---|---:|---|---|
| Premium AU | [Stormtech via Cass Brothers](https://www.cassbrothers.com.au/collections/stormtech) | 65ARG25, UPVC channel, 900mm | **$313** (was $431) | 316 | AU designed + made, 3mm wire / 5mm gap |
| **Direct equivalent** | [Steel Builders](https://www.steelbuilders.com.au/products/stainless-steel-shower-drain-grate-heelguard-pattern) | Heelguard grate & drain 85 × 22mm | **from $330** | 304, 1.5mm | 3mm wedge wire, cross braces, full edge bars |
| Mid, made-to-order | [DrainTEK / Vanguard / Renovator Store](https://www.vanguarddesign.com.au/wedge-wire-shower-grate-85mm-316-stainless-steel-standard-lengths.html) | Wedge wire 85mm custom | **$269.95** at 900mm | 316, 1.2mm | Formula: $44.95 + $0.25/mm. Satin black $0.35/mm → $359.95 |
| Budget import | [Cefito via Discount Appliances](https://discountappliances.com.au/) | 900 × 70 × 25mm heelguard | **$74.88** (was $217.95) | 304, 1.92mm | 50mm outlet, 2.70kg, marketplace channel |

Not captured — pages blocked, worth checking yourself:

- [Vincent Buda & Co](https://www.buda.com.au/products/shower-drain-heelguard-pattern) — the original reference product
- [ABI Interiors](https://www.abiinteriors.com.au/product/harper-shower-channel-waste-900mm-stainless-steel/) Harper / Trey / Pixi 900mm, 304
- [Reece](https://www.reece.com.au/product/veitch-rx65-shower-channel-900mm-swan-202773) — Veitch, Kado Lux (316), Mizu. Reece shows trade pricing by postcode

**The Steel Builders figure is the one that matters.** Its product description
is near word-for-word the same spec as ours — 304, 3mm wedge wire, cross
braces, full edge bars — and Steel Builders carries Buda as a vendor, so
$330 is very likely the Buda product at retail. Treat it as the ceiling a new
brand can credibly approach, not exceed.

## 5. Where this product sits

Supported by what is already published on the site:

- 304 stainless, fully welded body, formed drainage base
- Heelguard wedge wire, 3mm wire at 4mm aperture, welded cross braces
- 5 × 20mm full-perimeter edge bar
- Three profiles; internal pedestrian use only
- Custom sizing on request

**Above** the budget imports on construction and on published technical depth.
**Level with** Buda / Steel Builders on specification. **Below** Stormtech and
Kado Lux, which are 316 marine grade — a real material difference that should
not be blurred.

### Missing before a premium claim is defensible

None of the following is currently verified, and each is something the
established brands do have:

- Warranty period
- WaterMark certification / AS 1428 or AS 3996 compliance
- Country of manufacture
- Load rating and flow rate
- Material thickness of the grate top (competitors state 1.2–1.9mm)

Buda publishes AS 3996 load-class information. Until at least a warranty and a
manufacture origin can be stated, price **below** the established equivalent
rather than at parity. Trust signals are what justify the last $30–50, and they
cannot be invented.

## 6. Recommended structure

Priced against a **PO of 5 ($77 COGS)** — the prudent launch position. Margins
improve by 4–6 points once buying in tens.

| | Price incl GST | Ex-GST | GP | GM | After fees |
|---|---:|---:|---:|---:|---:|
| **Standard retail (RRP)** | **$329** | $299.09 | $222.09 | **74.3%** | 72.2% |
| **Introductory** | **$289** | $262.73 | $185.73 | **70.7%** | 68.7% |
| **Trade** | **$239** | $217.27 | $140.27 | **64.6%** | 62.5% |

$329 sits just under the $330 direct equivalent and well under Stormtech's $431
RRP. It reads as a considered price rather than a round marketing number, and
it leaves room to discount without approaching the floor.

### Quantity ladder

| Qty | Unit incl GST | Off RRP | Order total | GM @ $77 | GM @ $62 |
|---:|---:|---:|---:|---:|---:|
| 1 | $329 | — | $329 | 74.3% | 79.3% |
| 2 | $315 | 4% | $630 | 73.1% | 78.3% |
| 3 | $305 | 7% | $915 | 72.2% | 77.6% |
| 4 | $295 | 10% | $1,180 | 71.3% | 76.9% |
| 5 | $285 | 13% | $1,425 | 70.3% | 76.1% |
| 6–9 | $272 | 17% | $1,632+ | 68.9% | 74.9% |
| 10+ | $259 | 21% | $2,590+ | 67.3% | 73.7% |

The steps are deliberately shallow early — 4% at two units — so the
single-unit price never looks punitive. The jump to 17% at six units is where a
plumber doing a multi-bathroom job gets a real reason to consolidate the order.

Margin never falls below 67% anywhere on the ladder. The 55% floor is $188 at
$77 COGS, so there is roughly $70/unit of headroom below the deepest tier for
one-off negotiation.

## 7. Custom sizes

Do not price custom automatically — there is no cost data for any length other
than 900mm, and the supplier quote does not cover them. Use a **Request a
custom size** form capturing length, width, quantity, outlet position and
notes, and quote by hand.

DrainTEK's public formula is a useful sanity check when quoting: $44.95 base +
$0.25/mm. It implies about $270 at 900mm and about $420 at 1500mm — the same
shape as our own pricing, which suggests per-mm is the right mental model once
supplier costs for other lengths are known.

## 8. Structural problem to resolve first

The store currently has **30 variants**: 3 widths × 10 lengths (600–1500mm).
The supplier quote covers **900mm only**.

So 27 of the 30 variants have **no cost basis at all**, and their prices are
placeholders I generated. Pricing them would be inventing figures.

Recommended: reduce the product to **3 real variants** — 70/85/100mm at 900mm —
and move every other length to the custom-size request path. That matches what
the supplier actually quotes and what the brief calls the standard length.
Deleting 27 variants is not reversible through the admin API, so it needs an
explicit decision.

## 9. Australian Consumer Law note on "was / now"

A struck-through RRP the product never genuinely sold at is misleading under
the ACL, and the ACCC pursues it. Two compliant options:

1. Launch at $329, sell at that price for a genuine period, then run a
   time-boxed sale at $289 against a real prior price; or
2. Launch at $289 described as an **introductory price** with no struck-through
   comparison, then move to $329.

Option 2 is cleaner for a new brand with no sales history. It is the
recommendation.

## 10. Implementation constraint on Basic

Native tiered / quantity-break pricing is not available on Basic — Shopify
classes it as an advanced discount solution requiring an app or Plus. Three
workable routes, in order of preference:

1. **Automatic discounts, one per tier**, each set not to combine with other
   product discounts, so exactly one applies and Shopify picks the best for the
   customer. Free. Needs testing at every tier boundary before trusting it.
2. **A quantity-break app** — does it properly, roughly $10–20/month.
3. **Trade-only discount code** plus the ladder shown on the page as
   information, with bulk orders invoiced manually. Simplest, and honest at low
   volume.

The theme can display the full ladder, per-unit price, total and saving
regardless of which route applies the discount.
