# Checkout & fulfilment

## How an order flows
1. The customer personalises the necklace on `necklace.html`. Their choices are saved in the bag (browser `localStorage`).
2. **Checkout** posts the bag to `https://{shopify.domain}/cart/add` with one line per necklace and
   redirects to Shopify checkout. Each line carries these **line-item properties**:
   - `Engraving – front`, `Engraving – back`, `Engraving style`, `Chain length`,
     `Gift presentation`, `Gift message`, `Personalisation ref` (e.g. `KC-NZ2L91`)
   - Finish is selected by the variant ID.
3. The properties appear on the order in **Shopify admin → Orders**, under the line item.
4. The CJdropshipping app (already installed — it's registered as a fulfilment service on the store)
   syncs the order to CJ.

## ⚠️ Not yet verified: does CJ receive the engraving?
The CJ app syncs Shopify orders, but **it has not been tested whether CJ reads line-item properties
as engraving instructions**. Until a test order proves it does, assume it does not.

Test: place one real order with distinctive text, then check the order inside the CJ app/dashboard
for the engraving text. Outcomes:
- **CJ shows the text and confirms it will engrave it** → automatic flow works.
- **Text is missing** → use the manual workflow below, or ask CJ support about their
  POD/customisation order process for this SKU.

## Manual workflow (fallback)
1. Turn off automatic order sync for this product in the CJ app.
2. For each new order, open it in Shopify admin and copy the line-item properties.
3. Submit the order in CJ with the engraving text (via CJ's custom/POD order flow or a note to your agent).
4. Keep the `Personalisation ref` code in the CJ order note so issues can be traced back.

## Checkout not connected?
If `shopify.domain` or a variant ID is missing, the Checkout button shows the exact data that would be
sent, with a "Copy order details" button — useful for testing.
