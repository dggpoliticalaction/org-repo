import type { SocialAdapter } from '@/blocks/SocialEmbed/adapters/base.adapter'
import { blueskyAdapter } from '@/blocks/SocialEmbed/adapters/bluesky.adapter'
import { twitterAdapter } from '@/blocks/SocialEmbed/adapters/twitter.adapter'
import type { SocialPlatform } from '@/payload-types'
import { tiktokAdapter } from './tiktok.adapter'
import { youtubeAdapter } from './youtube.adapter'

/**
 * Registry mapping social platforms to their adapters.
 * Add new platform adapters here as they are implemented.
 */
const adapters: Partial<Record<SocialPlatform, SocialAdapter>> = {
  bluesky: blueskyAdapter,
  tiktok: tiktokAdapter,
  twitter: twitterAdapter,
  youtube: youtubeAdapter,
  // TODO: Add adapters for other platforms as they are refactored
  // reddit: redditAdapter,
} as const

/**
 * Gets the adapter for a given platform.
 * @param platform - The social platform
 * @returns The adapter for the platform, or undefined if not found
 */
export function getAdapter(platform: SocialPlatform): SocialAdapter | undefined {
  return adapters[platform]
}
