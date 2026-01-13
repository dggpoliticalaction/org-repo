'use client'

import Script from 'next/script'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { fetchTwitterEmbed } from '@/utilities/fetchTwitterEmbed'
import { sanitizeHtml } from '@/utilities/sanitizeHtml'

/**
 * Twitter embed component.
 * @param props - The props for the Twitter embed component.
 * @returns The Twitter embed component.
 */
export const TwitterEmbedBlock: React.FC<{
  url?: string
  hideMedia?: boolean | null
  hideThread?: boolean | null
  align?: ('none' | 'left' | 'center' | 'right') | undefined
  lang?: string | undefined
  maxWidth?: number | undefined
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return

    const theme = document.getElementsByTagName('html')[0]?.getAttribute('data-theme') ?? 'dark'

    fetchTwitterEmbed({
      url: props.url,
      hide_media: props.hideMedia ?? false,
      hide_thread: props.hideThread ?? false,
      align: props.align || 'center',
      maxwidth: props.maxWidth,
      theme: theme as 'light' | 'dark',
    }).then((res) => {
      if (!res) {
        setContent('X post could not be loaded.')
      } else {
        setContent(sanitizeHtml(res.html))
      }
    })
  }, [props])

  useEffect(() => {
    if (contentRef.current && window.twttr) {
      // There's a race condition where the content returned by oEmbed needs to be inserted into the page, after which
      // the twitter JS will load it and render it as an embed instead of just a blockquote. Providing this timeout
      // helps to make sure the JS has actually loaded.
      setTimeout(() => window.twttr.widgets.load(contentRef.current), 1000)
    }
  }, [content])

  return (
    <div>
      <Script src="https://platform.twitter.com/widgets.js" />
      {/* HTML is sanitized with DOMPurify before insertion */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: content }} ref={contentRef} />
    </div>
  )
}
