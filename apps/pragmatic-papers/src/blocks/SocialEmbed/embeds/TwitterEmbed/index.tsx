import {
  fetchTwitterOEmbed,
  sanitizeTwitterHtml,
} from '@/blocks/SocialEmbed/adapters/twitter.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { TwitterEmbedClient } from '@/blocks/SocialEmbed/embeds/TwitterEmbed/client'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function TwitterEmbedBlock({
  url,
  snapshot,
  hideMedia,
  hideThread,
  id,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchTwitterOEmbed({ url, hideMedia, hideThread })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="X.com" />
    }
    html = await sanitizeTwitterHtml(result.value.html)
  }

  if (!id) {
    return <EmbedError url={url} message="Embed Block ID not found" platform="X.com" />
  }

  return (
    <div className="my-8 flex min-h-[240px] items-center justify-center">
      <div
        id={id}
        className="w-full max-w-[550px] [&>div]:!my-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <TwitterEmbedClient targetId={id} />
    </div>
  )
}
