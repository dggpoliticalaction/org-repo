import { TwitterEmbedClient } from '@/blocks/SocialEmbed/TwitterEmbed/client'
import type { SocialEmbedBlock } from '@/payload-types'
import { fetchTwitterEmbed } from '@/utilities/fetchTwitterEmbed'
import { isFailure } from '@/utilities/results'
import { EmbedError } from '../EmbedError'

export async function TwitterEmbedBlock({
  url,
  hideMedia,
  hideThread,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await fetchTwitterEmbed({ url, hideMedia, hideThread })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="X.com" />
  }

  return <TwitterEmbedClient html={result.value} />
}
