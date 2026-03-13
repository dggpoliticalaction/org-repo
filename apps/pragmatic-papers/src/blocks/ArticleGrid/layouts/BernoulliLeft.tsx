import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Bernoulli Left"

export const slotDescriptions = ["Article"]

/**
 * Bernoulli Left Layout
 *
 * A single article with the image on the right and the title block on the left.
 */
export const BernoulliLeftLayout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  const [article] = slots

  return (
    <ArticleTile
      article={article!.article}
      imagePosition="right"
      kicker={article!.kicker}
      overrideTitle={article!.overrideTitle}
    />
  )
}

export const BernoulliLeft: LayoutDefinition = {
  label,
  slotDescriptions,
  component: BernoulliLeftLayout,
}
