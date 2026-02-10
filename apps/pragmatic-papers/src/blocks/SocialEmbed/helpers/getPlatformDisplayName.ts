import type { SocialPlatform } from '@/payload-types'

export function getPlatformDisplayName(platform: SocialPlatform): string {
  switch (platform) {
    case 'twitter':
      return 'X.com'
    case 'youtube':
      return 'YouTube'
    case 'bluesky':
      return 'Bluesky'
    case 'reddit':
      return 'Reddit'
    case 'tiktok':
      return 'TikTok'
    default:
      return platform
  }
}
