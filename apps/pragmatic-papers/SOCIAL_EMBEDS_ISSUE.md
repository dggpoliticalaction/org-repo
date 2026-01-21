# Issue: Resilient Social Embeds (Snapshot-first + Progressive iframe) for Next.js + PayloadCMS

## Goal

Implement social media embeds in a way that:

* Preserves article context if a post is deleted / made private / provider embed breaks
* Avoids brittle `widget.js` script-based embeds in React/Next.js (route transitions + HMR issues)
* Uses SSR/Server Components for stable rendering, with optional client-side enhancement to an iframe
* Minimizes security risk from persisting untrusted external HTML

---

## Background / Problem

Current embed approaches (blockquote + provider `widget.js`) are brittle in Next.js:

* Scripts don’t reliably re-run on client-side navigation
* HMR frequently breaks embed initialization during development
* If a post is deleted or restricted, embeds fail and the article loses context

SSR caching helps performance but does not solve post deletion long-term.

---

## Proposed Approach

**Snapshot-first rendering** backed by Payload storage, with **optional progressive enhancement** to a live iframe.

### Core idea

1. When an editor saves an embed block in Payload, fetch oEmbed (server-side) and store a **sanitized, structured snapshot** in the database.
2. On the frontend, render the snapshot in a **Server Component** (stable SSR).
3. If allowed, progressively enhance with a **lazy-loaded iframe** in a **Client Component** (no `widget.js`).

---

## Requirements

### 1) Payload block schema (SocialEmbed)

Create/Update a Payload block `SocialEmbed` with at minimum:

**Fields**

* `url` (text, required): canonical URL pasted by editor
* `platform` (select/enum, required): derived (`twitter`, `bluesky`, `youtube`, `instagram`, `tiktok`, `reddit`, `unknown`, etc.)
* `embedId` (text, optional): derived (tweet ID / at-uri / video id) if needed per platform
* `renderMode` (select/enum, required):

  * `auto` (default)
  * `iframePreferred`
  * `snapshotOnly`
* `allowLiveEmbed` (checkbox, default `true`): allow iframe to load third-party content

**Snapshot group (persisted)**

* `snapshot.status` (select): `ok` | `not_found` | `forbidden` | `error`
* `snapshot.fetchedAt` (date/time)
* `snapshot.providerName` (text, optional)
* `snapshot.authorName` (text, optional)
* `snapshot.authorUrl` (text, optional)
* `snapshot.title` (text, optional)
* `snapshot.text` (textarea, optional): plain-text excerpt/caption
* `snapshot.thumbnailUrl` (text, optional)

**Explicit non-goal**

* Do not rely on storing/rendering raw provider HTML or scripts as the primary rendering strategy.

---

### 2) On-save oEmbed fetch + snapshot population

Implement a server-side process to populate `snapshot` when an embed is created/updated.

**Trigger**

* Payload hook (`beforeChange`) on the relevant collection(s) containing the block (or a dedicated endpoint invoked by admin UI on save).

**Behavior**

* Detect `platform` from `url`
* Fetch oEmbed or equivalent provider metadata (server-side)
* Populate snapshot fields with **structured, safe** data:

  * Prefer plain text (no HTML)
  * Store canonical URLs and metadata
* Store `snapshot.status` + `snapshot.fetchedAt`
* Handle failures gracefully:

  * If fetch fails, keep existing snapshot and update `status=error` (or only update status if desired)
  * If provider says deleted/404 -> `status=not_found` but retain prior snapshot text

**Security**

* Do not store executable scripts
* Do not store raw HTML unless quarantined and never rendered without strict sanitization (ideally skip entirely)

---

### 3) Frontend rendering strategy (Next.js App Router)

#### 3a) Server Component: Snapshot renderer (default)

Render the snapshot as a stable “embed card” with:

* Provider name + author
* Text excerpt
* Thumbnail (optional)
* Link back to original post (always)
* Visual treatment that indicates this is an archived preview (optional)

This must work regardless of client JS and without widget scripts.

#### 3b) Client Component: Progressive enhancement to iframe (optional)

If `allowLiveEmbed === true` and `renderMode !== snapshotOnly`:

* Lazy-load an iframe when the component enters viewport (IntersectionObserver)
* Keep snapshot visible until iframe is “ready” (or choose replace-on-ready UX)
* If iframe fails to load or errors, keep snapshot as fallback

**Constraints**

* Do not load per-provider `widget.js` scripts as the mechanism to render embeds
* Avoid provider DOM “scan” APIs unless strictly required (prefer iframes)

---

### 4) Platform-specific rules

Create a platform mapping that decides default render behavior:

**Prefer iframe (generally safe/stable)**

* YouTube / Vimeo / Spotify / SoundCloud (if applicable)
* Bluesky (if iframe embed is available)

**Prefer snapshot + link (script-heavy platforms)**

* Instagram / TikTok / Twitter/X (unless a stable iframe embed is available)
* For these, snapshot is the guaranteed context-preserving layer

---

### 5) Admin UX improvements (optional but recommended)

* Display `snapshot.status` and `snapshot.fetchedAt` in the admin UI for the embed block
* Add a “Refresh embed” action (manual re-fetch) to update snapshot on demand
* Allow editor to toggle `snapshotOnly` or `allowLiveEmbed`

---

## Acceptance Criteria

* [ ] Embed blocks render **meaningful context** even if the original post is deleted/removed
* [ ] Embed rendering does **not break** on client-side navigation (App Router)
* [ ] Embed rendering is **not dependent** on `widget.js` scripts
* [ ] SSR/Server Components render a stable snapshot card (no client JS required)
* [ ] If `allowLiveEmbed` is enabled, iframe progressively loads without breaking snapshot fallback
* [ ] Snapshot data is stored safely (plain text + URLs; no unsafe HTML/scripts)
* [ ] Snapshot fetch errors are handled gracefully without wiping existing snapshot context

---

## Implementation Tasks

* [ ] Define `SocialEmbed` block schema in Payload
* [ ] Implement platform detection + embedId extraction (as needed)
* [ ] Implement oEmbed/metadata fetcher (server-only) with timeouts + error handling
* [ ] Add Payload hook/endpoint to populate `snapshot` on save
* [ ] Build Server Component: `SocialEmbedSnapshot`
* [ ] Build Client Component: `SocialEmbedIframe` (lazy-load + fallback)
* [ ] Wire block renderer to use snapshot-first + optional iframe enhancement
* [ ] Add admin UI indicators for `status/fetchedAt` (optional)
* [ ] Add “Refresh embed” action (optional)

---

## Notes / Risks

* Storing raw provider HTML is discouraged; if ever needed, it must be sanitized and treated as untrusted input.
* Periodic revalidation can be added later, but snapshot storage is the durable context-preserving mechanism.
* Terms of service may affect how much post content you store; prefer minimal excerpts and canonical linking.
