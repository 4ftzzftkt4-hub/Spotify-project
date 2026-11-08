/* Customer-facing answers, generated from store-config.js.
   An answer that depends on an unconfirmed fact is omitted in live mode
   (or falls back to "contact us"), so the site never states a guess. */
(function () {
  const { S, P, esc, hasValue, visible, flag, spec, money } = Site;
  const ship = S.shipping;
  const pol = S.policies;
  const contactLine = `<a href="contact.html" style="text-decoration:underline">Contact us</a>`;

  const v = (item) => (hasValue(item) ? `${esc(item.value)}${flag(item)}` : null);
  const specVal = (key) => v(spec(key));

  function list(items) {
    return items.filter(Boolean);
  }

  function faqGroups() {
    const fonts = P.fonts.filter(visible);
    const fins = P.finishes.filter(visible);
    const lens = P.chainLengths.filter(visible);
    const front = P.engraving.front, back = P.engraving.back;
    const engr = visible(front) && front.enabled;
    const backOk = visible(back) && back.enabled;

    const product = list([
      specVal("pendantMaterial") && ["What is the necklace made from?",
        `<p>The pendant is ${specVal("pendantMaterial").replace(/^./, (c) => c.toLowerCase())}.${specVal("chainMaterial") ? ` The chain is ${specVal("chainMaterial")}.` : ""}</p>`],
      (specVal("diameter") || specVal("thickness")) && ["What are the pendant dimensions?",
        `<p>${[specVal("diameter") && `Diameter: ${specVal("diameter")}`, specVal("thickness") && `Thickness: ${specVal("thickness")}`].filter(Boolean).join("<br>")}</p>`],
      specVal("finish") && ["Is the pendant polished?", `<p>Yes — it has a ${specVal("finish").replace(/^./, (c) => c.toLowerCase())}.</p>`],
      (specVal("chainType") || specVal("chainWidth")) && ["What chain is included?",
        `<p>${[specVal("chainType"), specVal("chainWidth") && `${specVal("chainWidth")} wide`].filter(Boolean).join(", ")}.</p>`],
      (lens.length || specVal("length")) && ["What necklace lengths are available?",
        lens.length ? `<p>${lens.map((l) => esc(l.label) + flag(l)).join(", ")}.</p>` : `<p>${specVal("length")}.</p>`],
      ["Is the necklace suitable for everyday wear?",
        `<p>It’s designed as an everyday piece. Like all polished jewellery it will pick up fine marks with wear — our <a href="care.html" style="text-decoration:underline">care guide</a> explains how to keep it looking its best.</p>`],
    ]);

    const personal = list([
      engr && ["How do I personalise my necklace?",
        `<p>On the <a href="necklace.html#personalise" style="text-decoration:underline">necklace page</a>, choose your finish, type your engraving${fonts.length > 1 ? ", pick a lettering style" : ""} and check the live preview. Your details are saved with your order exactly as entered.</p>`],
      engr && ["What can I engrave?",
        `<p>Up to ${front.maxLines} line${front.maxLines > 1 ? "s" : ""} of ${front.maxCharsPerLine} characters on the front${flag(front)}: names, initials, dates, short words or coordinates. Letters, numbers and simple punctuation (. , ’ &amp; - / # + :) are supported.</p>`],
      engr && ["Can I add initials?", `<p>Yes. Initials work beautifully — try separating them with a middle dot or ampersand, e.g. “A · J” or “A &amp; J”.</p>`],
      engr && ["Can I add a date?", `<p>Yes. Any format fits, such as 12.04.2019, 12/04/19 or Roman numerals (XII · IV · MMXIX).</p>`],
      (engr || backOk) && ["Can I engrave both sides?",
        backOk ? `<p>Yes. Add a back engraving in the personaliser${back.priceDelta ? ` for an additional ${money(back.priceDelta)}` : ""}${flag(back)}.</p>` : `<p>Personalisation is available on the front of the pendant.</p>`],
      ["What happens if I make a spelling mistake?", `<p>${esc(pol.yourMistake)}</p>`],
      ["Can I change my personalisation after ordering?",
        `<p>${hasValue(pol.changeWindow) ? `Changes can be made ${v(pol.changeWindow)}. ` : ""}${contactLine} with your order number as soon as possible. Once production has started we can’t change the engraving.</p>`],
      ["Will the final product look exactly like the preview?",
        `<p>The preview is a digital illustration to help you check your text, layout and style. The finished engraving may vary slightly in size, spacing and depth. Every piece is produced from the exact text on your order.</p>`],
    ]);

    const care = [
      ["How should I clean the necklace?", `<p>${esc(S.care[0].body)}</p>`],
      ["Can I wear it in the shower?", `<p>We recommend taking it off before showering, swimming and exercising. Soap, chlorine, salt water and sweat can dull a polished finish over time.</p>`],
      ["How should I store it?", `<p>${esc(S.care[2].body)}</p>`],
      ["How do I maintain the polished finish?", `<p>${esc(S.care[4].body)}</p>`],
    ];

    const shipping = list([
      ["Where do you ship?", `<p>${v(ship.destinations) || `Destinations are confirmed at checkout. ${contactLine} if you’re unsure.`}</p>`],
      ["How long does delivery take?",
        `<p>${[v(ship.processingTime) && `Processing: ${v(ship.processingTime)}.`, v(ship.deliveryTime) && `Delivery: ${v(ship.deliveryTime)}.`].filter(Boolean).join("<br>") || `Delivery estimates are shown at checkout.`}</p>`],
      ["How long does personalisation take?", `<p>${v(ship.processingTime) || `Personalised pieces are made to order. ${contactLine} for current lead times.`}</p>`],
      ["Can I track my order?", `<p>${v(ship.tracking) || `${contactLine} with your order number for an update at any time.`}</p>`],
      ["What happens if my order arrives damaged?", `<p>${esc(pol.faultyItems)}</p>`],
    ]);

    const returns = [
      ["Can I return a personalised necklace?", `<p>${esc(pol.personalisedReturns)}</p>`],
      ["What happens if my product arrives faulty?", `<p>${esc(pol.faultyItems)}</p>`],
      ["What happens if the wrong personalisation arrives?", `<p>${esc(pol.ourMistake)} ${contactLine} with your order number and a photo.</p>`],
    ];

    return [
      ["The necklace", product],
      ["Personalisation", personal],
      ["Care", care],
      ["Shipping", shipping],
      ["Returns", returns],
    ].filter(([, items]) => items.length);
  }

  function faqTeaser() {
    const all = Object.fromEntries(faqGroups().flatMap(([, items]) => items));
    return [
      "What can I engrave?",
      "Will the final product look exactly like the preview?",
      "Can I return a personalised necklace?",
      "How should I clean the necklace?",
    ]
      .filter((q) => all[q])
      .map((q) => [q, all[q]]);
  }

  /* Shipping rows for delivery page / product page. */
  function shippingRows() {
    return [
      ["Destinations", ship.destinations],
      ["Processing & personalisation", ship.processingTime],
      ["Delivery after dispatch", ship.deliveryTime],
      ["Tracking", ship.tracking],
      ["Shipping cost", ship.cost],
      ["International orders", ship.international],
    ].filter(([, item]) => hasValue(item));
  }

  function faqJsonLd() {
    const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/◇/g, "").trim();
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqGroups().flatMap(([, items]) =>
        items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: strip(a) } }))
      ),
    };
  }

  window.Content = { faqGroups, faqTeaser, shippingRows, faqJsonLd };
})();
