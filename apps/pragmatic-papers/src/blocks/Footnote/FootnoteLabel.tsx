import type { FootnoteBlock } from '@/payload-types'
import React from 'react'

interface FootnoteLabelProps {
  siblingData: Partial<FootnoteBlock>
}

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({ siblingData: { note } }) => {
  if (!note) return <span>Footnote</span>
  return <span>{note.length > 15 ? `${note.slice(0, 15)}...` : note}</span>
}
