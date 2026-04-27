import type { FootnoteBlock } from "@/payload-types"
import React from "react"

interface FootnoteLabelProps {
  siblingData: Partial<FootnoteBlock>
}

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({
  siblingData: { index, sourceId, note },
}) => {
  if (!note) return <span>Footnote</span>
  if (sourceId) return <span>{`↗ [${index}]`}</span>
  return <span>{`[${index}]`}</span>
}
