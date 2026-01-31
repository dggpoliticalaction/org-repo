import {
  fetchYouTubeOEmbed,
  sanitizeYouTubeHtml,
} from '@/blocks/SocialEmbed/adapters/youtube.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function YouTubeEmbedBlock({ url, snapshot }: SocialEmbedBlock): Promise<React.ReactNode> {
  let html = snapshot?.html
  if (!html) {
    const result = await fetchYouTubeOEmbed({ url })
    if (isFailure(result)) {
      return <EmbedError url={url} message={result.error.message} platform="YouTube" />
    }
    html = await sanitizeYouTubeHtml(result.value.html)
  }

  return (
    <div className="my-4 flex justify-center">
      <div className="w-full max-w-[550px]">
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
