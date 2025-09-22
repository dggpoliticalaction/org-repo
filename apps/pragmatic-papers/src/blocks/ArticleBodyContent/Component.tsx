import type { ArticleBodyContent as ArticleBodyContentBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
  index?: number
} & ArticleBodyContentBlockProps

export const ArticleBodyContentBlock: React.FC<Props> = ({ className, content, index }) => {
  if (!content) return null
  return (
    <RichText
      enableGutter={false}
      key={index}
      className={cn(className, 'font-serif')}
      data={content}
    />
  )
}
