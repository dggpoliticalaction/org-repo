'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'

const sizeClasses = {
  small: 'max-w-xs',
  medium: 'max-w-md',
  large: 'max-w-lg',
  full: 'w-full',
}

type Size = keyof typeof sizeClasses

interface SquiggleProps {
  className?: string
  size?: Size
}

const SquiggleStatic: React.FC<SquiggleProps> = ({ className, size = 'small' }) => {
  return (
    <div className={cn('mx-auto my-8', sizeClasses[size], className)}>
      <div
        className={cn(
          'bg-[url(/squiggle-static.svg)] w-full h-1 bg-[length:auto_4px] bg-repeat-x bg-[left_calc(100%)_top_calc(100%)] relative block',
        )}
      />
    </div>
  )
}

const Squiggle: React.FC<SquiggleProps> = ({ className, size = 'small' }) => {
  return (
    <div className={cn('mx-auto my-8', sizeClasses[size], className)}>
      <div
        className={cn(
          'bg-[url(/squiggle.svg)] w-full h-1 bg-[length:auto_4px] bg-repeat-x bg-[left_calc(100%)_top_calc(100%)] relative block',
        )}
      />
    </div>
  )
}

export { Squiggle, SquiggleStatic }
