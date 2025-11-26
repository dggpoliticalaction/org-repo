export type SocialPlatform = 'twitter' | 'youtube' | 'reddit' | 'bluesky' | 'tiktok' | 'unknown'

// Regex patterns for validating subdomains
// Only allow alphanumeric characters and hyphens as subdomain parts
const REDDIT_SUBDOMAIN_PATTERN = /^[a-z0-9-]+\.reddit\.com$/
const BLUESKY_SUBDOMAIN_PATTERN = /^[a-z0-9-]+\.bsky\.app$/

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

    // Reddit - explicitly list known subdomains or validate pattern
    if (
      hostname === 'reddit.com' ||
      hostname === 'www.reddit.com' ||
      hostname === 'old.reddit.com' ||
      hostname === 'new.reddit.com' ||
      hostname === 'np.reddit.com' ||
      REDDIT_SUBDOMAIN_PATTERN.test(hostname)
    ) {
      return 'reddit'
    }

    // BlueSky - explicitly list known domains or validate pattern
    if (
      hostname === 'bsky.app' ||
      hostname === 'www.bsky.app' ||
      BLUESKY_SUBDOMAIN_PATTERN.test(hostname)
    ) {
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
