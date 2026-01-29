import { BlueSkyEmbedBlock } from '@/blocks/SocialEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps, SocialPlatform } from '@/payload-types'
import React from 'react'

const embeds = {
  youtube: (props: SocialEmbedBlockProps) => null, // <YouTubeEmbedBlock {...props} />,
  twitter: (props: SocialEmbedBlockProps) => null, // <TwitterEmbedBlock {...props} />,
  reddit: (props: SocialEmbedBlockProps) => null, // <RedditEmbedBlock {...props} />,
  bluesky: (props: SocialEmbedBlockProps) => <BlueSkyEmbedBlock {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => null, // <TikTokEmbedBlock {...props} />,
} satisfies Record<SocialPlatform, React.FC<SocialEmbedBlockProps>>

export const SocialEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  const EmbedComponent = embeds[props.platform]
  return <EmbedComponent {...props} />
}
