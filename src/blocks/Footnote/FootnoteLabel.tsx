import type { FootnoteBlock } from "@/payload-types"
import React from "react"

interface FootnoteLabelProps {
  siblingData?: Partial<FootnoteBlock> | null
}

const PREVIEW_LIMIT = 20

const truncate = (text: string): string =>
  text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}…` : text

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({ siblingData }) => {
  const note = siblingData?.note
  const sourceId = siblingData?.sourceId

  if (!note) return <span>Footnote</span>
  if (sourceId) return <span>{`↗ ${truncate(note)}`}</span>
  return <span>{truncate(note)}</span>
}
