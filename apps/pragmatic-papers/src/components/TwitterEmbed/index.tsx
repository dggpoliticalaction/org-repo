'use client'

import type React from 'react';
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script';

import { fetchTwitterEmbed } from '@/utilities/fetchTwitterEmbed';

export const TwitterEmbed: React.FC<{
  url?: string,
  hideMedia?: boolean,
  hideThread?: boolean,
  align?: ('none' | 'left' | 'center' | 'right') | undefined,
  lang?: string | undefined,
  maxWidth?: number | undefined,
}> = (props) => {
  const [content, setContent] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.url) return
    fetchTwitterEmbed({
      url: props.url,
      hide_media: props.hideMedia,
      hide_thread: props.hideThread,
      align: props.align,
      lang: props.lang,
      maxwidth: props.maxWidth
    })
      .then(res => {
        if (!res) {
          setContent('X post could not be loaded.')
        } else {
          setContent(res.html)
        }
      })
  }, [props])

  useEffect(() => {
    if (contentRef.current && window.twttr) {
      setTimeout(() => window.twttr.widgets.load(contentRef.current), 2000)
    }
  }, [content])

  return (
    <div>
      <Script src="https://platform.twitter.com/widgets.js" />
      <div dangerouslySetInnerHTML={{ __html: content }} ref={contentRef} />
    </div>
  )
}
