import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Euler 4"

export const slotDescriptions = ["Featured", "Right top", "Right middle", "Right bottom"]

/**
 * Euler 4 Layout
 * Desktop: 75%/25% two-column split
 */
export const Euler4Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  const [featured, a, b, c] = slots

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[75%_25%]">
      {/* Featured — left column (75%) */}
      <ArticleTile
        article={featured!.article}
        imagePosition="above"
        showByline={false}
        kicker={featured!.kicker}
        overrideTitle={featured!.overrideTitle}
        className="h-full text-center"
      />

      {/* Right column — 3 stacked tiles (25%) */}
      <div className="grid grid-cols-3 gap-6 lg:grid-cols-1">
        <ArticleTile
          article={a!.article}
          imagePosition="above"
          showByline={false}
          kicker={a!.kicker}
          overrideTitle={a!.overrideTitle}
        />
        <ArticleTile
          article={b!.article}
          imagePosition="none"
          showByline={false}
          kicker={b!.kicker}
          overrideTitle={b!.overrideTitle}
        />
        <ArticleTile
          article={c!.article}
          imagePosition="none"
          showByline={false}
          kicker={c!.kicker}
          overrideTitle={c!.overrideTitle}
        />
      </div>
    </div>
  )
}

export const Newton4: LayoutDefinition = {
  label,
  slotDescriptions,
  component: Euler4Layout,
}
