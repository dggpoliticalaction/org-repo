'use server'

import NodeCache from 'node-cache'

export interface YouTubeEmbedOptions {
  url: string,
  maxwidth?: number,
  maxheight?: number,
}

interface YouTubeEmbedData {
  html: string,
  thumbnail_url: string,
  author_name: string,
  author_url: string,
  width: number,
  height: number,
  provider_name: string,
  provider_url: string,
  type: string,
  version: string,
}

const youtubeCache = new NodeCache()

export async function fetchYouTubeEmbed(options: YouTubeEmbedOptions): Promise<YouTubeEmbedData | null> {
  const cacheKey = JSON.stringify(options)
  const cachedData = youtubeCache.get<YouTubeEmbedData>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const queryParams = new URLSearchParams({
    url: options.url,
  })
  
  if (options.maxwidth) {
    queryParams.set('maxwidth', options.maxwidth.toString())
  }
  
  if (options.maxheight) {
    queryParams.set('maxheight', options.maxheight.toString())
  }
  
  const oembedUrl = `https://www.youtube.com/oembed?${queryParams.toString()}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error(`Unable to fetch YouTube video: ${options.url} (status: ${res.status} ${res.statusText})`)
  }
  const data = await res.json() as YouTubeEmbedData
  youtubeCache.set(cacheKey, data)
  return data
}
