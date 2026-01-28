'use server'

import NodeCache from 'node-cache'

export interface TikTokEmbedOptions {
  url: string
}

interface TikTokEmbedData {
  version: string
  type: string
  title: string
  author_url: string
  author_name: string
  width: string
  height: string
  html: string
  thumbnail_width: number
  thumbnail_height: number
  thumbnail_url: string
  provider_url: string
  provider_name: string
}

const tiktokCache = new NodeCache()

async function getTikTok(options: TikTokEmbedOptions): Promise<TikTokEmbedData> {
  const queryParams = new URLSearchParams({
    url: options.url,
  })
  const oembedUrl = `https://www.tiktok.com/oembed?${queryParams.toString()}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error(`Unable to fetch TikTok video: ${options.url}`)
  }
  return await res.json()
}

export async function fetchTikTokEmbed(
  options: TikTokEmbedOptions,
): Promise<TikTokEmbedData | null> {
  const optsString = JSON.stringify(options)
  try {
    let data
    if (tiktokCache.has(optsString)) {
      data = tiktokCache.get(optsString)
    } else {
      data = await getTikTok(options)
      tiktokCache.set(optsString, data, 3600 * 4)
    }
    return data as TikTokEmbedData
  } catch (exception) {
    console.error(exception)
    return null
  }
}
