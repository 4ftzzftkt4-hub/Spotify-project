# Store content

Copies of the store's policy and notice text, kept here so changes are tracked.
These are **not** theme files — they live in Shopify, and this folder is the
reference copy.

| File | Where it belongs in Shopify |
|---|---|
| `shipping-policy.html` | Settings → Policies → Shipping policy |
| `legal-notice.html` | Content → Pages → Legal Notice (`/pages/legal-notice`) |

The shipping policy belongs in the **policy slot**, not a page, because Shopify
links policy-slot text automatically from checkout. The legal notice has no
policy slot, so it is an ordinary page.

## Both drafts need a review before they protect anything

They were drafted from the facts of this store — real dispatch times, the real
ABN, the real application limits — and they are careful not to exclude the
Australian Consumer Law consumer guarantees, which cannot lawfully be excluded.

That is not the same as legal sign-off. The limitation-of-liability and
consumer-rights sections in `legal-notice.html` are the ones worth paying a
lawyer to read, particularly given the product involves regulated plumbing and
waterproofing work.

## Still to write

- **Refund policy** — needs a business decision first: is there a change-of-mind
  window, do custom-made drains get one, who pays return freight.
- **Terms of service** — Shopify's template under Settings → Policies is a
  reasonable starting point.
- **Privacy policy** — exists, but still shows the old contact email and the
  13 William Street address. Regenerating it from the Shopify template picks up
  the current store name and address.

## Placeholders still in these documents

- No street address appears in the legal notice. A business address is normally
  expected in a notice like this; it was left out rather than guessed, since no
  address was supplied for public use.
- The registered business name is not stated, as registration was still in
  progress. Once it is registered, "SlateStream" should be joined by the legal
  entity name in the *Who we are* section.
