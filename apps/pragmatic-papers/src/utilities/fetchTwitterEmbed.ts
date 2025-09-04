'use server'

import NodeCache from 'node-cache'

export interface TwitterEmbedOptions {
  url: string,
  maxwidth?: number,
  hide_media?: boolean,
  hide_thread?: boolean,
  align?: 'left' | 'right' | 'center' | 'none',
  lang?: string,
  theme?: 'light' | 'dark'
}

const DEFAULT_OPTIONS: TwitterEmbedOptions = {
  url: '',
  maxwidth: 550,
  hide_media: false,
  hide_thread: false,
  align: 'none',
  lang: 'en',
  theme: 'light'
}

interface TwitterEmbedData {
  url: string,
  author_name: string,
  author_url: string,
  html: string,
  width: number,
  height?: number,
  type: string,
  cache_age: number,
  provider_name: string,
  provider_url: string,
  version: string,
}

const twitterCache = new NodeCache()

async function getTweet(options: TwitterEmbedOptions): Promise<TwitterEmbedData> {
  const queryParams = new URLSearchParams({
    url: options.url,
    maxwidth: options.maxwidth!.toString(),
    hide_media: String(options.hide_media!),
    hide_thread: String(options.hide_thread!),
    align: options.align!,
    lang: options.lang!,
    theme: options.theme!,
    dnt: 'true',
  })
  const oembedUrl = `https://publish.twitter.com/oembed?${queryParams.toString()}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error(`Unable to fetch tweet: ${options.url}`)
  }
  return await res.json()
}

export async function fetchTwitterEmbed(options: TwitterEmbedOptions): Promise<TwitterEmbedData | null> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  const optsString = JSON.stringify(finalOptions)
  try {
    let data
    if (twitterCache.has(optsString)) {
      data = twitterCache.get(optsString)
    } else {
      data = await getTweet(finalOptions)
      twitterCache.set(optsString, data, data.cache_age)
    }
    return data as TwitterEmbedData
  } catch (exception) {
    console.error(exception)
    return null
  }
}
