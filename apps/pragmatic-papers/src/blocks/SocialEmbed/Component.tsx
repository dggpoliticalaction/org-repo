import { BlueSkyEmbed } from '@/components/BlueSkyEmbed'
import { RedditEmbed } from '@/components/RedditEmbed'
import { TikTokEmbed } from '@/components/TikTokEmbed'
import { TwitterEmbed } from '@/components/TwitterEmbed'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'
import { detectSocialPlatform, type SocialPlatform } from '@/utilities/detectSocialPlatform'
import React from 'react'

const EMBEDS = {
  youtube: (props: SocialEmbedBlockProps) => <YouTubeEmbed {...props} />,
  twitter: (props: SocialEmbedBlockProps) => <TwitterEmbed {...props} />,
  reddit: (props: SocialEmbedBlockProps) => <RedditEmbed {...props} />,
  bluesky: (props: SocialEmbedBlockProps) => <BlueSkyEmbed {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => <TikTokEmbed {...props} />,
} satisfies Record<SocialPlatform, React.FC<SocialEmbedBlockProps>>

export const SocialEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  const platform = detectSocialPlatform(props.url)
  if (!platform) return null
  const EmbedComponent = EMBEDS[platform]
  return <EmbedComponent {...props} />
}
