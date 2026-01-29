'use server'

import type {
  OEmbedRequestQuery,
  OEmbedRich,
  OEmbedThumbnail,
} from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Prettify } from '@/utilities/prettify'
import { failure, success, type Result } from '@/utilities/results'
import { sanitizeOEmbed } from '@/utilities/sanitizeOEmbed'

interface RedditOEmbedOptions extends OEmbedRequestQuery {
  parent?: boolean
  live?: boolean
  omitscript?: boolean
  revalidate?: number
}

type RedditResponse = Prettify<OEmbedRich & OEmbedThumbnail>

export async function fetchRedditEmbed({
  url,
  maxwidth = 550,
  revalidate = 60 * 60 * 24,
  parent = false,
  live = false,
  omitscript = true,
}: RedditOEmbedOptions): Promise<Result<string, Error>> {
  const endpoint = new URL('https://www.reddit.com/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('maxwidth', String(maxwidth))
  endpoint.searchParams.set('parent', String(parent))
  endpoint.searchParams.set('live', String(live))
  endpoint.searchParams.set('omitscript', String(omitscript))

  try {
    const res = await fetch(endpoint, { next: { revalidate } })
    if (!res.ok) throw new Error('Failed to fetch Reddit oEmbed.')

    const { html } = (await res.json()) as RedditResponse
    if (!html) throw new Error('Invalid Reddit oEmbed response.')

    return success(sanitizeOEmbed(html))
  } catch (err) {
    console.error('Error fetching Reddit oEmbed:', err)
    return failure(new Error('Failed to fetch Reddit oEmbed.'))
  }
}
