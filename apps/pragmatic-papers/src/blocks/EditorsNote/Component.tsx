import type { EditorsNote as EditorsNoteBlockProps } from 'src/payload-types'

import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
  index?: number
} & EditorsNoteBlockProps

export const EditorsNoteBlock: React.FC<Props> = ({ className, content, index }) => {
  if (!content) return null
  return (
    <div className={className} key={index}>
      <h4 className="font-sans text-center text-3xl font-bold leading-tight tracking-normal my-8">
        Editor's Note:
      </h4>
      <RichText enableGutter={false} className="font-serif" data={content} />
    </div>
  )
}
