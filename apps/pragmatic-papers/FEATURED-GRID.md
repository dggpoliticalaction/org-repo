## Feature: Homepage Featured Grid Layout System

### Summary

We need a flexible, editor-friendly system for curating homepage article layouts when releasing a new **Volume** of Pragmatic Papers (typically 5–7 articles at once). The goal is to allow the chief editor to control **article prominence and placement** using predefined layout presets, while keeping the implementation predictable and scalable.

This issue proposes a **Featured Grid Section** built with Payload CMS blocks, using **layout presets with named slots** (hero, A–F) and a reusable `ArticleTile` renderer with display variants.

---

## High-level Approach

- Add a new Payload block: **FeaturedGridSection**
- Each section:
  - Has a **layout preset selector**
  - Exposes a **fixed set of slots** depending on the preset
  - Each slot references an `Article` and optional display overrides
- Frontend maps each layout preset to a dedicated grid template
- Individual articles are rendered via a shared `ArticleTile` component with cva variants

---

## Layout Presets (Initial)

We should start with a small, opinionated set:

1. **6-Pack A Tri-fold**

- Mobile: `grid-cols-1` All stack vertically (Hero, 2 Medium, 3 Compact)
- Tablet `md:grid-cols-2`
  - Hero (is actually second item due to order, but first in html markup)
  - 2 Medium stacked vertically `md:order-first`
  - 3 Compact in 2x2 grid `col-span-2 grid grid-cols-1 md:grid-cols-2`
- Desktop `lg:grid-cols-3`
  - Hero (is actually second item due to order, but first in html markup)
  - 2 Medium stacked vertically (inherits order from tablet)
  - 3 Compact stacked vertically `col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1`

2. All Heros 2 Column (for Backwards Compatibility)

Each preset determines:

- Which slots are required
- Which `ArticleTile` variant each slot uses

---

## Payload CMS Requirements

### Block: `featuredGridSection`

Fields:

- `layout` (select)
  - Options: `sixPackA`
- `slots` (group)
  - Named slot groups: `hero`, `a`, `b`, `c`, `d`, `e`, `f`
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

- `featured`: media + kicker + title + byline + metadata (time since published until we implement reading time feature)
- `featured-right`: same as `featured` but with the media on the right
- `featured-left`: same as `featured` but with the media on the left
- `default`: title + byline + metadata
- `compact`: title + metadata

Responsibilities:

- Handle optional media (image/video)
- Respect per-slot overrides (title, kicker, media visibility)
- Be layout-agnostic (layout decides which variant to use)

---

### Layout Rendering

- Each layout preset maps to a dedicated grid template
- Layouts pass the correct `variant` to each slot’s `ArticleTile`
- No dynamic grid math or free-form placement logic

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

## Suggested Sub-issues

### 1. Payload Block: FeaturedGridSection

- Define block schema
- Slot conditional logic
- Validation (required slots, no duplicates)

### 2. Frontend: ArticleTile Component

- Implement variants
- Media handling
- Byline/excerpt rules

### 3. Frontend: Layout Templates

- sixPackA
- sixPackB
- twoUp
- triFold

### 4. Homepage Integration

- Add block to homepage config
- Wire queries (draft + published support)
- Add basic styling and spacing

---

## Acceptance Criteria

- Editor can curate a 6-article homepage drop without dev involvement
- Layouts render consistently across breakpoints
- Adding a new layout preset requires:
  - One enum option
  - One slot visibility config
  - One frontend template

---

## Notes / Future Enhancements (Out of Scope)

- Auto-fill slots from latest Volume
- “Lock slot” behavior for auto-fill
- Slot-level analytics (CTR, impressions)
- Visual slot previews in admin

---
