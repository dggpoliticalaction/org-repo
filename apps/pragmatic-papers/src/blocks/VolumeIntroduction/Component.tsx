import type { VolumeIntroduction as VolumeIntroductionBlockProps } from 'src/payload-types'
import React from 'react'
import RichText from '@/components/RichText'

import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  index?: number
} & VolumeIntroductionBlockProps

export const VolumeIntroductionComponent: React.FC<Props> = ({ className, content, index }) => {
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
