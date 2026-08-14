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
| Footer | `sections/purelane-footer.liquid` | `footer` |

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
assets/purelane-{hero,combos,bundles,reviews,product-grid,backdrop,header,footer}.css
assets/purelane-{hero,backdrop,header,reveal}.js
```

Every Purelane file is prefixed. Nothing in Dawn is modified except `templates/index.json`,
`sections/header-group.json`, `sections/footer-group.json`, one added stylesheet link in `layout/theme.liquid`
(sections cannot link a shared stylesheet without breaking their own
cascade), and additive entries in the
two locale files.
Dawn's own `header.liquid`, `announcement-bar.liquid` and `footer.liquid` are left
in place, unused, so the stock chrome is one setting away.

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
   Name each one after its image file, so the handle matches: an image called
   `foaming-kitchen-cleaner.svg` belongs to "Foaming Kitchen Cleaner", handle
   `foaming-kitchen-cleaner`. `templates/index.json` refers to three of those
   handles, so the hero fills itself in once they exist.
   Price ₹200, compare-at ₹299 (this produces the "33% off" badge; the figure
   is calculated, never stored). The brief asks for three deliberate edge
   cases, and the card handles each:
   - one **sold out** → disabled CTA, "Sold out" pill, dimmed image
   - one with **no image** → placeholder box of the same aspect ratio, no shift
   - one with a **very long title** → clamped so it can't unbalance the grid
4. **Collection** — group the eight into `bestsellers`; the product grid section
   is already pointed at that handle.
5. **Bundle products** — one per combo and per bundle tier. These supply the
   real bundle price; the saving is derived from the included products'
   compare-at total.
6. **Navigation** — the header renders the store's `main-menu`. Replace Dawn's
   default (Home / Catalog / Contact) with Home, Ingredients, How it works,
   Shop, Bundles, pointing at `#`-anchors on the homepage.
7. **Homepage** — `templates/index.json` already lays out backdrop → hero →
   reviews → combos → bundles → grid with the prototype's copy, and pre-fills the
   handles from steps 3 and 4. Anything still unpicked — combo and bundle
   products — renders onboarding placeholders until you pick it in the theme
   editor, so the page never looks broken mid-setup.

## Notes

- The backdrop is a section: add it once, anywhere on the page. Each section
  picks which of its four depth gradients shows via its own **Scene** setting.
- Combos and reviews can run on metaobjects or on section blocks — a **Source**
  setting per section. Metaobjects are the intended home; blocks exist so the
  section works before the definitions are created.
- Bundle tiers are intentionally section blocks. Reasoning in
  [`docs/metafields.md`](docs/metafields.md).
