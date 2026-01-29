import {
  fetchBlueskyOEmbed,
  sanitizeBlueskyHtml,
} from '@/blocks/SocialEmbed/adapters/bluesky.adapter'
import { BlueSkyEmbedClient } from '@/blocks/SocialEmbed/BlueSkyEmbed/client'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function BlueSkyEmbedBlock({
  url,
  snapshot,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchBlueskyOEmbed({ url, maxwidth: 550 })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="Bluesky" />
    }
    html = await sanitizeBlueskyHtml(result.value.html)
  }

  return <BlueSkyEmbedClient html={html} />
}
