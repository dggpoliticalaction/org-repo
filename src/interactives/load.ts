import { unstable_cache } from "next/cache"
import { draftMode } from "next/headers"
import { cache } from "react"

import { interactivePath, interactiveTag } from "@/collections/InteractiveSnapshots/tag"
import type { SearchIndex } from "@/interactives/engine/search"
import type { ChildAssetRef, DrilldownAsset } from "@/interactives/engine/types"
import type { Interactive } from "@/payload-types"
import { getPayloadConfig } from "@/utilities/getPayloadConfig"
import { isRecord } from "@/utilities/isRecord"

import { childKeys, composeChildData, composeChildGeometry, composeOverview } from "./compose"
import { geometryHash, profileFingerprint } from "./hash"
import { getProfile } from "./profiles"
import { composeSearchIndex } from "./search"
import { DRILLDOWN_DATA_SCHEMA, type DrilldownData, type InteractiveProfile } from "./types"

/**
 * Server-side loading for an interactive page. Two rules keep this cheap and correct:
 *
 * - The snapshot document is megabytes. It is read once per request (`React.cache`) and what
 *   gets cached across requests is the *composed* asset for one view — the overview, or one
 *   region — each well under a megabyte, tagged so the sync and the collection hooks can drop
 *   them together.
 * - In draft mode nothing is cached and the newest snapshot version is read, draft or
 *   published. That is the preview: an editor opens the page from the admin and sees the
 *   researcher's latest data in the site's design before publishing it.
 */

export const queryInteractiveBySlug = cache(async (slug: string): Promise<Interactive | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadConfig()
  const { docs } = await payload.find({
    collection: "interactives",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
    depth: 1,
  })
  return docs[0] ?? null
})

/** The snapshot as the sync validated it; drafts only when asked. */
const readSnapshotData = cache(
  async (interactiveId: number, draft: boolean): Promise<DrilldownData | null> => {
    const payload = await getPayloadConfig()
    const { docs } = await payload.find({
      collection: "interactive-snapshots",
      where: { interactive: { equals: interactiveId } },
      draft,
      overrideAccess: draft,
      limit: 1,
      depth: 0,
      pagination: false,
    })
    const data = docs[0]?.data
    if (!isRecord(data) || data.schema !== DRILLDOWN_DATA_SCHEMA) return null
    return data as unknown as DrilldownData
  },
)

/**
 * The code half of the cache key, worked out once per profile per process. The geometry it
 * hashes is imported JSON held for the life of the process, so this is one pass over it.
 */
const fingerprints = new Map<string, Promise<string>>()

function fingerprintOf(profile: InteractiveProfile): Promise<string> {
  const held = fingerprints.get(profile.id)
  if (held) return held
  const computed = profile
    .loadGeometry()
    .then((geometry) => profileFingerprint(profile.presentation, geometry))
  fingerprints.set(profile.id, computed)
  return computed
}

export interface ComposedOverview {
  overview: DrilldownAsset
  childAssets: ChildAssetRef[]
  /** Same-origin route serving the record search index, fetched on the reader's first query. */
  searchUrl: string
  /** The profile's landing-view payload, or null when it declares no summary. */
  summary: unknown
  /** A line of provenance for the header, beside "Data as of …", or null. */
  metaLine: string | null
  /** When upstream generated the data the page is showing, and who upstream is. */
  generatedAt: string
  source: DrilldownData["source"]
  /** Configuration problems worth surfacing to an editor; the page still renders. */
  problems: string[]
}

