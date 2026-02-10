import { fetchRedditOEmbed, sanitizeRedditHtml } from '@/blocks/SocialEmbed/adapters/reddit.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { RedditEmbedClient } from '@/blocks/SocialEmbed/embeds/RedditEmbed/client'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function RedditEmbedBlock({
  url,
  snapshot,
  id,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchRedditOEmbed({ url, maxwidth: 550 })

    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="Reddit" />
    }

    html = await sanitizeRedditHtml(result.value.html)
  }

  if (!id) {
    return <EmbedError url={url} message="Embed Block ID not found" platform="Reddit" />
  }

  return (
    <div className="my-8 flex min-h-[240px] items-center justify-center">
      <div
        id={id}
        className="w-full max-w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <RedditEmbedClient targetId={id} />
    </div>
  )
}
