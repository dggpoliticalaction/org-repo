import { getClientSideURL } from '@/utilities/getURL'
import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  size?: 'xs' | 'sm' | 'md'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, size } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Pragmatic Papers Logo"
      width={193}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx(
        'w-full h-auto',
        size
          ? {
              'max-w-xs': size === 'xs',
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
            }
          : 'max-w-xs sm:max-w-sm md:max-w-md',
        className,
      )}
      src={getClientSideURL() + '/pragmaticpapers-logo-dark.svg'}
    />
  )
}
