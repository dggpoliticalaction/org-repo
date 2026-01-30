'use client'

import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // If the script is already present (client nav / HMR), mark ready.
  useEffect(() => {
    if (window.twttr?.widgets?.load) setReady(true)
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
      window.twttr?.widgets?.load?.(node)
    })

    return () => cancelAnimationFrame(id)
  }, [ready, html, pathname])

  return (
    <div className="my-4 flex items-center justify-center">
      <Script
        id="twitter-widgets"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[224px] w-full max-w-[550px] [&>div]:!my-0" />
    </div>
  )
}
