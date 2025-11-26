import React from 'react'
import { detectSocialPlatform } from '@/utilities/detectSocialPlatform'
import { BlueSkyEmbed } from '@/components/BlueSkyEmbed'
import { RedditEmbed } from '@/components/RedditEmbed'
import { TikTokEmbed } from '@/components/TikTokEmbed'
import { TwitterEmbed } from '@/components/TwitterEmbed'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
  hideMedia?: boolean | null
  hideThread?: boolean | null
} & SocialEmbedBlockProps

export const SocialEmbedBlock: React.FC<Props> = (props) => {
  if (!props.url) {
    return null
  }

  const platform = detectSocialPlatform(props.url)

  switch (platform) {
    case 'twitter':
      return (
        <TwitterEmbed
          url={props.url}
          hideMedia={props.hideMedia || false}
          hideThread={props.hideThread || false}
          align="center"
        />
      )
    case 'youtube':
      return <YouTubeEmbed url={props.url} />
    case 'reddit':
      return <RedditEmbed url={props.url} />
    case 'bluesky':
      return <BlueSkyEmbed url={props.url} />
    case 'tiktok':
      return <TikTokEmbed url={props.url} />
    default:
      return (
        <div className="text-gray-500">
          Unsupported URL. Please use a link from Twitter/X, YouTube, Reddit, BlueSky, or TikTok.
        </div>
      )
  }
}
