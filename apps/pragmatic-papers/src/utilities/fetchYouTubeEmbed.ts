'use server'

import {
  isOEmbedVideo,
  type OEmbedRequestQuery,
  type OEmbedVideo,
} from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Prettify } from '@/utilities/prettify'
import { failure, type Result, success } from '@/utilities/results'

type YouTubeOEmbedOptions = OEmbedRequestQuery & { revalidate?: number }

type YouTubeResponse = Prettify<OEmbedVideo>

function keepOnlyIframe(html: string): string | null {
  // Very strict: extract the first iframe and discard everything else.
  const match = html.match(/<iframe[\s\S]*?<\/iframe>/i)
  return match ? match[0] : null
}

export async function fetchYouTubeEmbed({
  url,
  maxwidth = 550,
  maxheight,
  revalidate = 60 * 60 * 24,
}: YouTubeOEmbedOptions): Promise<Result<string, Error>> {
  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('format', 'json')
  endpoint.searchParams.set('maxwidth', String(maxwidth))
  if (maxheight) endpoint.searchParams.set('maxheight', String(maxheight))

  try {
    const res = await fetch(endpoint, { next: { revalidate } })
    if (!res.ok) throw new Error('Failed to fetch YouTube oEmbed.')

    const data = (await res.json()) as YouTubeResponse
    if (!isOEmbedVideo(data)) throw new Error('Invalid oEmbed type.')

    const iframe = keepOnlyIframe(data.html)
    if (!iframe) throw new Error('No iframe found.')

    return success(iframe)
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
