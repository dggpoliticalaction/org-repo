import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { RedditEmbedClient } from '@/blocks/SocialEmbed/RedditEmbed/client'
import type { SocialEmbedBlock } from '@/payload-types'
import { fetchRedditEmbed } from '@/utilities/fetchRedditEmbed'
import { isFailure } from '@/utilities/results'

export async function RedditEmbedBlock({ url }: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await fetchRedditEmbed({ url })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="Reddit" />
  }

  return <RedditEmbedClient html={result.value} />
}
