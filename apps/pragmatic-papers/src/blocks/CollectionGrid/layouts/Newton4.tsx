import React from "react"

import { cn } from "@/utilities/utils"
import { CollectionTile } from "../CollectionTile"
import type { LayoutDefinition, LayoutProps } from "../types"

export const Newton4: LayoutDefinition = {
  label: "Newton 4",
  slotDescriptions: [
    "Featured Left",
    "Right Column, Top",
    "Right Column, Middle",
    "Right Column, Bottom",
  ],
}

/**
 * Newton 4 Layout
 * Desktop: 75%/25% two-column split
 */
export const Newton4Layout: React.FC<LayoutProps> = ({ className, slots, ...props }) => {
  const [featured, a, b, c] = slots

  return (
    <section className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]", className)} {...props}>
      {/* Featured — left column (75%) */}
      <CollectionTile className="h-full" tile={featured!} />

      {/* Right column — 3 stacked tiles (25%) */}
      <div className="grid grid-cols-1 gap-6">
        <CollectionTile tile={a!} />
        <CollectionTile tile={b!} imagePosition="none" />
        <CollectionTile tile={c!} imagePosition="none" />
      </div>
    </section>
  )
}
