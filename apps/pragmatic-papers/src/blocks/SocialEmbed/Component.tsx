import { BlueskyEmbedBlock } from '@/blocks/SocialEmbed/embeds/BlueskyEmbed'
import { TwitterEmbedBlock } from '@/blocks/SocialEmbed/embeds/TwitterEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps, SocialPlatform } from '@/payload-types'
import React from 'react'

const embeds: Record<SocialPlatform, React.FC<SocialEmbedBlockProps>> = {
  bluesky: (props: SocialEmbedBlockProps) => <BlueskyEmbedBlock {...props} />,
  reddit: (props: SocialEmbedBlockProps) => null, // <RedditEmbedBlock {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => null, // <TikTokEmbedBlock {...props} />,
  twitter: (props: SocialEmbedBlockProps) => <TwitterEmbedBlock {...props} />,
  youtube: (props: SocialEmbedBlockProps) => null, // <YouTubeEmbedBlock {...props} />,
}

export function SocialEmbedBlock(props: SocialEmbedBlockProps): React.ReactNode {
  const EmbedComponent = embeds[props.platform]
  return <EmbedComponent {...props} />
}
