import {
  BlueSkyEmbedBlock,
  RedditEmbedBlock,
  TikTokEmbedBlock,
  TwitterEmbedBlock,
  YouTubeEmbedBlock,
} from '@/blocks/SocialEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'
import { detectSocialPlatform, type SocialPlatform } from '@/utilities/detectSocialPlatform'
import React from 'react'

const EMBEDS = {
  youtube: (props: SocialEmbedBlockProps) => <YouTubeEmbedBlock {...props} />,
  twitter: (props: SocialEmbedBlockProps) => <TwitterEmbedBlock {...props} />,
  reddit: (props: SocialEmbedBlockProps) => <RedditEmbedBlock {...props} />,
  bluesky: (props: SocialEmbedBlockProps) => <BlueSkyEmbedBlock {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => <TikTokEmbedBlock {...props} />,
} satisfies Record<SocialPlatform, React.FC<SocialEmbedBlockProps>>

export const SocialEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  const platform = detectSocialPlatform(props.url)
  if (!platform) return null
  const EmbedComponent = EMBEDS[platform]
  return EmbedComponent ? <EmbedComponent {...props} /> : null
}
