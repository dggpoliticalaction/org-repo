'use server'

import { isOEmbedRich, type OEmbedRequestQuery, type OEmbedRich } from '@/utilities/oEmbed'
import type { Prettify } from '@/utilities/prettify'
import { failure, type Result, success } from '@/utilities/results'
import { sanitizeOEmbed } from '@/utilities/sanitizeOEmbed'

export type BlueskyOEmbedResponse = Prettify<OEmbedRich & { url: string }>

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

type BlueskyOEmbedRequestQuery = OEmbedRequestQuery

export async function fetchBlueSkyEmbed(
  { url, maxwidth = 550 }: BlueskyOEmbedRequestQuery,
): Promise<Result<string, Error>> {
  if (!isBlueskyPostUrl(url)) return failure(new Error('Invalid Bluesky post URL.'))

  const endpoint = new URL('https://embed.bsky.app/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('format', 'json')
  endpoint.searchParams.set('maxwidth', String(maxwidth))

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!res.ok) return failure(new Error('Failed to fetch Bluesky oEmbed.'))

    const response = (await res.json()) as BlueskyOEmbedResponse

    if (!isOEmbedRich(response)) {
      return failure(new Error('Invalid oEmbed type.'))
    }

    return success(sanitizeOEmbed(response.html))
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
