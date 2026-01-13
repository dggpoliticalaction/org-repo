'use client'

import type { SocialEmbedBlock } from '@/payload-types'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    twttr?: {
      widgets: { load: (element?: HTMLElement) => void }
    }
  }
}

export const TwitterEmbedBlock: React.FC<SocialEmbedBlock> = ({ url, hideMedia, hideThread }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current) return
    window.twttr?.widgets.load(ref.current)
  }, [ready])

  const params = new URLSearchParams()
  if (hideMedia) params.set('hide_media', 'true')
  if (hideThread) params.set('hide_thread', 'true')
  const href = params.toString() ? `${url}?${params}` : url

  return (
    <div className="flex justify-center">
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[200px] w-full max-w-[550px]">
        <blockquote className="twitter-tweet">
          <p>View this tweet on X:</p>
          <a href={href} target="_blank" rel="noopener noreferrer" />
        </blockquote>
      </div>
    </div>
  )
}
