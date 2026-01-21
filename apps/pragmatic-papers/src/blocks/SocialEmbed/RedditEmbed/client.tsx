'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

interface RedditOEmbedClientProps {
  html: string
}

export function RedditEmbedClient({ html }: RedditOEmbedClientProps): React.ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current) return

    // On client-side navigations, the script may already be loaded.
    // Re-inserting it is the most reliable "rescan" approach when no public API is available.
    const s = document.createElement('script')
    s.id = 'reddit-embed-widgets'
    s.src = 'https://embed.reddit.com/widgets.js'
    s.async = true
    s.charset = 'UTF-8'
    ref.current.appendChild(s)

    return () => {
      s.remove()
    }
  }, [ready])

  return (
    <div className="my-4 flex justify-center items-center">
      <Script
        id="reddit-embed-widgets"
        src="https://embed.reddit.com/widgets.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div
        ref={ref}
        className="flex items-center min-h-[150px] w-full max-w-[550px]"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
