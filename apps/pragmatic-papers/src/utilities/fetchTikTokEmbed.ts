import type { OEmbedThumbnail, OEmbedVideo } from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Prettify } from '@/utilities/prettify'
import { failure, success, type Result } from '@/utilities/results'
import { sanitizeOEmbed } from '@/utilities/sanitizeOEmbed'

export function parseTikTokPostId(input: string): string | null {
  if (!URL.canParse(input)) return null
  return new URL(input).pathname.match(/\/video\/(\d+)/)?.[1] ?? null
}

interface TikTokIFrameSettings {
  controls?: 0 | 1
  progress_bar?: 0 | 1
  play_button?: 0 | 1
  volume_control?: 0 | 1
  fullscreen_button?: 0 | 1
  timestamp?: 0 | 1
  loop?: 0 | 1
  autoplay?: 0 | 1
  music_info?: 0 | 1
  description?: 0 | 1
  rel?: 0 | 1
  native_context_menu?: 0 | 1
  closed_caption?: 0 | 1
}

export function createTikTokSrc(postId: string, settings: TikTokIFrameSettings = {}): string {
  const {
    controls = 1,
    progress_bar = 1,
    play_button = 1,
    volume_control = 1,
    fullscreen_button = 1,
    timestamp = 1,
    loop = 0,
    autoplay = 0,
    music_info = 0,
    description = 0,
    rel = 1,
    native_context_menu = 1,
    closed_caption = 1,
  } = settings
  const src = new URL(`https://www.tiktok.com/player/v1/${postId}`)
  src.searchParams.set('controls', String(controls))
  src.searchParams.set('progress_bar', String(progress_bar))
  src.searchParams.set('play_button', String(play_button))
  src.searchParams.set('volume_control', String(volume_control))
  src.searchParams.set('fullscreen_button', String(fullscreen_button))
  src.searchParams.set('timestamp', String(timestamp))
  src.searchParams.set('loop', String(loop))
  src.searchParams.set('autoplay', String(autoplay))
  src.searchParams.set('music_info', String(music_info))
  src.searchParams.set('description', String(description))
  src.searchParams.set('rel', String(rel))
  src.searchParams.set('native_context_menu', String(native_context_menu))
  src.searchParams.set('closed_caption', String(closed_caption))
  return src.toString()
}

/**
 * Patch the TikTok URL to the correct hostname.
 * Because TikTok doesn't support the `tiktok.com` hostname without a subdomain prefix in the oEmbed endpoint.
 */
function patchTikTokUrl(url: string): string {
  const urlNext = new URL(url)
  if (urlNext.hostname === 'tiktok.com') {
    urlNext.hostname = 'www.tiktok.com'
  }
  return urlNext.toString()
}

type TikTokResponse = Prettify<OEmbedVideo & OEmbedThumbnail>

interface TikTokEmbedOptions {
  revalidate?: number
}

export async function fetchTikTokEmbed(
  url: string,
  options: TikTokEmbedOptions = {},
): Promise<Result<{ html: string }, Error>> {
  const { revalidate = 60 * 60 * 24 } = options

  const endpoint = new URL('https://www.tiktok.com/oembed')
  endpoint.searchParams.set('url', patchTikTokUrl(url))

  try {
    const res = await fetch(endpoint, { next: { revalidate } })
    if (!res.ok) throw new Error('Failed to fetch TikTok oEmbed.')

    const { html } = (await res.json()) as TikTokResponse
    if (!html) throw new Error('Invalid TikTok oEmbed response.')

    return success({ html: sanitizeOEmbed(html) })
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
