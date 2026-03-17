import React from "react"

import { cn } from "@/utilities/ui"
import { CollectionTile } from "../CollectionTile"
import type { LayoutDefinition, LayoutProps } from "../types"

export const Vespucci7: LayoutDefinition = {
  label: "Vespucci 7",
  slotDescriptions: [
    "Featured Centered (Image Right)",
    "Left Column, Top",
    "Left Column, Bottom",
    "Right Column, First (Compact)",
    "Right Column, Second (Compact)",
    "Right Column, Third (Compact)",
    "Right Column, Fourth (Compact)",
  ],
}

/**
 * Vespucci 7 Layout
 *
 * Slots (by index):
 *   0: Featured — center column (50%, image above)
 *   1: A — left column, top
 *   2: B — left column, bottom
 *   3: C — right column (no image)
 *   4: D — right column (no image)
 *   5: E — right column (no image)
 *   6: F — right column (no image)
 *
 * Desktop (lg:grid-cols-3 — 25%/50%/25%)
 */
export const Vespucci7Layout: React.FC<LayoutProps> = ({ className, slots, ...props }) => {
  const [featured, a, b, c, d, e, f] = slots

  return (
    <section
      className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]", className)}
      {...props}
    >
      {/* Featured — center column (50%), spans 2 rows */}
      <CollectionTile
        className="h-full md:col-span-2 md:row-span-2 lg:col-span-1 lg:row-span-2"
        tile={featured!}
      />

      {/* Slots A + B — left column (25%), spans 2 rows */}
      <div className="grid grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2 lg:order-first lg:col-span-1 lg:row-span-2 lg:grid-cols-1">
        <CollectionTile tile={a!} />
        <CollectionTile tile={b!} />
      </div>

      {/* Slots C–F — right column (25%), 4 tiles with no image */}
      <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:grid-cols-1">
        <CollectionTile tile={c!} imagePosition="none" showByline />
        <CollectionTile tile={d!} imagePosition="none" showByline />
        <CollectionTile tile={e!} imagePosition="none" showByline />
        <CollectionTile tile={f!} imagePosition="none" showByline />
      </div>
    </section>
  )
}
