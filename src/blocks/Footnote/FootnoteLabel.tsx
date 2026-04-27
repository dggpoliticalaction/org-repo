import type { FootnoteBlock } from "@/payload-types"
import React from "react"

interface FootnoteLabelProps {
  siblingData: Partial<FootnoteBlock>
}

const PREVIEW_LIMIT = 20

const truncate = (text: string): string =>
  text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}…` : text

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({
  siblingData: { index, sourceId, note },
}) => {
  if (!note) return <span>Footnote</span>
  if (typeof index !== "number") return <span>{truncate(note)}</span>
  if (sourceId) return <span>{`↗ [${index}]`}</span>
  return <span>{`[${index}]`}</span>
}
