import { BlueskyEmbedBlock } from "@/blocks/SocialEmbed/embeds/BlueskyEmbed"
import { EmbedError } from "@/blocks/SocialEmbed/embeds/EmbedError"
import { RedditEmbedBlock } from "@/blocks/SocialEmbed/embeds/RedditEmbed"
import { TikTokEmbedBlock } from "@/blocks/SocialEmbed/embeds/TikTokEmbed"
import { TwitterEmbedBlock } from "@/blocks/SocialEmbed/embeds/TwitterEmbed"
import { YouTubeEmbedBlock } from "@/blocks/SocialEmbed/embeds/YouTubeEmbed"
import { getPlatformDisplayName } from "@/blocks/SocialEmbed/helpers/getPlatformDisplayName"
import { shouldRevalidate } from "@/blocks/SocialEmbed/helpers/snapshotFreshness"
import type { ParentDocContext } from "@/blocks/SocialEmbed/types"
import type { SocialEmbedBlock as SocialEmbedBlockProps, SocialPlatform } from "@/payload-types"
import React from "react"

export type SocialEmbedRenderProps = SocialEmbedBlockProps & {
  parentDoc?: ParentDocContext
}

type EmbedComponent = (props: SocialEmbedRenderProps) => React.ReactNode | Promise<React.ReactNode>

const embeds: Record<SocialPlatform, EmbedComponent> = {
  bluesky: BlueskyEmbedBlock,
  reddit: RedditEmbedBlock,
  tiktok: TikTokEmbedBlock,
  twitter: TwitterEmbedBlock,
  youtube: YouTubeEmbedBlock,
} as const

export function getEmbedBlock(platform: SocialPlatform): EmbedComponent | null {
  return embeds[platform] ?? null
}

export async function SocialEmbedBlock(props: SocialEmbedRenderProps): Promise<React.ReactNode> {
  const displayName = getPlatformDisplayName(props.platform)
  const EmbedBlock = getEmbedBlock(props.platform)
  if (!EmbedBlock) {
    return (
      <EmbedError
        url={props.url}
        message="Social Media platform is not supported."
        displayName={displayName}
      />
    )
  }

  let snapshot = props.snapshot
  if (shouldRevalidate(props.snapshot) && props.parentDoc && props.id) {
    const { revalidateSnapshot } = await import("@/blocks/SocialEmbed/hooks/revalidateSnapshot")
    snapshot = await revalidateSnapshot({
      parentDoc: props.parentDoc,
      embedBlockId: props.id,
      platform: props.platform,
      url: props.url,
      snapshot: props.snapshot,
    })
  }

  return <EmbedBlock {...props} snapshot={snapshot} />
}
