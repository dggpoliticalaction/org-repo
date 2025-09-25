'use client'

import { fetchRedditEmbed } from "@/utilities/fetchRedditEmbed"
import { useEffect, useState } from "react"

export const RedditEmbed: React.FC<{
  url?: string
}> = (props) => {

  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (!props.url) return

    fetchRedditEmbed({ url: props.url })
      .then(res => {
        if (!res) {
          setContent('Reddit post could not be loaded.')
        } else {
          setContent(res.html)
          // have to manually load the script because the next/script will only run once
          setTimeout(() => {
            const script = document.createElement('script')
            script.src = "https://embed.reddit.com/widgets.js"
            document.body.appendChild(script)
          }, 50)
        }
      })
  }, [props.url])

  return (
    <div>
      {/* This shouldn't be dangerous as the HTML is coming from Payload after it's retrieved from the Reddit oEmbed API. */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}