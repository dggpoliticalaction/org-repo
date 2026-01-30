'use client'

import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // If the script is already present (client nav / HMR), mark ready.
  useEffect(() => {
    if (window.bluesky?.scan) setReady(true)
  }, [])

  // Inject markup only when it changes.
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = html
  }, [html])

  // Transform to iframe when ready, when markup changes, and on navigation.
  useEffect(() => {
    if (!ready || !ref.current) return

    const node = ref.current
    const id = requestAnimationFrame(() => {
      window.bluesky?.scan?.(node)
    })

    return () => cancelAnimationFrame(id)
  }, [ready, html, pathname])

  return (
    <div className="my-4 flex items-center justify-center">
      <Script
        id="bluesky-script"
        src="https://embed.bsky.app/static/embed.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[171px] w-full max-w-[550px] [&>div]:!my-0" />
    </div>
  )
}
