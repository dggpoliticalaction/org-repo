## Feature: Homepage Featured Article Grid Layout System

### Summary

We need a flexible, editor-friendly system for curating homepage article layouts when releasing a new **Volume** of Pragmatic Papers (typically 5–7 articles at once). The goal is to allow the chief editor to control **article prominence and placement** using predefined layout presets, while keeping the implementation predictable and scalable.

This issue proposes a **Featured Articles Section** built with Payload CMS blocks, using **layout presets with named slots** (featured, A–F) and a reusable `ArticleTile` renderer with display variants.

---

## High-level Approach

- Add a new Payload block: **FeaturedArticles**
- Each section:
  - Has a **layout preset selector**
  - Exposes a **fixed set of slots** depending on the preset
  - Each slot references an `Article` and optional display overrides
- Frontend maps each layout preset to a dedicated grid template
- Individual articles are rendered via a shared `ArticleTile` component with cva variants

---

## Layout Presets (Initial)

We should start with a small with two presets:

1. **Vespucci 7** (Based on BBC Vermont 7 Grid)

- Mobile: `grid-cols-1` All stack vertically (1 Featured, 2 Medium (Image left), 4 Compact)
- Tablet `md:grid-cols-2`
  - 1 Featured Vertical (is actually second item due to order, but first in html markup)
  - 2 Medium stacked vertically `md:order-first`
  - 4 Compact in 2x2 `col-span-2 grid grid-cols-1 md:grid-cols-2`
- Desktop `lg:grid-cols-3`
  - 1 Featured (is actually second item due to order, but first in html markup)
  - 2 Medium stacked vertically (inherits order from tablet)
  - 4 Compact stacked vertically `col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1`

2. **Fibonacci 7** (Based on BBC Virginia 7 Grid)

- Mobile: `grid-cols-1` All stack vertically (1 Featured, 4 Medium (Image left), 2 Compact)
- Tablet: `md:grid-cols-2`
  - 1 Featured
  - 4 Medium in 2x2 (might need to duplicate certain Medium with `hidden md:block` for ex.)
  - 2 Compact in 1x2
- Desktop: `flex` (might need `display:contents` for small viewport to ignore wrapper divs)
  - 1 Featured Horizontal (Media right of title + byline + metadata) `col-span-3` & 3 Medium below in 3 cols
  - 1 Medium, 2 Compact in col to right of the left box

Each preset determines:

- Which slots are required
- Which `ArticleTile` variant each slot uses

---

## Payload CMS Requirements

### Block: `FeaturedArticles`

Fields:

- `layout` (select)
  - Options: `sixPackA`
- `slots` (group)
  - Named slot groups: `featured`, `a`, `b`, `c`, `d`, `e`, `f`
  - Slots are conditionally shown based on `layout`
  - Each slot includes:
    - `article` (relationship → `articles`, required if slot is active)
    - `kicker` (optional text)
    - `overrideTitle` (optional text)

Validation rules:

- All required slots for the chosen layout must be filled
- The same article cannot be selected in multiple slots

---

## Frontend Requirements

### `ArticleTile` Component

Single reusable component with class variance authority variants:

- `featured`: media + (optional kicker + title) + byline + metadata (time since published until we implement reading time feature)
- `featured-right`: same as `featured` but with the media on the right
- `featured-left`: same as `featured` but with the media on the left
- `default`: (optional kicker + title) + byline + metadata
- `compact`: (optional kicker + title) + metadata

Responsibilities:

- Handle optional media (image/video)
- Respect per-slot overrides (title, kicker, media visibility)
- Be layout-agnostic (layout decides which variant to use)

---

### Layout Rendering

- Each layout preset maps to a dedicated grid template
- Layouts pass the correct `variant` to each slot’s `ArticleTile`
- No dynamic grid math or free-form placement logic, css grid should be sufficient

---

## Editor Experience

- Editor adds "Featured Grid Section" to a page.
- Chooses a layout preset
- Fills visible slots with articles
- Publishes

The editor should **not** be able to:

- Arbitrarily resize tiles
- Break layout balance
- Accidentally duplicate articles

---

## Non-goals

- No drag-and-drop grid editor
- No arbitrary masonry layouts
- No WYSIWYG homepage designer
- No per-breakpoint layout authoring (handled by CSS)

---

## Acceptance Criteria

- Editor can curate a 7-article homepage drop without dev involvement
- Layouts render consistently across breakpoints
- Adding a new layout preset requires:
  - One enum option
  - One slot visibility config
  - One frontend template

---

## Stretch Goals

- Research popular ways to do lazy load media until near viewport and implement for ArticleTile

## Notes / Future Enhancements (Out of Scope)

- Auto-fill slots from latest Volume
- “Lock slot” behavior for auto-fill
- Slot-level analytics (CTR, impressions)
- Visual slot previews in admin

---
