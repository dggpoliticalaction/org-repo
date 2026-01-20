import { BlueSkyOEmbedClient } from './BlueSkyOEmbedClient'
import { getBlueskyOEmbed } from './getBlueskyOEmbed'

export async function BlueSkyOEmbedBlock({ url }: { url: string }): Promise<React.ReactNode> {
  const blockquote = await getBlueskyOEmbed(url, { maxWidth: 600, revalidate: 3600 })

  if (!blockquote) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
        View on Bluesky
      </a>
    )
  }

  return <BlueSkyOEmbedClient blockquote={blockquote} />
}
