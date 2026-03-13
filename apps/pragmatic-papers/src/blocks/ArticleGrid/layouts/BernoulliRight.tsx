import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Bernoulli Right"

export const slotDescriptions = ["Article"]

/**
 * Bernoulli Right Layout
 *
 * A single article with the image on the left and the title block on the right.
 */
export const BernoulliRightLayout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  const [article] = slots

  return (
    <ArticleTile
      article={article!.article}
      imagePosition="left"
      kicker={article!.kicker}
      overrideTitle={article!.overrideTitle}
    />
  )
}

export const BernoulliRight: LayoutDefinition = {
  label,
  slotDescriptions,
  component: BernoulliRightLayout,
}
