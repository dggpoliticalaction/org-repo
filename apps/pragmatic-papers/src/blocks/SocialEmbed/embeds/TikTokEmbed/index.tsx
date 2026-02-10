import { buildTikTokSrc, parseTikTokPostId } from '@/blocks/SocialEmbed/adapters/tiktok.adapter'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import type { SocialEmbedBlock } from '@/payload-types'

export async function TikTokEmbedBlock({
  url,
  snapshot,
}: SocialEmbedBlock): Promise<React.ReactNode> {
  const postId = parseTikTokPostId(url)
  if (!postId) {
    return <EmbedError url={url} message="Invalid TikTok URL" platform="TikTok" />
  }

  return (
    <div className="my-8 flex justify-center">
      <div className="relative w-full max-w-[360px] space-y-3">
        <div className="sr-only rounded-lg border p-3">
          <div className="text-sm font-medium">TikTok</div>
          {snapshot?.authorName && <div className="text-sm opacity-80">{snapshot.authorName}</div>}
          {snapshot?.title && <div className="mt-2 text-sm">{snapshot.title}</div>}
          <a
            className="mt-2 inline-block text-sm underline"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            View on TikTok
          </a>
        </div>
        <div className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-xl">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={buildTikTokSrc(postId, { autoplay: 1, loop: 1 })}
            title={snapshot?.title ?? 'TikTok video'}
            loading="lazy"
            // allow should be explicit
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            // sandbox optional;
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          />
        </div>
      </div>
    </div>
  )
}
