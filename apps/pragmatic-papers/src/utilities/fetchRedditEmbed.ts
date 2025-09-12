'use server'

export interface RedditEmbedOptions {
  url: string
}

interface RedditEmbedData {
  title: string,
  html: string
}

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
  try {
    const data = await getPost(options)
    return data as RedditEmbedData
  } catch (exception) {
    console.error(exception)
    return null
  }
}