import type { FootnoteBlock } from "@/payload-types"
import React from "react"

import { truncate } from "./utils"

interface FootnoteLabelProps {
  siblingData: Partial<FootnoteBlock>
}

const PREVIEW_LIMIT = 20

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({
  siblingData: { index, sourceId, note },
}) => {
  if (!note) return <span>Footnote</span>
  if (typeof index !== "number") return <span>{truncate(note, PREVIEW_LIMIT)}</span>
  if (sourceId) return <span>{`↗ [${index}]`}</span>
  return <span>{`[${index}]`}</span>
}
