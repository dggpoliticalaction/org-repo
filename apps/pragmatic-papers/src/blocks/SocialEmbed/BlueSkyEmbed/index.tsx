import { BlueSkyEmbedClient } from '@/blocks/SocialEmbed/BlueSkyEmbed/client'
import { EmbedError } from '@/blocks/SocialEmbed/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'
import { fetchBlueSkyEmbed } from '@/utilities/fetchBlueSkyEmbed'
import { isFailure } from '@/utilities/results'

export async function BlueSkyEmbedBlock({ url }: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await fetchBlueSkyEmbed({ url })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="BlueSky" />
  }
  return <BlueSkyEmbedClient html={result.value} />
}
