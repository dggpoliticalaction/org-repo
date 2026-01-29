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
interface BlueskyEmbedClientProps {
  html: string
}

export function BlueskyEmbedClient({ html }: BlueskyEmbedClientProps): React.ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.bluesky?.scan) setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !ref.current) return

    const id = requestAnimationFrame(() => {
      window.bluesky?.scan?.(ref.current!)
    })

    return () => cancelAnimationFrame(id)
  }, [ready, html])

  return (
    <>
      <Script
        id="bluesky-script"
        src="https://embed.bsky.app/static/embed.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div
        ref={ref}
        className="min-h-[171px] w-full md:w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
