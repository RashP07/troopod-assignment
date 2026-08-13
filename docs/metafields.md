# Metafield and metaobject definitions

Everything the Purelane sections read from the platform. Create these in
**Settings → Custom data** before seeding products.

## Product metafields

| Namespace & key | Type | Used by | Purpose |
|---|---|---|---|
| `custom.badge` | Single line text | Product card | Corner pill: `Best seller`, `New`, `Top rated`. A section block can override it per card. |
| `custom.rating` | Rating (min 1, max 5) | Product card | The `★ 4.8` figure. Rating type rather than a number so the scale travels with the value. |
| `custom.rating_count` | Integer | Product card | The `· 237 reviews` figure. |
| `custom.benefit` | Single line text | Combo card | The line under each thumbnail in a combo tray — "Cuts grease instantly". Falls back to the product title. |

Nothing else about a product is stored: title, price, compare-at price, image,
URL and availability are all native fields, and every discount figure on the
page is derived from price vs compare-at at render time.

## Metaobjects

### `review`

Reviews are content the marketing team edits and reuses, so they are entries
rather than section blocks. The reviews section can also run on blocks if you
would rather not create the definition — see its **Source** setting.

| Field key | Type | Notes |
|---|---|---|
| `title` | Single line text | Headline, e.g. "Works like a charm" |
| `body` | Multi-line text | The review itself |
| `author` | Single line text | "Anita", "Verified buyer" |
| `product` | Product reference | Optional. Its title is shown after the author. |
| `context` | Single line text | Used when no product is linked |
| `rating` | Rating (1–5) | Number of stars drawn |

Set **Storefront access** on, and give the definition a name of `Review` so its
type key is `review` (the section's `metaobject_type`).

### `combo`

| Field key | Type | Notes |
|---|---|---|
| `title` | Single line text | "Kitchen essentials" |
| `products` | Product reference (list) | **All** products in the box. Their combined compare-at price is what the saving is measured against, so a 5-product box lists five even if only three thumbnails show. |
| `thumbnails` | Integer | How many of those products to draw in the tray. Default 3. |
| `bundle` | Product reference | The product that actually sells this combo. Its price is the combo price. |
| `flag` | Single line text | Corner flag: "Most popular", "Best value" |
| `save_label` | Single line text | Optional override for the calculated "You save ₹398" |
| `includes` | Multi-line text | The "Includes: …" paragraph |
| `fine_print` | Single line text | "Inclusive of all taxes · COD available" |
| `featured` | True/false | Draws the highlighted treatment |
| `cta_link` | URL | Optional per-combo link; otherwise the section's link is used |

Type key must be `combo`.

## What is deliberately not a metaobject

**Bundle tiers** are section blocks. A tier describes this section's offer
ladder and nothing else on the store references it, so an entry type would add
an admin concept without adding reuse. If tiers later appear on a landing page
too, the same fields lift into a `bundle_tier` metaobject unchanged.

## Selling the bundles

The tiers render a real price from a real bundle product, but "any three
products at ₹499" is a cart-time rule, not a front-end one. Assembling it
properly needs Shopify Bundles (or a cart transform function) so the customer
picks their three products and checkout prices the group correctly. That is
out of scope here.
