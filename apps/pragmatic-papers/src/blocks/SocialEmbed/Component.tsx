import { BlueskyEmbedBlock } from '@/blocks/SocialEmbed/embeds/BlueskyEmbed'
import { EmbedError } from '@/blocks/SocialEmbed/embeds/EmbedError'
import { RedditEmbedBlock } from '@/blocks/SocialEmbed/embeds/RedditEmbed'
import { TikTokEmbedBlock } from '@/blocks/SocialEmbed/embeds/TikTokEmbed'
import { TwitterEmbedBlock } from '@/blocks/SocialEmbed/embeds/TwitterEmbed'
import { YouTubeEmbedBlock } from '@/blocks/SocialEmbed/embeds/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps, SocialPlatform } from '@/payload-types'
import React from 'react'

type EmbedComponent = (props: SocialEmbedBlockProps) => React.ReactNode | Promise<React.ReactNode>

const embeds: Record<SocialPlatform, EmbedComponent> = {
  bluesky: (props: SocialEmbedBlockProps) => <BlueskyEmbedBlock {...props} />,
  reddit: (props: SocialEmbedBlockProps) => <RedditEmbedBlock {...props} />,
  tiktok: (props: SocialEmbedBlockProps) => <TikTokEmbedBlock {...props} />,
  twitter: (props: SocialEmbedBlockProps) => <TwitterEmbedBlock {...props} />,
  youtube: (props: SocialEmbedBlockProps) => <YouTubeEmbedBlock {...props} />,
}

export function getEmbedComponent(
  platform: SocialPlatform | string | null | undefined,
): EmbedComponent | null {
  if (!platform) return null
  return embeds[platform as SocialPlatform] ?? null
}

export function SocialEmbedBlock(
  props: SocialEmbedBlockProps,
): React.ReactNode | Promise<React.ReactNode> {
  const EmbedComponent = getEmbedComponent(props.platform)
  if (!EmbedComponent) {
    return (
      <EmbedError
        url={props.url}
        message="Embed platform is missing or unsupported."
        displayName={props.platform ?? 'unknown'}
      />
    )
  }
  return EmbedComponent(props)
}
