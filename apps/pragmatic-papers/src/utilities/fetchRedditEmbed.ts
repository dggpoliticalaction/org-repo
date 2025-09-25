'use server'

import NodeCache from 'node-cache'

export interface RedditEmbedOptions {
  url: string
}

interface RedditEmbedData {
  title: string,
  html: string
}

const redditCache = new NodeCache()

async function getPost(options: RedditEmbedOptions): Promise<RedditEmbedData> {
  const queryParams = new URLSearchParams({
    url: options.url
  })
  const oembedUrl = `https://www.reddit.com/oembed?${queryParams.toString()}`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error(`Unable to fetch Reddit post: ${options.url}`)
  }
  return await res.json()
}

export async function fetchRedditEmbed(options: RedditEmbedOptions): Promise<RedditEmbedData | null> {
  const optsString = JSON.stringify(options)
  try {
    let data
    if (redditCache.has(optsString)) {
      data = redditCache.get(optsString)
    } else {
      data = await getPost(options)
      redditCache.set(optsString, data, 3600 * 4)
    }
    return data as RedditEmbedData
  } catch (exception) {
    console.error(exception)
    return null
  }
}