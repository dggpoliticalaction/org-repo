'use server'

export interface BlueskyOEmbedResponse {
  type: 'rich'
  version: '1.0'
  author_name?: string
  author_url?: string
  provider_name: "Bluesky Social"
  provider_url: "https://bsky.app"
  cache_age: number
  width: number
  height: null
  html: string
}

function isBlueskyPostUrl(str: string): boolean {
  try {
    const url = new URL(str)
    if (url.hostname !== 'bsky.app') return false
    // Supported pattern: /profile/*/post/*
    return url.pathname.startsWith('/profile/') && url.pathname.includes('/post/')
  } catch {
    return false
  }
}

function parseBlockquote(html: string): string | null {
  const match = html.match(/<blockquote[\s\S]*?<\/blockquote>/i)
  return match?.[0] ?? null
}

export async function getBlueskyOEmbed(
  url: string,
  { maxWidth = 600, revalidate = 60 * 60 * 24 }: {
    maxWidth?: number
    revalidate?: number
  },
): Promise<string | null> {
  if (!isBlueskyPostUrl(url)) return null

  const endpoint = new URL('https://embed.bsky.app/oembed')
  endpoint.searchParams.set('format', 'json')
  endpoint.searchParams.set('maxwidth', String(maxWidth))
  endpoint.searchParams.set('url', url)

  try {
    const res = await fetch(endpoint, {
      next: { revalidate },
    })

    if (!res.ok) return null

    const { html } = (await res.json()) as BlueskyOEmbedResponse

    const blockquote = parseBlockquote(html)

    return blockquote
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching Bluesky OEmbed:', error.message)
    } else {
      console.error('Error fetching Bluesky OEmbed:', error)
    }
    return null
  }
}
