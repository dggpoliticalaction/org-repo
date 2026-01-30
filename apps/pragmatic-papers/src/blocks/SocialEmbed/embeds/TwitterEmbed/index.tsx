import {
  fetchTwitterOEmbed,
  sanitizeTwitterHtml,
} from '@/blocks/SocialEmbed/adapters/twitter.adapter'
import { TwitterEmbedClient } from '@/blocks/SocialEmbed/embeds/TwitterEmbed/client'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'
import { EmbedError } from '../EmbedError'

export async function TwitterEmbedBlock({
  url,
  snapshot,
  hideMedia,
  hideThread,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchTwitterOEmbed({ url, hideMedia, hideThread })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="X.com" />
    }
    html = await sanitizeTwitterHtml(result.value.html)
  }

  return <TwitterEmbedClient html={html} />
}
