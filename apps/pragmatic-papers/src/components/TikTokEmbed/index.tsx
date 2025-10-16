'use client'

import { fetchTikTokEmbed } from '@/utilities/fetchTikTokEmbed'
import { useEffect, useState } from 'react'

let tiktokScriptLoaded = false

export const TikTokEmbed: React.FC<{
  url?: string
}> = (props) => {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (!props.url) return

    fetchTikTokEmbed({ url: props.url }).then((res) => {
      if (!res) {
        setContent('TikTok video could not be loaded.')
      } else {
        setContent(res.html)

        if (!tiktokScriptLoaded) {
          tiktokScriptLoaded = true
          const script = document.createElement('script')
          script.src = 'https://www.tiktok.com/embed.js'
          script.async = true
          document.body.appendChild(script)
        }
      }
    })
  }, [props.url])

  return (
    <div>
      {/* This shouldn't be dangerous as the HTML is coming from Payload after it's retrieved from the TikTok oEmbed API. */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
