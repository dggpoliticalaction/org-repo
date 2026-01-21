import type { User } from '@/payload-types'
import type { Payload } from 'payload'

/**
 * Example URLs for each social media platform variation.
 * Based on the HOSTNAMES map in detectSocialPlatform.ts
 */
const SOCIAL_MEDIA_URLS = [
  // BlueSky variations
  {
    platform: 'bluesky',
    url: 'https://bsky.app/profile/destiny.gg/post/3lbjlth3tnc2k',
    label: 'BlueSky (bsky.app)',
  },

  // Twitter/X variations
  {
    platform: 'twitter',
    url: 'https://twitter.com/example/status/1234567890',
    label: 'Twitter (twitter.com)',
  },
  {
    platform: 'twitter',
    url: 'https://www.twitter.com/example/status/1234567890',
    label: 'Twitter (www.twitter.com)',
  },

  // YouTube variations
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    label: 'YouTube (www.youtube.com)',
  },
  {
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    label: 'YouTube (youtube.com)',
  },
  {
    platform: 'youtube',
    url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    label: 'YouTube (m.youtube.com)',
  },
  { platform: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', label: 'YouTube (youtu.be)' },

  // Reddit variations
  {
    platform: 'reddit',
    url: 'https://www.reddit.com/r/news/comments/jptqj9/joe_biden_elected_president_of_the_united_states/',
    label: 'Reddit Text Link',
  },
  {
    platform: 'reddit',
    url: 'https://www.reddit.com/r/pics/comments/5bx4bx/thanks_obama/',
    label: 'Reddit Image',
  },
  {
    platform: 'reddit',
    url: 'https://www.reddit.com/r/PublicFreakout/comments/laa59v/this_woman_from_myanmar_was_recording_her/',
    label: 'Reddit Video',
  },

  // TikTok variations
  {
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@rick.roll.everyday/video/7594372742758092054',
    label: 'TikTok (www.tiktok.com)',
  },
  {
    platform: 'tiktok',
    url: 'https://tiktok.com/@rick.roll.everyday/video/7594372742758092054',
    label: 'TikTok (tiktok.com)',
  },
  {
    platform: 'tiktok',
    url: 'https://m.tiktok.com/@rick.roll.everyday/video/7594372742758092054',
    label: 'TikTok (m.tiktok.com)',
  },
] as const

/**
 * Creates article content with all social media block variations.
 * Each social media URL is embedded as a block node in the Lexical editor.
 */
const createSocialEmbedContent = () => {
  const blocks = SOCIAL_MEDIA_URLS.map((item) => ({
    type: 'block' as const,
    fields: {
      blockType: 'socialEmbed' as const,
      url: item.url,
      // Only include hideMedia and hideThread for Twitter
      ...(item.platform === 'twitter' && {
        hideMedia: false,
        hideThread: true,
      }),
    },
    format: '' as const,
    version: 2,
  }))

  return {
    root: {
      type: 'root',
      children: [...blocks, {
        children: [],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      }],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Maps platform to legacy blockType
 */
const getLegacyBlockType = (platform: string): string => {
  switch (platform) {
    case 'twitter':
      return 'twitterEmbed'
    case 'youtube':
      return 'youtubeEmbed'
    case 'reddit':
      return 'redditEmbed'
    case 'bluesky':
      return 'blueSkyEmbed'
    case 'tiktok':
      return 'tiktokEmbed'
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

/**
 * Creates article content with legacy social media block variations.
 * Uses the old blockType structure (twitterEmbed, youtubeEmbed, etc.)
 */
const createLegacySocialEmbedContent = () => {
  const blocks = SOCIAL_MEDIA_URLS.map((item) => ({
    type: 'block' as const,
    fields: {
      blockType: getLegacyBlockType(item.platform) as
        | 'twitterEmbed'
        | 'youtubeEmbed'
        | 'redditEmbed'
        | 'blueSkyEmbed'
        | 'tiktokEmbed',
      url: item.url,
      // Only include hideMedia and hideThread for Twitter
      ...(item.platform === 'twitter' && {
        hideMedia: false,
        hideThread: false,
      }),
    },
    format: '' as const,
    version: 2,
  }))

  return {
    root: {
      type: 'root',
      children: [...blocks, {
        children: [],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      }],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export const createSocialEmbedArticle = async (payload: Payload, writer: User): Promise<number> => {
  if (!writer?.id) {
    throw new Error('Writer must have an ID')
  }

  const article = await payload.create({
    collection: 'articles',
    data: {
      title: 'Social Media Embed Test - All Variations',
      content: createSocialEmbedContent(),
      authors: [writer.id],
      _status: 'published',
      publishedAt: new Date().toISOString(),
      slug: 'social-media-embed-test-all-variations',
      meta: {
        title: 'Social Media Embed Test - All Variations',
        description:
          'Test article containing all possible social media block variations from the HOSTNAMES map.',
      },
    },
  })

  return article.id
}

export const createLegacySocialEmbedArticle = async (
  payload: Payload,
  writer: User,
): Promise<number> => {
  if (!writer?.id) {
    throw new Error('Writer must have an ID')
  }

  const article = await payload.create({
    collection: 'articles',
    data: {
      title: 'Legacy Social Media Embed Test - All Variations',
      content: createLegacySocialEmbedContent(),
      authors: [writer.id],
      _status: 'published',
      publishedAt: new Date().toISOString(),
      slug: 'legacy-social-media-embed-test-all-variations',
      meta: {
        title: 'Legacy Social Media Embed Test - All Variations',
        description:
          'Test article containing all legacy social media block variations using the old blockType structure (twitterEmbed, youtubeEmbed, etc.).',
      },
    },
  })

  return article.id
}
