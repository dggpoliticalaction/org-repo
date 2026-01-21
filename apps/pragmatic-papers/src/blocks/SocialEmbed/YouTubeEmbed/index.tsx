import { EmbedError } from '@/blocks/SocialEmbed/EmbedError'
import { getYouTubeOEmbed } from '@/blocks/SocialEmbed/YouTubeEmbed/getYouTubeOEmbed'
import type { SocialEmbedBlock } from '@/payload-types'
import { isFailure } from '@/utilities/results'

export async function YouTubeOEmbedBlock({ url }: SocialEmbedBlock): Promise<React.ReactNode> {
  const result = await getYouTubeOEmbed({ url })

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="YouTube" />
  }

  return (
    <div className="my-4 flex justify-center">
      <div className="w-full max-w-[550px]">
        <div className="relative aspect-video">
          <div
            className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: result.value }}
          />
        </div>
      </div>
    </div>
  )
}
