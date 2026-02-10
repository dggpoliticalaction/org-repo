'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { fetchBlueSkyEmbed } from '@/utilities/fetchBlueSkyEmbed'

let blueSkyScriptLoaded = false

export const BlueSkyEmbed: React.FC<{
  url?: string
  maxWidth?: number | undefined
}> = ({ url, maxWidth }) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!url) return
    if (typeof document === 'undefined') return

    const theme = document.getElementsByTagName('html')[0]?.getAttribute('data-theme') ?? 'light'

    fetchBlueSkyEmbed({
      url,
      maxwidth: maxWidth,
      theme: theme as 'light' | 'dark',
    }).then((res) => {
      if (!res) {
        setContent('Bluesky post could not be loaded.')
      } else {
        setContent(res.html)
        if (!blueSkyScriptLoaded) {
          blueSkyScriptLoaded = true
          const script = document.createElement('script')
          script.src = 'https://embed.bsky.app/static/embed.js'
          script.async = true
          document.body.appendChild(script)
        }
      }
    })
  }, [url, maxWidth])

  return (
    <div>
      {/* This shouldn't be dangerous as the HTML is coming from Payload after it's retrieved from the Bluesky oEmbed API. */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} ref={contentRef} />
    </div>
  )
}
