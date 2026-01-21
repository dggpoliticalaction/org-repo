import { BlueSkyOEmbedClient } from '@/blocks/SocialEmbed/BlueSkyEmbed/BlueSkyOEmbedClient'
import { getBlueskyOEmbed } from '@/blocks/SocialEmbed/BlueSkyEmbed/getBlueskyOEmbed'
import { EmbedError } from '@/blocks/SocialEmbed/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function BlueSkyOEmbedBlock({ url }: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await getBlueskyOEmbed({ url })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="BlueSky" />
  }
  return <BlueSkyOEmbedClient html={result.value} />
}
