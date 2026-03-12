import React from 'react'
import Link from 'next/link'

import type { Topic } from '@/payload-types'
import { cn } from '@/utilities/ui'

export interface TopicBadgeProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  topic: number | Topic | null | undefined
}


export const TopicBadge: React.FC<TopicBadgeProps> = ({ topic, className, ...props }) => {
  if (!topic || typeof topic !== 'object') return null

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-brand hover:text-brand',
        className,
      )}
      {...props}
    >
      {topic.name}
    </Link>
  )
}

