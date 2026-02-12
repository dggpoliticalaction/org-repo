import { fetchRedditOEmbed, sanitizeRedditHtml } from '@/blocks/SocialEmbed/adapters/reddit.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { RedditEmbedClient } from '@/blocks/SocialEmbed/embeds/RedditEmbed/client'
import { getPlatformDisplayName } from '@/blocks/SocialEmbed/helpers/getPlatformDisplayName'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function RedditEmbedBlock({
  url,
  platform,
  snapshot,
  id,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const displayName = getPlatformDisplayName(platform)

  let html = snapshot?.html
  if (!html) {
    const result = await fetchRedditOEmbed({ url })

    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} displayName={displayName} />
    }

    html = await sanitizeRedditHtml(result.value.html)
  }

  if (!id) {
    return <EmbedError url={url} message="Embed Block ID not found" displayName={displayName} />
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
