import React from 'react'

import { cn } from '@/utilities/ui'

export interface FootnoteBlockProps {
  id?: string
  note: string
  blockType: 'footnote'
}

type FootnoteInlineProps = FootnoteBlockProps & {
  className?: string
  index?: number
}

export const FootnoteBlock: React.FC<FootnoteInlineProps> = ({ note, index, className }) => {
  if (!note || !index) return null

  const displayMarker = String(index)
  const targetId = `footnote-${index}`
  const referenceId = `footnote-ref-${index}`

  return (
    <sup
      className={cn('footnote', className)}
      title={note}
      aria-label={`Footnote: ${note}`}
      id={referenceId}
    >
      {targetId ? (
        <a className="footnote-link text-brand no-underline shadow-none" href={`#${targetId}`}>
          {displayMarker}
        </a>
      ) : (
        displayMarker
      )}
    </sup>
  )
}
