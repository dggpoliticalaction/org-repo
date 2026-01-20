import { getTwitterOEmbed } from '@/blocks/SocialEmbed/TwitterEmbed/getTwitterOEmbed'
import { TwitterOEmbedClient } from '@/blocks/SocialEmbed/TwitterEmbed/TwitterOEmbedClient'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function TwitterOEmbedBlock({
  url,
  hideMedia,
  hideThread,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await getTwitterOEmbed({ url, hideMedia, hideThread })

  if (isFailure(result)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
        {result.error.message} View on Twitter
      </a>
    )
  }

  return <TwitterOEmbedClient html={result.value} />
}
