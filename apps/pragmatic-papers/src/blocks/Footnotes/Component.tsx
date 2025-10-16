import type { FootnotesBlock as FootnotesBlockProps } from 'src/payload-types'

import React from 'react'
import RichText from '@/components/RichText'
import type {} from '@/payload-types'

type Props = {
  className?: string
} & FootnotesBlockProps

export const FootnotesBlock: React.FC<Props> = (props) => {
  const { footnotes, className } = props
  return (
    <ol className={className}>
      {footnotes?.map(
        (note) =>
          note.text && (
            <li key={note.id} className="not-prose text-sm">
              <RichText data={note.text} className={'p-0 m-3 text-sm'} />
            </li>
          ),
      )}
    </ol>
  )
}
