/* eslint-disable @next/next/no-img-element */
import { getClientSideURL } from '@/utilities/getURL'
import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  size?: 'xs' | 'sm' | 'md'
  theme?: 'light' | 'dark' | null
}

export const Logo = (props: Props): React.ReactElement => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, size, theme } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  if (theme == 'light') {
    return (
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
        src={getClientSideURL() + '/pragmaticpapers-logo-light.svg'}
      />
    )
  } else if (theme === 'dark') {
    return (
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

  return (
    <>
      <img
        alt="Pragmatic Papers Logo"
        width={193}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(
          'w-full h-auto hidden dark:block',
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
      <img
        alt="Pragmatic Papers Logo"
        width={193}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(
          'w-full h-auto block dark:hidden',
          size
            ? {
                'max-w-xs': size === 'xs',
                'max-w-sm': size === 'sm',
                'max-w-md': size === 'md',
              }
            : 'max-w-xs sm:max-w-sm md:max-w-md',
          className,
        )}
        src={getClientSideURL() + '/pragmaticpapers-logo-light.svg'}
      />
    </>
  )
}