async function composeOverviewFor(
  interactive: Interactive,
  profile: InteractiveProfile,
  draft: boolean,
): Promise<ComposedOverview | null> {
  const [data, geometry] = await Promise.all([
    readSnapshotData(interactive.id, draft),
    profile.loadGeometry(),
  ])
  if (!data) return null
  const overview = composeOverview({ presentation: profile.presentation, geometry, data })
  // Two URLs per region, because the halves change on different clocks. The geometry's
  // carries a hash of itself: it is code, so the only thing that moves it is a reprojection,
  // and a URL that changes then is one a browser can hold on to forever.
  const childAssets = childKeys(geometry).map((regionId) => {
    const base = `${interactivePath(interactive.slug)}/regions/${encodeURIComponent(regionId)}`
    return {
      regionId,
      url: base,
      geometryUrl: `${base}/geometry/${geometryHash(geometry.children[regionId] ?? null)}`,
    }
  })
  const problems: string[] = []
  if (overview.viewBox === null) problems.push("overview geometry has no usable viewBox")
  return {
    overview,
    childAssets,
    searchUrl: `${interactivePath(interactive.slug)}/search`,
    summary: profile.summary?.compose({ presentation: profile.presentation, data }) ?? null,
    metaLine: profile.metaLine?.({ data }) ?? null,
    generatedAt: data.generatedAt,
    source: data.source,
    problems,
  }
}

async function composeChildFor(
  interactive: Interactive,
  profile: InteractiveProfile,
  regionId: string,
  draft: boolean,
): Promise<DrilldownAsset | null> {
  const [data, geometry] = await Promise.all([
    readSnapshotData(interactive.id, draft),
    profile.loadGeometry(),
  ])
  if (!data) return null
  return composeChildData({ presentation: profile.presentation, geometry, data }, regionId)
}

/** The overview view of an interactive, or null when it has no snapshot to show. */
export async function loadInteractiveOverview(
  interactive: Interactive,
): Promise<ComposedOverview | null> {
  const profile = getProfile(interactive.profile)
  if (!profile) return null
  const { isEnabled: draft } = await draftMode()
  if (draft) return composeOverviewFor(interactive, profile, true)
  return unstable_cache(
    () => composeOverviewFor(interactive, profile, false),
    [
      "interactive-overview",
      String(interactive.id),
      interactive.slug,
      await fingerprintOf(profile),
    ],
    { tags: [interactiveTag(interactive.id)] },
  )()
}

/**
 * One region's shapes. Code, not data: no snapshot is read, nothing is cached by tag, and the
 * route that serves it tells the browser to keep it forever — the hash in its URL is what
 * makes that safe.
 */
export async function loadInteractiveGeometry(
  interactive: Interactive,
  regionId: string,
): Promise<DrilldownAsset | null> {
  const profile = getProfile(interactive.profile)
  if (!profile) return null
  return composeChildGeometry(await profile.loadGeometry(), regionId)
}

/** One region's records, or null when the region is not drillable / there is no snapshot. */
export async function loadInteractiveRegion(
  interactive: Interactive,
  regionId: string,
): Promise<DrilldownAsset | null> {
  const profile = getProfile(interactive.profile)
  if (!profile) return null
  const { isEnabled: draft } = await draftMode()
  if (draft) return composeChildFor(interactive, profile, regionId, true)
  return unstable_cache(
    () => composeChildFor(interactive, profile, regionId, false),
    ["interactive-region", String(interactive.id), regionId, await fingerprintOf(profile)],
    { tags: [interactiveTag(interactive.id)] },
  )()
}

async function composeSearchIndexFor(
  interactive: Interactive,
  profile: InteractiveProfile,
  draft: boolean,
): Promise<SearchIndex | null> {
  const data = await readSnapshotData(interactive.id, draft)
  if (!data) return null
  return composeSearchIndex({ presentation: profile.presentation, data })
}

/** The record search index, or null when the interactive has no snapshot to search. */
export async function loadInteractiveSearchIndex(
  interactive: Interactive,
): Promise<SearchIndex | null> {
  const profile = getProfile(interactive.profile)
  if (!profile) return null
  const { isEnabled: draft } = await draftMode()
  if (draft) return composeSearchIndexFor(interactive, profile, true)
  return unstable_cache(
    () => composeSearchIndexFor(interactive, profile, false),
    ["interactive-search", String(interactive.id), interactive.slug, await fingerprintOf(profile)],
    { tags: [interactiveTag(interactive.id)] },
  )()
}
