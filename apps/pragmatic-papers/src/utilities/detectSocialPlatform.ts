export type SocialPlatform = 'twitter' | 'youtube' | 'reddit' | 'bluesky' | 'tiktok' | 'unknown'

/**
 * Detects the social media platform from a URL
 * @param url - The URL to analyze
 * @returns The detected platform or 'unknown' if not recognized
 */
export function detectSocialPlatform(url: string): SocialPlatform {
  if (!url) return 'unknown'

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Twitter/X
    if (
      hostname === 'twitter.com' ||
      hostname === 'www.twitter.com' ||
      hostname === 'x.com' ||
      hostname === 'www.x.com'
    ) {
      return 'twitter'
    }

    // YouTube
    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    ) {
      return 'youtube'
    }

    // Reddit
    if (
      hostname === 'reddit.com' ||
      hostname === 'www.reddit.com' ||
      hostname === 'old.reddit.com' ||
      hostname.endsWith('.reddit.com')
    ) {
      return 'reddit'
    }

    // BlueSky
    if (hostname === 'bsky.app' || hostname === 'www.bsky.app' || hostname.endsWith('.bsky.app')) {
      return 'bluesky'
    }

    // TikTok
    if (
      hostname === 'tiktok.com' ||
      hostname === 'www.tiktok.com' ||
      hostname === 'm.tiktok.com' ||
      hostname === 'vm.tiktok.com'
    ) {
      return 'tiktok'
    }

    return 'unknown'
  } catch {
    // Invalid URL
    return 'unknown'
  }
}
