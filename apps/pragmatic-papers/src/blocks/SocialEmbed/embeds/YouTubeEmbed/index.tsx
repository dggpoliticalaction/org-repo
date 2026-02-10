import {
  fetchYouTubeOEmbed,
  sanitizeYouTubeHtml,
} from '@/blocks/SocialEmbed/adapters/youtube.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { getPlatformDisplayName } from '@/blocks/SocialEmbed/helpers/getPlatformDisplayName'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function YouTubeEmbedBlock({
  url,
  platform,
  snapshot,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const displayName = getPlatformDisplayName(platform)
  let html = snapshot?.html
  if (!html) {
    const result = await fetchYouTubeOEmbed({ url })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} displayName={displayName} />
    }
    html = await sanitizeYouTubeHtml(result.value.html)
  }

  return (
    <div className="my-8 flex justify-center">
      <div className="w-full max-w-[640px]">
        <div className="relative aspect-video">
          <div
            className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
