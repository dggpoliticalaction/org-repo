import { getClientSideURL } from '@/utilities/getURL'
import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Pragmatic Papers Logo"
      width={420}
      height={62.64}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[26.25rem] w-full h-[34px]', className)}
      src={getClientSideURL() + '/pragmaticpapers-logo-dark.svg'}
    />
  )
}
