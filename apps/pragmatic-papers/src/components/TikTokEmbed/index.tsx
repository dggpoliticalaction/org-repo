'use client'

import { fetchTikTokEmbed } from '@/utilities/fetchTikTokEmbed'
import { useEffect, useState, useRef } from 'react'

// Track if the TikTok script has been loaded globally
let tiktokScriptLoaded = false
let tiktokScriptLoading = false

export const TikTokEmbed: React.FC<{
  url?: string
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return

    fetchTikTokEmbed({ url: props.url }).then((res) => {
      if (!res) {
        setContent('TikTok video could not be loaded.')
      } else {
        setContent(res.html)
      }
    })
  }, [props.url])

  // Load TikTok script once globally and process embeds
  useEffect(() => {
    if (!content || !containerRef.current) return

    const loadScript = () => {
      if (tiktokScriptLoaded) {
        // Script already loaded, just process this embed
        return
      }

      if (tiktokScriptLoading) {
        // Script is loading, wait for it
        const checkInterval = setInterval(() => {
          if (tiktokScriptLoaded) {
            clearInterval(checkInterval)
          }
        }, 100)
        return
      }

      // Load the script for the first time
      tiktokScriptLoading = true
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      script.onload = () => {
        tiktokScriptLoaded = true
        tiktokScriptLoading = false
      }
      document.body.appendChild(script)
    }

    loadScript()
  }, [content])

  return (
    <div ref={containerRef}>
      {/* This shouldn't be dangerous as the HTML is coming from Payload after it's retrieved from the TikTok oEmbed API. */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
