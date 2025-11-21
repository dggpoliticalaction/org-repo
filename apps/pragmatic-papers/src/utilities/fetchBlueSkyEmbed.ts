'use server'

import NodeCache from 'node-cache'

export interface BlueSkyEmbedOptions {
  url: string
  maxwidth?: number
  theme?: 'light' | 'dark'
}

const DEFAULT_OPTIONS: BlueSkyEmbedOptions = {
  url: '',
  maxwidth: 550,
  theme: 'light',
}

interface BlueSkyEmbedData {
  url: string
  html: string
  width: number
  height?: number
  type: string
  version: string
}

const blueSkyCache = new NodeCache({ stdTTL: 3600 * 4, checkperiod: 600 })

async function getBlueSkyPost(options: BlueSkyEmbedOptions): Promise<BlueSkyEmbedData> {
  const queryParams = new URLSearchParams({
    url: options.url,
  })

  if (options.maxwidth) {
    queryParams.set('maxwidth', options.maxwidth.toString())
  }

  if (options.theme) {
    queryParams.set('theme', options.theme)
  }

  const oembedUrl = `https://embed.bsky.app/oembed?${queryParams.toString()}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error(`Unable to fetch Bluesky post: ${options.url}`)
  }
  return await res.json()
}

export async function fetchBlueSkyEmbed(
  options: BlueSkyEmbedOptions,
): Promise<BlueSkyEmbedData | null> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  const optsString = JSON.stringify(finalOptions)
  try {
    let data
    if (blueSkyCache.has(optsString)) {
      data = blueSkyCache.get(optsString)
    } else {
      data = await getBlueSkyPost(finalOptions)
      blueSkyCache.set(optsString, data)
    }
    return data as BlueSkyEmbedData
  } catch (exception) {
    console.error(exception)
    return null
  }
}
