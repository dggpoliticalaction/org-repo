'use server'

import { isOEmbedRich, type OEmbedRequestQuery, type OEmbedRich } from '@/utilities/oEmbed'
import { failure, success, type Result } from '@/utilities/results'
import { sanitizeOEmbed } from '@/utilities/sanitizeOEmbed'

/**
 * https://developer.x.com/en/docs/x-for-websites/oembed-api
 */
interface TwitterOEmbedRequestQuery extends OEmbedRequestQuery {
  hideMedia?: boolean | null
  hideThread?: boolean | null
  omitScript?: boolean
  align?: 'left' | 'right' | 'center' | 'none'
  lang?:
    | 'en'
    | 'ar'
    | 'bn'
    | 'cs'
    | 'da'
    | 'de'
    | 'el'
    | 'es'
    | 'fa'
    | 'fi'
    | 'fil'
    | 'fr'
    | 'he'
    | 'hi'
    | 'hu'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'msa'
    | 'nl'
    | 'no'
    | 'pl'
    | 'pt'
    | 'ro'
    | 'ru'
    | 'sv'
    | 'th'
    | 'tr'
    | 'uk'
    | 'ur'
    | 'vi'
    | 'zh-cn'
    | 'zh-tw'
  theme?: 'light' | 'dark'
  dnt?: boolean
  revalidate?: number
}

interface TwitterOEmbedResponse extends OEmbedRich {
  url: string
}

export async function fetchTwitterEmbed({
  url,
  maxwidth = 550,
  hideMedia = false,
  hideThread = true,
  omitScript = true,
  align = 'none',
  lang = 'en',
  theme = 'light',
  dnt = true,
  revalidate = 60 * 60 * 24,
}: TwitterOEmbedRequestQuery): Promise<Result<string, Error>> {
  const endpoint = new URL('https://publish.twitter.com/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('maxwidth', String(maxwidth))
  endpoint.searchParams.set('hide_media', String(hideMedia))
  endpoint.searchParams.set('hide_thread', String(hideThread))
  endpoint.searchParams.set('omit_script', String(omitScript))
  endpoint.searchParams.set('align', align)
  endpoint.searchParams.set('lang', lang)
  endpoint.searchParams.set('theme', theme)
  endpoint.searchParams.set('dnt', String(dnt))

  try {
    const res = await fetch(endpoint, { next: { revalidate } })

    if (!res.ok) {
      throw new Error('Something went wrong.')
    }

    const response = (await res.json()) as TwitterOEmbedResponse

    if (!isOEmbedRich(response)) {
      throw new Error('Invalid oEmbed type.')
    }

    return success(sanitizeOEmbed(response.html))
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
