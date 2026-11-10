# Fulfilling an order with CJdropshipping

CJ engraves this necklace (SKU CJLX1550569) through its Print on Demand (POD) service — no minimum order,
different text on every piece. CJ doesn't read the engraving from the Keep Close personaliser automatically,
so each order takes about 2–3 minutes to pass on.

## Every order

1. **Shopify → Orders → open the order.**
   - Each necklace shows its engraving: *Engraving – front*, *Engraving – back*, *Engraving style*, *Personalisation ref*.
   - Under **Additional details → Engraving proofs** there's one link per necklace.
2. **Open the proof link.** The Engraving proof page shows the front and back exactly as the customer designed them.
   - Add the Shopify order number to *Order / reference* (e.g. `#1001 · KC-R95HSK`).
   - **Download engrave file** for the front (and the back if it has text). These are the files for CJ.
   - **Copy** the text in *Text for CJ’s product description*.
3. **In CJ, open the necklace → Start Design.**
   - Add the downloaded engrave file as an image (or type the text with the Word tool if images aren't offered).
   - **Product title:** the order number and reference, e.g. `#1001 KC-R95HSK`.
   - **Available colour:** tick **only** the finish the customer ordered.
   - **Product description:** paste the copied text.
   - **Shipping method:** the tracked Australian option.
4. **Save, order one unit, and pay.** Unpaid orders don't move.
5. CJ engraves and ships; tracking returns to Shopify and the customer gets the shipping email.
   If tracking doesn't appear in Shopify within a few days of dispatch, add it to the order by hand from CJ's order page.

## Notes
- The proof page is `/pages/engraving-proof`. It's hidden from search engines and not linked anywhere on the site.
  If the link is missing, open the page and type the engraving from the order yourself.
- Engrave files: 2000 × 2000 px for the 20 mm disc, black = engraved, transparent background.
  *Proof with outline* adds the disc edge and jump-ring hole for checking only — don't send it to CJ.
- Before launch: place one real order to yourself and check the finished piece against the proof.

## Store setup (already done)
- Stock for all three finishes sits at the **cjdropshipping** location, so orders route to CJ.
- The necklace uses the *General shipping profile* (free standard shipping in Australia) from that location.
- Keep **Settings → Checkout → Order processing** on "Don't fulfill any of the order's line items automatically".
