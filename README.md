# Purelane — Shopify sections

Production Shopify sections built from the `purelane-homepage.html` prototype,
on a clean install of **Dawn 16.0.0**.

Troopod AI Product Engineer build assignment.

## What's here

| Section | File | Prototype |
|---|---|---|
| Hero | `sections/purelane-hero.liquid` | `section.hero` |
| Shop / product grid | `sections/purelane-product-grid.liquid` | `#shop` |
| Best-selling combos | `sections/purelane-combos.liquid` | `#combos` |
| Bundles | `sections/purelane-bundles.liquid` | `#bundles` |
| Reviews rail | `sections/purelane-reviews.liquid` | `#reviews` |
| Backdrop | `sections/purelane-backdrop.liquid` | the page-wide gradient every section sits on |

Bonus scope, beyond the five:

| Section | File | Prototype |
|---|---|---|
| Ticker | `sections/purelane-announcement.liquid` | `.ticker` |
| Header + progress rail | `sections/purelane-header.liquid` | `#hdr`, `.rail` |

Shared pieces:

```
snippets/purelane-product-card.liquid        product card, used by four sections
snippets/purelane-product-card-placeholder.liquid
snippets/purelane-combo-card.liquid
snippets/purelane-review-card.liquid
snippets/purelane-price.liquid               price + derived discount
snippets/purelane-icon.liquid                the five repeated SVGs
assets/purelane-base.css                     tokens, type, glass, buttons, reveal
assets/purelane-card.css                     card + price
assets/purelane-{hero,combos,bundles,reviews,product-grid,backdrop,header}.css
assets/purelane-{hero,backdrop,header,reveal}.js
```

Every Purelane file is prefixed. Nothing in Dawn is modified except `templates/index.json`,
`sections/header-group.json`, and additive entries in the two locale files.
Dawn's own `header.liquid` and `announcement-bar.liquid` are left in place,
unused, so the stock header is one setting away.

## Docs

- [`docs/metafields.md`](docs/metafields.md) — every metafield and metaobject
  definition to create
- [`docs/ai-workflow.md`](docs/ai-workflow.md) — what was delegated, where it
  broke, what I'd systematise
- `docs/seed-images/` — the fourteen product renders decoded out of the
  prototype, ready to upload as product images

## Local setup

```bash
npm i -g @shopify/cli@latest
shopify theme dev --store <your-store>.myshopify.com   # live preview
shopify theme check                                     # lints clean
shopify theme push                                      # deploy
```

## Store setup

1. **Currency** — set the store to INR so `| money` renders ₹.
2. **Custom data** — create the metafields and metaobjects in
   [`docs/metafields.md`](docs/metafields.md).
3. **Products** — at least eight, using the images in `docs/seed-images/`.
   Price ₹200, compare-at ₹299 (this produces the "33% off" badge; the figure
   is calculated, never stored). The brief asks for three deliberate edge
   cases, and the card handles each:
   - one **sold out** → disabled CTA, "Sold out" pill, dimmed image
   - one with **no image** → placeholder box of the same aspect ratio, no shift
   - one with a **very long title** → clamped so it can't unbalance the grid
4. **Collection** — group the eight into e.g. `bestsellers` and pick it in the
   product grid section.
5. **Bundle products** — one per combo and per bundle tier. These supply the
   real bundle price; the saving is derived from the included products'
   compare-at total.
6. **Homepage** — `templates/index.json` already lays out backdrop → hero →
   reviews → combos → bundles → grid with the prototype's copy. Pick products
   in the theme editor.

## Notes

- The backdrop is a section: add it once, anywhere on the page. Each section
  picks which of its four depth gradients shows via its own **Scene** setting.
- Combos and reviews can run on metaobjects or on section blocks — a **Source**
  setting per section. Metaobjects are the intended home; blocks exist so the
  section works before the definitions are created.
- Bundle tiers are intentionally section blocks. Reasoning in
  [`docs/metafields.md`](docs/metafields.md).
