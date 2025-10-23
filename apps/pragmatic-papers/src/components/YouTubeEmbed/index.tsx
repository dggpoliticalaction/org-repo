'use client'

import type React from 'react';
import { useEffect, useRef, useState } from 'react'

import { fetchYouTubeEmbed } from '@/utilities/fetchYouTubeEmbed';

import './index.scss'

export const YouTubeEmbed: React.FC<{
  url?: string,
  maxWidth?: number,
  maxHeight?: number,
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return

    fetchYouTubeEmbed({
      url: props.url,
      maxwidth: props.maxWidth ?? 1920,
      maxheight: props.maxHeight,
    })
      .then(res => {
        if (!res) {
          setContent('YouTube video could not be loaded.')
        } else {
          setContent(res.html)
        }
      })
  }, [props])

  return (
    <div className="youtube-embed-container">
      <div
        // This shouldn't be dangerous as the HTML is coming from Payload after it's retrieved from the YouTube oEmbed API.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
        ref={contentRef}
        className="youtube-embed-content"
      />
    </div>
  )
}
