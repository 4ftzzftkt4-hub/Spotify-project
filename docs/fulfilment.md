# Fulfilment — Manifest Access

Internal runbook. How the 3PL connects, what to give them, and what has to
change in the store when stock moves out of Buderim.

Last updated 29 September 2026, after Jason's reply.

---

## 1. The model they use

Their words:

> Once you start generating sales and order stock into our warehouse, we'll
> connect to the staff section of your Shopify store. This allows us to view
> incoming orders and fulfil them directly from our warehouse. We'll handle the
> picking, packing and shipping on your behalf.
>
> We don't currently have a Shopify App Store listing, as we operate through
> direct store access.

So: **no app, no API, no middleware.** A person from Manifest Access logs into
your Shopify admin and works the orders by hand. This is the least automated of
the three ways a 3PL can connect, and it is workable at low volume.

What it means in practice:

- Orders reach them because they are looking at your admin, not because
  anything was sent.
- Tracking numbers appear on orders because a person typed them in.
- Inventory counts change because a person adjusted them.

There is no sync. Wherever this document says "sync", read "someone remembered".

## 2. The blocker: Basic allows zero staff accounts

Shopify's Basic plan permits **0 staff accounts**. Not a small number — none.
So the access Jason is describing cannot be granted the obvious way.

The route that works is a **collaborator account**. Collaborators do not count
toward the plan's user limit, there is no cap on how many you can have, and
they cost nothing.

The catch is that you cannot create one for him. He has to request it.

### Setup sequence

1. **You:** Settings → Users and permissions → Collaborators. Set a **4-digit
   collaborator request code**. Send it to Jason.
2. **Jason:** creates a free **Shopify Partner account** if he has none, and
   turns on **two-step authentication**. Without 2FA Shopify will not let a
   collaborator log in at all — this is the step most likely to stall things,
   so tell him up front.
3. **Jason:** from his Partner Dashboard → Stores → Add store → Managed store,
   enters `emiqwd-sr.myshopify.com` and the request code, and selects the
   sections he needs.
4. **You:** approve the request and set the permissions. Only the store owner
   or an Administrator can approve or later change them.

The alternative is upgrading to Grow to get real staff accounts. Worth it only
if you want carrier-calculated shipping rates as well, which Basic also
forbids — see `docs/pricing.md` §10 and the shipping note below.

## 3. Permissions to grant

He will be inside the admin, able to see customer names, delivery addresses and
order values. Grant the minimum that lets him do the job:

**Grant**

- Orders — view and fulfil
- Products — so he can adjust inventory counts

**Withhold**

- Settings, of any kind
- Payments and Finances
- Apps and sales channels
- Online Store and themes
- Customer export
- Users and permissions

You can change these at any time, and revoking access is a single action. That
is the one real advantage of this model: offboarding is clean.

## 4. The location problem — currently blocking

The store has exactly one location:

```
13 William Street, Buderim QLD 4556
  fulfilsOnlineOrders: true
  shipsInventory:      true
  fulfillmentService:  null   (merchant-managed)
```

If stock physically sits in Manifest Access's warehouse while Shopify believes
it is in Buderim, two things break:

1. **Shipping rates anchor to the wrong origin.** Rates are calculated from the
   origin location. Quoting Buderim freight on a parcel leaving another state
   is wrong in whichever direction costs you money.
2. **Inventory is recorded in the wrong place.** Counts, and any future
   multi-location logic, all point at an address that holds nothing.

The fix is a second location for their warehouse, set to fulfil online orders
and given priority above Buderim. That can be done through the API in a couple
of minutes — **but their warehouse address is still unanswered.** Get it before
any stock ships.

Note the related open item in `LAUNCH-CHECKLIST.md`: the existing location is
still "13 William Street" while the billing address is 17 Scenic Avenue. Worth
fixing at the same time.

## 5. Inventory settings must change at onboarding

All 30 variants are currently **tracking off, policy `CONTINUE`**.

That is correct today. It is the made-to-order model, it matches the published
10–15 day lead time, and it is what fixed Add to cart on 20 September.

**It becomes wrong the moment someone else holds your stock.** With tracking
off, Shopify has no count to sync, and `CONTINUE` means the store keeps selling
drains that are not in the warehouse. When you onboard:

- turn inventory tracking **on** per variant
- set the policy back to **`DENY`**
- transfer the stock to the new location

Both settings move together. Tracking off with `DENY` is the broken combination
that blocked Add to cart before — see `LAUNCH-CHECKLIST.md` §2.

This is one API call once the location exists.

## 6. Still unanswered

Of the six questions put to them, three came back:

| # | Question | Answer |
|---|---|---|
| 1 | Shopify App Store listing? | **No** |
| 2 | API, middleware or file exchange? | **None — direct store access** |
| 3 | Which WMS do you run? | *unanswered* |
| 4 | Australian warehouse, and where? | *unanswered* — **blocking** |
| 5 | Tracking and inventory pushed back? | *implied manual, needs confirming* |
| 6 | Weights and carton dimensions format? | *unanswered* |

Question 3 matters more than it looks. "Direct store access" may mean they run
no WMS at all and intend to use your Shopify admin as their system of record.
That is worth knowing before you depend on them.

Question 6 is gated on the supplier anyway — every variant is still `0 kg`.

## 7. Honest limits of this arrangement

It is fine at a few orders a week, and nothing can break because nothing is
integrated. Against that:

- **No audit trail** beyond Shopify's staff activity log.
- **Typos.** Tracking numbers entered by hand reach customers wrong.
- **Drift.** Inventory is only as accurate as the last manual adjustment.
- **Latency.** Orders ship when someone logs in and notices, not when they
  arrive.
- **Exposure.** A third party is working inside your admin, which is why the
  permission scoping in §3 matters.

At a few orders a day this becomes the bottleneck, and the right move is a
provider with a real integration — an app, or an API you can register as a
fulfillment service. Revisit then.

## 8. Message to send

> Thanks Jason. Two things before we can set that up:
>
> We're on Shopify Basic, which doesn't allow staff accounts at all. The way to
> give you access is a **collaborator account** — you'd need a free Shopify
> Partner account with two-step authentication enabled, then request access to
> our store from your Partner Dashboard. I'll send you the 4-digit request code.
> I'll scope it to Orders and Products only.
>
> Still need from you:
> - The **address of the warehouse** holding our stock — I have to add it as a
>   location in Shopify or our shipping rates will calculate from the wrong
>   origin.
> - Which **WMS** you run, if any.
> - Who updates **tracking numbers and inventory counts**, and how quickly after
>   despatch?
> - What format do you need **product weights and carton dimensions** in?

## 9. When the address arrives

In order:

1. Add the warehouse as a second location, fulfilling online orders.
2. Set its fulfilment priority above Buderim.
3. Re-check the shipping zone — the origin has changed, so the placeholder rate
   needs replacing with real freight from the new origin regardless.
4. Turn inventory tracking on, policy to `DENY`, and transfer stock to the new
   location.
5. Place one real test order and confirm tracking comes back before trusting it.

Steps 1, 2 and 4 are API calls. Step 3 needs a real freight price, which is
still outstanding.
