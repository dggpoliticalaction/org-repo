'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load?: (node?: HTMLElement) => void
      }
    }
  }
}

interface TwitterEmbedClientProps {
  html: string
}

export function TwitterEmbedClient({ html }: TwitterEmbedClientProps): React.ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current) return

    window.twttr?.widgets?.load?.(ref.current)
  }, [ready])

  return (
    <div className="my-4 flex items-center justify-center">
      <Script
        id="twitter-widgets"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div
        ref={ref}
        className="min-h-[224px] w-full max-w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
