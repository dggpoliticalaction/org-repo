import { createHash } from "node:crypto"

import type { DrilldownData, DrilldownGeometry, DrilldownPresentation, GeometryFile } from "./types"

/** JSON with object keys sorted at every level, so equal data hashes equal. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (typeof v !== "object" || v === null || Array.isArray(v)) return v
    const sorted: Record<string, unknown> = {}
    for (const k of Object.keys(v as Record<string, unknown>).sort())
      sorted[k] = (v as Record<string, unknown>)[k]
    return sorted
  })
}

/**
 * Content hash of a feed. Upstream's version stamp says "their build changed"; this says
 * "what we render changed" — a geometry-only upstream commit, or a rebuild that only bumped
 * the timestamp, moves the first but not the second, and the sync writes a new version only
 * when the second moves. Provenance (`source`, `generatedAt`) is therefore left out.
 */
export function hashDrilldownData(
  data: Pick<DrilldownData, "regions" | "records"> & Partial<Pick<DrilldownData, "datasets">>,
): string {
  const rendered = { regions: data.regions, records: data.records, datasets: data.datasets }
  return createHash("sha256").update(stableStringify(rendered)).digest("hex").slice(0, 16)
}

/**
 * Content hash of one region's geometry, which is code: it moves when the map is reprojected
 * and at no other time. It goes in the URL the geometry is served from, so that URL can be
 * cached forever and a reprojection issues a new one — the alternative being a map that is
 * held after it has changed, which no editor can clear.
 */
const geometryHashes = new WeakMap<GeometryFile, string>()

export function geometryHash(file: GeometryFile | null): string {
  if (!file) return "none"
  const cached = geometryHashes.get(file)
  if (cached) return cached
  const hash = createHash("sha256").update(stableStringify(file)).digest("hex").slice(0, 12)
  geometryHashes.set(file, hash)
  return hash
}

/**
 * What a profile's *code* contributes to a composed asset: its presentation, and the geometry
 * it draws. Both are checked in, so this moves on a deploy and at no other time.
 *
 * It belongs in the cache key because the composed asset is a mixture of code and data, and
 * the tag on it only knows about the data. Without it, changing a label, an icon or a set of
 * options served the old one until an editor happened to publish something — which is not a
 * connection anyone would make, and cost this project three separate afternoons of "why is it
 * still showing that".
 */
export function profileFingerprint(
  presentation: DrilldownPresentation,
  geometry: DrilldownGeometry,
): string {
  const parts = [
    stableStringify(presentation),
    geometryHash(geometry.overview),
    ...Object.keys(geometry.children)
      .sort()
      .map((id) => `${id}:${geometryHash(geometry.children[id] ?? null)}`),
  ]
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 12)
}
