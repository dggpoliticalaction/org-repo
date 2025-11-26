'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { fetchBlueSkyEmbed } from '@/utilities/fetchBlueSkyEmbed'
import { sanitizeHtml } from '@/utilities/sanitizeHtml'

export const BlueSkyEmbed: React.FC<{
  url?: string
  maxWidth?: number | undefined
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return
    if (typeof document === 'undefined') return

    const theme = document.getElementsByTagName('html')[0]?.getAttribute('data-theme') ?? 'light'

    fetchBlueSkyEmbed({
      url: props.url,
      maxwidth: props.maxWidth,
      theme: theme as 'light' | 'dark',
    }).then((res) => {
      if (!res) {
        setContent('Bluesky post could not be loaded.')
      } else {
        setContent(sanitizeHtml(res.html))

        const script = document.createElement('script')
        script.src = 'https://embed.bsky.app/static/embed.js'
        script.async = true
        document.body.appendChild(script)
      }
    })
  }, [props])

  return (
    <div>
      {/* HTML is sanitized with DOMPurify before insertion */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} ref={contentRef} />
    </div>
  )
}
