// src/blocks/SocialEmbed/TikTokEmbed/TikTokPlayerBlock.tsx (Server Component)

import { createTikTokSrc, fetchTikTokEmbed, parseTikTokPostId } from '@/utilities/fetchTikTokEmbed'
import { isFailure } from '@/utilities/results'
import { EmbedError } from '../EmbedError'

export async function TikTokEmbedBlock({ url }: { url: string }): Promise<React.ReactNode> {
  const result = await fetchTikTokEmbed(url)

  if (isFailure(result)) {
    return <EmbedError url={url} message={result.error.message} platform="TikTok" />
  }

  const postId = parseTikTokPostId(url)
  if (!postId) {
    return <EmbedError url={url} message="Invalid TikTok URL" platform="TikTok" />
  }

  return (
    <div className="my-4 flex justify-center">
      <div className="w-full max-w-[360px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-xl">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={createTikTokSrc(postId, { autoplay: 1, loop: 1 })}
            title="TikTok video"
            loading="lazy"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  )
}
