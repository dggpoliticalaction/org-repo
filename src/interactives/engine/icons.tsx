import { Gavel, Landmark, Scale } from "lucide-react"
import React from "react"

import type { RegionIcons, RegionInfo } from "./types"

/**
 * The icons a profile may put beside a region in the rail.
 *
 * An allowlist rather than a free import: what travels from a profile through the payload is
 * a name, so this is where a name becomes a component and the set stays something a reviewer
 * can see at a glance. Add one here when a profile needs it.
 */
const ICONS = {
  scale: Scale,
  gavel: Gavel,
  landmark: Landmark,
} as const

export type IconName = keyof typeof ICONS

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in ICONS
}

/**
 * The icon for one region: named for the region itself, else for the layer it is drawn on,
 * else the profile's default. A profile that declares none gets none — the rail reads fine
 * without them, and thirteen identical glyphs would say less than the names already do.
 */
export function regionIcon(
  region: Pick<RegionInfo, "id" | "layer">,
  icons: RegionIcons | undefined,
): React.ReactNode {
  if (!icons) return null
  const name =
    icons.byRegion?.[region.id] ??
    (region.layer ? icons.byLayer?.[region.layer] : undefined) ??
    icons.default
  if (!isIconName(name)) return null
  const Icon = ICONS[name]
  return <Icon aria-hidden="true" />
}
