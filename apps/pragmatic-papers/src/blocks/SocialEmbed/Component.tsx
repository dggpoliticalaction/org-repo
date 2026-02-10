import { BlueskyEmbedBlock } from '@/blocks/SocialEmbed/embeds/BlueskyEmbed'
import { RedditEmbedBlock } from '@/blocks/SocialEmbed/embeds/RedditEmbed'
import { TikTokEmbedBlock } from '@/blocks/SocialEmbed/embeds/TikTokEmbed'
import { TwitterEmbedBlock } from '@/blocks/SocialEmbed/embeds/TwitterEmbed'
import { YouTubeEmbedBlock } from '@/blocks/SocialEmbed/embeds/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps, SocialPlatform } from '@/payload-types'
import React from 'react'

const embeds: Record<SocialPlatform, React.FC<SocialEmbedBlockProps>> = {
  bluesky: (props: SocialEmbedBlockProps) => <BlueskyEmbedBlock {...props} />,
  reddit: (props: SocialEmbedBlockProps) => <RedditEmbedBlock {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => <TikTokEmbedBlock {...props} />,
  twitter: (props: SocialEmbedBlockProps) => <TwitterEmbedBlock {...props} />,
  youtube: (props: SocialEmbedBlockProps) => <YouTubeEmbedBlock {...props} />,
}

export function SocialEmbedBlock(props: SocialEmbedBlockProps): React.ReactNode {
  const EmbedComponent = embeds[props.platform]
  return <EmbedComponent {...props} />
}
