import {
  fetchBlueskyOEmbed,
  sanitizeBlueskyHtml,
} from '@/blocks/SocialEmbed/adapters/bluesky.adapter'
import { BlueskyEmbedClient } from '@/blocks/SocialEmbed/embeds/BlueskyEmbed/client'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function BlueskyEmbedBlock({
  url,
  snapshot,
  id,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchBlueskyOEmbed({ url, maxwidth: 550 })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="Bluesky" />
    }
    html = await sanitizeBlueskyHtml(result.value.html)
  }

  const targetId = id!

  return (
    <div className="my-4 flex min-h-[480px] items-center justify-center">
      <div
        id={targetId}
        className="w-full max-w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <BlueskyEmbedClient targetId={targetId} />
    </div>
  )
}
