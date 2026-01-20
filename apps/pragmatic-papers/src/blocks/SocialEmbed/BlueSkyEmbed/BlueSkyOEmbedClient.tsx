'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    bluesky?: {
      scan?: (node?: ParentNode) => void
    }
  }
}

export function BlueSkyOEmbedClient({ blockquote }: { blockquote: string }): React.ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current) return

    if (window.bluesky?.scan) {
      window.bluesky.scan(ref.current)
      return
    }

  }, [ready])

  return (
    <div className='flex justify-center'>
      <Script src='https://embed.bsky.app/static/embed.js' strategy="afterInteractive" onLoad={() => setReady(true)} />
      <div
        ref={ref}
        className='min-h-[171px] w-full max-w-[600px] text-white dark:text-black'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: blockquote }}
      />
    </div>
  )
}
