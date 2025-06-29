'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'

const SquiggleStatic: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'bg-[url(/squiggle-static.svg)] w-full h-1 mt-6 bg-[length:auto_4px] bg-repeat-x bg-[left_calc(100%)_top_calc(100%)] relative block',
        className,
      )}
    />
  )
}

const Squiggle: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'bg-[url(/squiggle.svg)] w-full h-1 bg-[length:auto_4px] bg-repeat-x bg-[left_calc(100%)_top_calc(100%)] relative block',
        className,
      )}
    />
  )
}

export { Squiggle, SquiggleStatic }
