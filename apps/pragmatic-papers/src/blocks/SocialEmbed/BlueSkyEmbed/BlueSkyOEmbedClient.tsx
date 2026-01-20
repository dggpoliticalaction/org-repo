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
interface BlueSkyOEmbedClientProps {
  html: string
}

export function BlueSkyOEmbedClient({ html }: BlueSkyOEmbedClientProps): React.ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current) return

    window.bluesky?.scan?.(ref.current)
  }, [ready])

  return (
    <div className="my-4 flex items-center justify-center">
      <Script
        id="bluesky-embed"
        src="https://embed.bsky.app/static/embed.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div
        ref={ref}
        className="min-h-[171px] w-full max-w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
