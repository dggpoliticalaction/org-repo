import React from 'react'

import { cn } from '@/utilities/ui'

export interface FootnoteBlockProps {
  id?: string
  index?: number
  note: string
  blockType: 'footnote'
}

type FootnoteInlineProps = FootnoteBlockProps & {
  className?: string
  index?: number
}

export const FootnoteBlock: React.FC<FootnoteInlineProps> = ({ note, index, className }) => {
  if (!note || typeof index !== 'number') return null

  const displayMarker = String(index)
  const targetId = `footnote-${index}`
  const referenceId = `footnote-ref-${index}`

  return (
    <sup
      className={cn(className)}
      title={note}
      aria-label={`Footnote: ${note}`}
      id={referenceId}
    >
      {targetId ? (
        <a className="text-brand no-underline shadow-none" href={`#${targetId}`}>
          {displayMarker}
        </a>
      ) : (
        displayMarker
      )}
    </sup>
  )
}
