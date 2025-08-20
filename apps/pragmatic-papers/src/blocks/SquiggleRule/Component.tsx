import type { SquiggleRuleBlock as SquiggleRuleBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import { Squiggle, SquiggleStatic } from '@/components/ui/squiggle'

type Props = {
  className?: string
} & SquiggleRuleBlockProps

export const SquiggleRuleBlock: React.FC<Props> = ({ className, variant, size }) => {
  const SquiggleComponent = variant === 'static' ? SquiggleStatic : Squiggle

  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full',
  }

  return (
    <div className={cn('mx-auto my-8', sizeClasses[size || 'medium'], className)}>
      <SquiggleComponent />
    </div>
  )
}
