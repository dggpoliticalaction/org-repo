import { assetKeyFor } from "@/interactives/engine/records"
import { buildRegionIndex } from "@/interactives/engine/regions"
import {
  DRILLDOWN_SCHEMA,
  type ChildAssetRef,
  type DeclaredRegion,
  type DrilldownAsset,
  type DrilldownPath,
  type DrilldownPayload,
  type RegionIndex,
} from "@/interactives/engine/types"
import { isRecord } from "@/utilities/isRecord"

import type { DrilldownData, DrilldownGeometry, DrilldownPresentation, GeometryFile } from "./types"

/**
 * Where the ownership rule is enforced.
 *
 * The engine renders `DrilldownAsset`s. These functions build them from the three sources —
 * code geometry, code presentation, synced data — and are the only place the three meet.
 * `facts`, `seats` and `records.display` are taken from `presentation` and from nothing else;
 * path facts are emptied so nothing baked into a geometry file leaks through either. A feed
 * that carries a `display` block, or geometry with `data-color` on a path, changes nothing.
 */

export interface ComposeInput {
  presentation: DrilldownPresentation
  geometry: DrilldownGeometry
  data: DrilldownData
}

/**
 * Side tables for the `portrait` detail lines: the profile names a dataset and the fields to
 * read; the feed supplies the rows. A dataset the feed does not carry yields no table, and a
 * portrait line then falls back to the plain value it already had.
 */
function composeLookups(
  presentation: DrilldownPresentation,
  data: DrilldownData,
): DrilldownPayload["lookups"] {
  if (!presentation.lookups) return undefined
  const out: NonNullable<DrilldownPayload["lookups"]> = {}
  for (const [name, source] of Object.entries(presentation.lookups)) {
    const raw = data.datasets?.[source.dataset]
    if (!isRecord(raw)) continue
    const table: Record<string, { image?: string; label?: string; source?: string }> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (!isRecord(value)) continue
      const entry: { image?: string; label?: string; source?: string } = {}
      const read = (field: string | undefined): string | undefined => {
        if (!field) return undefined
        const v = value[field]
        return typeof v === "string" && v !== "" ? v : undefined
      }
      const image = read(source.image)
      const label = read(source.label)
      const src = read(source.source)
      if (image) entry.image = image
      if (label) entry.label = label
      if (src) entry.source = src
      if (Object.keys(entry).length > 0) table[key] = entry
    }
    if (Object.keys(table).length > 0) out[name] = table
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** Structural attributes only — every fact a reader sees comes from the data. */
function geometryPaths(file: GeometryFile | null): DrilldownPath[] {
  return file ? file.paths.map((p) => ({ ...p, facts: {} })) : []
}

/** Region ids that have a child asset — the ones a reader can drill into. */
export function childKeys(geometry: DrilldownGeometry): string[] {
  return Object.keys(geometry.children)
}

/**
 * The full hierarchy as the client will see it once every child is loaded: overview paths,
 * every child's paths, and every declared region. Used to bucket records by the child asset
 * that covers them, with the same `assetKeyFor` walk the client uses to look them up.
 */
export function composeIndex({ geometry, data }: Omit<ComposeInput, "presentation">): RegionIndex {
  const assets: DrilldownAsset[] = [
    {
      viewBox: geometry.overview.viewBox,
      flipY: geometry.overview.flipY,
      paths: geometryPaths(geometry.overview),
      payload: { schema: DRILLDOWN_SCHEMA, regions: data.regions },
      payloadError: null,
    },
    ...Object.values(geometry.children)
      .filter((c): c is GeometryFile => c !== null)
      .map((c) => ({
        viewBox: c.viewBox,
        flipY: c.flipY,
        paths: geometryPaths(c),
        payload: null,
        payloadError: null,
      })),
  ]
  return buildRegionIndex(assets)
}

/** Bucketing only asks which regions have an asset, so the rest can be empty here. */
function refsFor(geometry: DrilldownGeometry): ChildAssetRef[] {
  return childKeys(geometry).map((regionId) => ({
    regionId,
    url: "",
    geometryUrl: "",
    hasMap: geometry.children[regionId] !== null,
  }))
}

/** The child asset key each record is served from, or null for the overview. */
export function bucketFor(
  regionId: string,
  index: RegionIndex,
  geometry: DrilldownGeometry,
): string | null {
  return assetKeyFor(regionId, index, refsFor(geometry))
}

export function composeOverview({ presentation, geometry, data }: ComposeInput): DrilldownAsset {
  const index = composeIndex({ geometry, data })
  const items = data.records.filter((r) => bucketFor(r._region, index, geometry) === null)
  return {
    viewBox: geometry.overview.viewBox,
    flipY: geometry.overview.flipY,
    paths: geometryPaths(geometry.overview),
    payload: {
      schema: DRILLDOWN_SCHEMA,
      regions: data.regions,
      ...(presentation.facts ? { facts: presentation.facts } : {}),
      ...(presentation.seats ? { seats: presentation.seats } : {}),
      ...(presentation.icons ? { icons: presentation.icons } : {}),
      ...((): Pick<DrilldownPayload, "lookups"> => {
        const lookups = composeLookups(presentation, data)
        return lookups ? { lookups } : {}
      })(),
      records: { items, display: presentation.display },
    },
    payloadError: null,
  }
}

/** Declared regions in `regionId`'s subtree, so a child asset stands on its own. */
function subtreeRegions(
  regionId: string,
  index: RegionIndex,
  data: DrilldownData,
): DeclaredRegion[] {
  const inSubtree = (id: string): boolean => {
    let cur: string | null = id
    const seen = new Set<string>()
    while (cur && !seen.has(cur)) {
      if (cur === regionId) return true
      seen.add(cur)
      cur = index.byId[cur]?.parentId ?? null
    }
    return false
  }
  return data.regions.filter((r) => inSubtree(r.id))
}

/**
 * A drillable region's two halves, fetched separately because they change on different
 * clocks. The geometry is code — it moves when the map is reprojected, so its URL carries a
 * content hash and is cached forever. The records are the researcher's, and change every time
 * the sync finds something new. Fused, as they used to be, every nightly data change re-sent
 * a map that had not moved: for the Ninth Circuit that is 74 KB of geometry against 22 KB of
 * records, compressed.
 *
 * Both halves are `DrilldownAsset`s, so either URL is something a person can open and read,
 * and the client merges them back into one before the stage ever sees it.
 */
export function composeChildGeometry(
  geometry: DrilldownGeometry,
  regionId: string,
): DrilldownAsset | null {
  if (!Object.prototype.hasOwnProperty.call(geometry.children, regionId)) return null
  const file = geometry.children[regionId] ?? null
  return {
    viewBox: file?.viewBox ?? null,
    flipY: file?.flipY ?? false,
    paths: geometryPaths(file),
    payload: null,
    payloadError: null,
  }
}

/** Every record `regionId` and its descendants own, with the display that draws them. */
export function composeChildData(
  { presentation, geometry, data }: ComposeInput,
  regionId: string,
): DrilldownAsset | null {
  if (!Object.prototype.hasOwnProperty.call(geometry.children, regionId)) return null
  const index = composeIndex({ geometry, data })
  const items = data.records.filter((r) => bucketFor(r._region, index, geometry) === regionId)
  return {
    viewBox: null,
    flipY: false,
    paths: [],
    payload: {
      schema: DRILLDOWN_SCHEMA,
      regions: subtreeRegions(regionId, index, data),
      records: { items, display: presentation.display },
    },
    payloadError: null,
  }
}
