import { getTwitterOEmbed } from '@/blocks/SocialEmbed/TwitterEmbed/getTwitterOEmbed'
import { TwitterOEmbedClient } from '@/blocks/SocialEmbed/TwitterEmbed/TwitterOEmbedClient'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'
import { EmbedError } from '../EmbedError'

export async function TwitterOEmbedBlock({
  url,
  hideMedia,
  hideThread,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await getTwitterOEmbed({ url, hideMedia, hideThread })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="X.com" />
  }

  return <TwitterOEmbedClient html={result.value} />
}
