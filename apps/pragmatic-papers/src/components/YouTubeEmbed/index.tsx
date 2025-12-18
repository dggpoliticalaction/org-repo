'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { fetchYouTubeEmbed } from '@/utilities/fetchYouTubeEmbed'
import { sanitizeHtml } from '@/utilities/sanitizeHtml'

import './index.scss'

export const YouTubeEmbed: React.FC<{
  url?: string
  maxWidth?: number
  maxHeight?: number
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return

    fetchYouTubeEmbed({
      url: props.url,
      maxwidth: props.maxWidth ?? 1920,
      maxheight: props.maxHeight,
    }).then((res) => {
      if (!res) {
        setContent('YouTube video could not be loaded.')
      } else {
        setContent(sanitizeHtml(res.html))
      }
    })
  }, [props])

  return (
    <div className="youtube-embed-container">
      <div
        className="youtube-embed-content"
        ref={contentRef}
        // HTML is sanitized with DOMPurify before insertion
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
