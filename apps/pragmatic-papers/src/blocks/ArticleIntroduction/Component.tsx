import type { ArticleIntroduction as ArticleIntroductionBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
  index?: number
} & ArticleIntroductionBlockProps

export const ArticleIntroductionBlock: React.FC<Props> = ({ className, content, index }) => {
  if (!content) return null
  return (
    <RichText
      enableGutter={false}
      className={cn(className, 'font-serif')}
      key={index}
      data={content}
    />
  )
}
