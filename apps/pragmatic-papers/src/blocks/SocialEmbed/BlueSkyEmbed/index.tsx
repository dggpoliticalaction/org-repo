import { isFailure } from '@/utilities/results'
import { BlueSkyOEmbedClient } from './BlueSkyOEmbedClient'
import { getBlueskyOEmbed } from './getBlueskyOEmbed'

export async function BlueSkyOEmbedBlock({ url }: { url: string }): Promise<React.ReactNode> {
  const result = await getBlueskyOEmbed({ url })

  if (isFailure(result)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-center w-full">
        {result.error.message} View on Bluesky
      </a>
    )
  }

  return <BlueSkyOEmbedClient html={result.value} />
}
